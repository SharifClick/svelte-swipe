import svelte from 'rollup-plugin-svelte';
import bundleSize from 'rollup-plugin-bundle-size'
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.module, 'format': 'es' },
			{ file: pkg.main, 'format': 'umd', name: 'Swipe' }
		],
		plugins: [
			svelte(),
			commonjs(),
			resolve(),
			terser(),
			bundleSize()
		]
	}
];
