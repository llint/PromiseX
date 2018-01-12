# PromiseX
TypeScript based promise implementation; and, 'await' ready!

## Setup
- setup typescript support for Visual Studio Code: https://code.visualstudio.com/docs/languages/typescript
- install `ts-node` following the link: https://github.com/TypeStrong/ts-node
- follow the steps here: https://medium.com/@dupski/debug-typescript-in-vs-code-without-compiling-using-ts-node-9d1f4f9a94a
- create a symbolic link `node_modules` at the project root, pointing to your global `node_modules` installation folder

## Design

## Todo
- error handling currently doesn't deal with exceptions; should 'try..catch' and setError for the caught exception, or propagate
- have 'then' and 'catch' return 'PromiseX' rather than 'PromiseLike', so 'catch' can be used for chaining just like 'then' do!

## References & Discussions
- https://github.com/Microsoft/TypeScript/pull/6631 - async function return type restriction
