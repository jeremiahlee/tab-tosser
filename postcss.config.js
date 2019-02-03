/**
 * Big thanks to the instructions here!
 * https://flaviocopes.com/tailwind-setup/
 * https://www.tailwindtoolbox.com/setup
 */
 
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')

/**
 * Custom PurgeCSS Extractor
 * https://github.com/FullHuman/purgecss
 * https://github.com/FullHuman/purgecss-webpack-plugin
 */
class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-z0-9-:\/]+/g);
    }
}


module.exports = {
    plugins: [
        tailwindcss('tailwind.config.js'),
        cssnano({
            preset: 'default',
        }),
        purgecss({
            content: ['lib/*.html'],
            extractors: [{
                extractor: TailwindExtractor,
                extensions: ["html", "js"]
            }]
        }),
        autoprefixer
    ]
}