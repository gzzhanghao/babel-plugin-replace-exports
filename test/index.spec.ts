import * as path from 'upath';
import * as babel from '@babel/core';
import plugin, { PluginOptions } from '../src';

interface TransformOptions {
  code: string
  options: PluginOptions
  filename?: string
}

function transform(options: TransformOptions) {
  return babel.transformSync(options.code, {
    configFile: false,
    filename: options.filename || path.resolve('test.js'),
    plugins: [[plugin, options.options]],
  });
}

describe('plugin', () => {
  it('transforms', () => {
    const res = transform({
      code: 'export const value = 1',
      options: { factory: 'foo' },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('includes', () => {
    const res = transform({
      code: 'export const value = 1',
      options: {
        factory: 'foo',
        includes: ['foo.js'],
      },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform class declarations', () => {
    const res = transform({
      code: 'export class A {}',
      options: { factory: 'foo' },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform function declarations', () => {
    const res = transform({
      code: 'export function foo() {}',
      options: { factory: 'foo' },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform exports', () => {
    const res = transform({
      code: `
        const foo = 1
        export { foo }
      `,
      options: { factory: 'foo' },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform with factory name', () => {
    const res = transform({
      code: 'export const foo = 1',
      options: {
        factory: 'foo',
        factoryImportName: 'create',
      },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('map filename', () => {
    const res = transform({
      code: 'export const foo = 1',
      options: {
        factory: 'foo',
        mapFilename: (v) => v.replace(/\.(js|ts)x?$/, ''),
      },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform specifiers', () => {
    const res = transform({
      code: `
        const foo = 'foo';
        export { foo }
      `,
      options: {
        factory: 'foo',
      },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('transform default export', () => {
    const res = transform({
      code: 'export default foo',
      options: {
        factory: 'foo',
      },
    });
    expect(res.code).toMatchSnapshot();
  });

  it('reexport', () => {
    const res = transform({
      code: `
        import * as foo from 'foo';
        export { foo as bar }

        export { remote as local } from 'bar'

        export * from 'baz'
      `,
      options: {
        factory: 'foo',
      },
    });
    expect(res.code).toMatchSnapshot();
  });
});
