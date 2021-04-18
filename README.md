# babel-plugin-replace-exports

Babel plugin for replace all exports with dynamic values.

__Input:__

```js
// server/serverApi.js
export function someServerApi(params) {
  // server side logic...
}
```

__Output:__

```js
import { createAjaxApi as _factory } from '@/lib/createAjaxApi'
var _filename = 'server/serverApi.js'
export var someServerApi = /*#__PURE__*/_factory(_filename, 'someServerApi')
```

Plugin will remove anything except re-exports.

## Options

### `factory`

__required__, `string`.

Factory module name.

__Example:__

```js
// { factory: 'foo' }
import { default as _factory } from 'foo';
```

### `basepath`

`string`, defaults to `cwd`.

Specify basepath for resolving file name.

### `includes`

`Array<string>`, defaults to `null`.

If specified, plugin will only transpile specific files. It uses [micromatch](https://www.npmjs.com/package/micromatch) for matching file names.

### `factoryImportName`

`string`, defaults to `'default'`.

Import name of the factory function.

__Example:__

```js
// { factoryImportName: 'myCustomImport' }
import { myCustomImport as _factory } from '@/lib/createAjaxApi';
```

### `mapFilename`

`function`, defaults to `v => v`.

Transform filename passed to the factory.

__Example:__

```js
// { mapFilename: (filename, state) => filename.replace(/\.js$/, '') }
var _filename = 'server/serverApi'
```
