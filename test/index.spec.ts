import * as path from 'upath';
import * as babel from '@babel/core';
import plugin, { PluginOptions } from '../src';

function run(name: string, code: string, options?: Partial<PluginOptions>) {
  it(name, () => {
    const res = babel.transformSync(code, {
      configFile: false,
      filename: path.resolve('test/test.js'),
      plugins: [[plugin, { factory: 'foo', ...options }]],
    });
    expect(res.code).toMatchSnapshot();
  });
}

describe('transform', () => {
  run('variable declarations', 'export const foo = 1;');

  run('class declarations', 'export class Foo {}');

  run('function declarations', 'export function foo() {}');

  run('locals', `
    const foo = 1;
    export { foo };
  `);

  run('default export', 'export default foo;');

  run('multiple', `
    export const { foo, bar } = baz;
    export { foo as bak };
    export default baz;
  `);

  run('reexport', `
    import * as foo from 'foo';
    export { foo as bar }

    export { remote as local } from 'bar'

    export * from 'baz'
  `);
});

describe('options', () => {
  run('includes', 'export default foo', {
    includes: ['foo.js'],
  });

  run('basepath', 'export default foo', {
    basepath: path.resolve('test'),
  });

  run('factory name', 'export default foo', {
    factoryImportName: 'create',
  });

  run('map filename', 'export default foo', {
    mapFilename: (v) => v.replace(/\.(js|ts)x?$/, ''),
  });

  run('impure', 'export default foo', {
    impureFactory: true,
  });
});
