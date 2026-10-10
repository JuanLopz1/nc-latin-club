/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads real TypeScript without a new dependency. */
const fs = require('node:fs');
const ts = require('typescript');
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
// Content/accessibility rendering only. Real styles are checked in Chromium.
require.extensions['.css'] = module => { module.exports = {}; };
