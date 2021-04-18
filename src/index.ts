import type * as BabelCore from '@babel/core';
import normalizeModuleAndLoadMetadata from '@babel/helper-module-transforms/lib/normalize-and-load-metadata';
import * as micromatch from 'micromatch';
import * as Path from 'upath';

interface PluginContext {
  types: typeof BabelCore.types
  template: typeof BabelCore.template
}

type PluginFactory = (babel: PluginContext) => BabelCore.PluginObj;

function definePlugin(factory: PluginFactory) {
  return factory;
}

export interface PluginOptions {
  factory: string;
  basepath?: string;
  includes?: string[];
  impureFactory?: boolean;
  factoryImportName?: string;
  mapFilename?: (filename: string, state: BabelCore.PluginPass) => string
}

export default definePlugin(({ types: t, template }) => {
  const importDeclaration = template.statement(
    'import { %%factoryImportName%% as %%factoryIdentifier%% } from %%factory%%',
  );

  function exportNamedDeclaration(source: string, specifier: any) {
    return t.exportNamedDeclaration(
      null,
      [specifier],
      t.stringLiteral(source),
    );
  }

  return {
    visitor: {
      Program(path, state) {
        const options = state.opts as PluginOptions;

        const relative = Path.relative(Path.resolve(options.basepath || ''), state.filename);
        if (options.includes && !micromatch.isMatch(relative, options.includes)) {
          return;
        }

        const exportDeclaration = template.statement(
          'export var %%exportName%% = /*#__PURE__*/ %%factoryIdentifier%%(%%filename%%, %%exportNameStr%%)',
          { preserveComments: !options.impureFactory },
        );

        const exportDefaultDeclaration = template.statement(
          'export default /*#__PURE__*/ %%factoryIdentifier%%(%%filename%%, %%exportNameStr%%)',
          { preserveComments: !options.impureFactory },
        );

        let filename = relative;
        if (options.mapFilename) {
          filename = options.mapFilename(filename, state);
        }

        const factoryIdentifier = path.scope.generateUidIdentifier('factory');
        const filenameIdentifier = path.scope.generateUidIdentifier('filename');

        const body: BabelCore.Node[] = [];

        // import factory
        body.push(importDeclaration({
          factory: t.stringLiteral(options.factory),
          factoryImportName: t.identifier(options.factoryImportName || 'default'),
          factoryIdentifier,
        }));

        // var filename = 'filename'
        body.push(t.variableDeclaration('var', [
          t.variableDeclarator(
            filenameIdentifier,
            t.stringLiteral(filename),
          ),
        ]));

        const metadata = normalizeModuleAndLoadMetadata(path);

        // re-exports
        for (const [source, item] of metadata.source.entries()) {
          if (item.reexportAll) {
            body.push(t.exportAllDeclaration(t.stringLiteral(source)));
          }
          for (const [remote, local] of item.reexports) {
            body.push(exportNamedDeclaration(
              source,
              t.exportSpecifier(t.identifier(local), t.identifier(remote)),
            ));
          }
          for (const name of item.reexportNamespace) {
            body.push(exportNamedDeclaration(
              source,
              t.exportNamespaceSpecifier(t.identifier(name)),
            ));
          }
        }

        // local exports
        for (const item of metadata.local.values()) {
          for (const name of item.names) {
            let stmt: BabelCore.types.Statement;
            if (name === 'default') {
              stmt = exportDefaultDeclaration({
                factoryIdentifier,
                filename: filenameIdentifier,
                exportNameStr: t.stringLiteral(name),
              });
            } else {
              stmt = exportDeclaration({
                factoryIdentifier,
                filename: filenameIdentifier,
                exportName: t.identifier(name),
                exportNameStr: t.stringLiteral(name),
              });
            }
            body.push(t.cloneNode(stmt, true, true));
          }
        }

        path.set('body', body as any);
      },
    },
  };
});
