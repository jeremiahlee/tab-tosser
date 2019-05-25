/*
Current status: frustrated.
This build file is a dumpster fire.

TypeScript will compile ./src/* just fine.
But `broccoli-typescript-compiler` will not.

Sooo we need to run TypeScript compiler in place,
then copy the JavaScript and other assets over to /dist/.

TODO: When `BROCCOLI_ENV == "build"`, zip it up and put into /dist-releases/
*/

// import BroccoliMergeTrees from "broccoli-merge-trees";
const BroccoliMergeTrees = require("broccoli-merge-trees");
// import typescript from "broccoli-typescript-compiler";
const funnel = require("broccoli-funnel");
// const { filterTypescript } = require("broccoli-typescript-compiler");

const nonTypeScriptFiles = funnel(
    "src",
    {
        exclude: ["**/*.ts", "**/*.js.map"],
        annotation: "Non-TypeScript assets"
    }
);

const license = funnel("./",{
    files: ["LICENSE.md"],
    annotation: "License file"
});

// let compiledTypeScript = filterTypescript("src", {
//     tsconfig: {
//         module: "ES2015",
//         target: "ES2018",
//         strictNullChecks: true,
//         moduleResolution: "ES6",
//         allowJs: false,
//         newLine: "LF",
//         sourceMap: false,
//         declaration: false
//     },
//     throwOnError: true,
//     annotation: "Compile TypeScript"
// });

// const typeScriptTree = typescript("src/lib/", {
//     tsconfig: {
//         compilerOptions: {
//             module: "ES2015",
//             target: "ES2018",
//             moduleResolution: "ES6",
//             newLine: "LF",
//             outDir: "dist",
//             sourceMap: false,
//             declaration: false
//         }
//     },
//     throwOnError: true,
//     annotation: "compile TypeScript"
// });

let tree = BroccoliMergeTrees([nonTypeScriptFiles, license], {annotation: "Final output"});

if (process.env.BROCCOLI_ENV === "release") {
    // TODO: Create a zip archive for Mozilla ADO
}

export default () => { return tree; };

// export default () => { return BroccoliMergeTrees([compiledTypeScript, license], {annotation: "Final output"}); };
