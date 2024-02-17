/*
  @license
	Rollup.js v4.12.0
	Fri, 16 Feb 2024 13:31:42 GMT - commit 0146b84be33a8416b4df4b9382549a7ca19dd64a

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
import 'tty';
