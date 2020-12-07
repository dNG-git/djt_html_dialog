/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;html;dialog
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from './package.json'
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export function applyDefaultConfig(customConfig) {
    const resolveConfig = (
        customConfig.inputResolveConfig ?
        customConfig.inputResolveConfig : {
            extensions: [ '.mjs', '.js', '.json' ],
            mainFields: [ 'module', 'jsnext:main', 'jsnext', 'browser', 'main' ]
        }
    );

    if (!customConfig.inputTsConfig) {
        throw new Error('Rollup input TypeScript config missing');
    }

    if (!Array.isArray(customConfig.output)) {
        throw new Error('Rollup output config missing');
    }

    return {
        input: 'src/dialog.tsx',
        output: customConfig.output,

        external: [ ...pkg.config.rollup.external_packages, ...pkg.config.rollup.external_unscoped_packages ],

        plugins: [
            replace({ 'process.env.NODE_ENV': "'production'" }),

            typescript({ tsconfig: customConfig.inputTsConfig }),

            nodeResolve(resolveConfig),

            commonjs(),

            terser({ output: { beautify: false, comments: false } })
        ]
    };
};
