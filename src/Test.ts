import {PromiseX} from "./PromiseX";

console.log("hello TypeScript!");

setTimeout(console.log, 1000, "xxxxxx");

function ComputeAsyncX(x: number) {
    return new PromiseX<number>(resolve => setTimeout(resolve, 1000, x + 1));
}

function Test() {
    ComputeAsyncX(0)
        .then(console.log)
        // .then(ComputeAsyncX) - very nicely, this is not allowed, since the previous then returns void
        .then(() => ComputeAsyncX(10))
        .then(r => { console.log(r); return ComputeAsyncX(r); })
        // .then(r => { console.log(r); return ComputeAsyncX(r); })
        .then(r => { console.log(r); return r + 1; })

        .then(r => { console.log(r); return ComputeAsyncX(r); })
        .then(console.log)
        // .then(ComputeAsyncX)
        .then(() => ComputeAsyncX(20))
        .then(console.log)
        // .then(ComputeAsyncX)
        .then(() => ComputeAsyncX(30))
        .then(console.log)
        .then(x => 233)
        .then(console.log)
        ;
}
Test();

function Test2() {
    let p = new PromiseX();
    p.setResult(42);
    p.then(console.log)
        .then(v => "xyz")
        .then(console.log)
        .then(() => ComputeAsyncX(40))
        .then(console.log)
        .then(x => 999)
        .then(console.log)
        ;
}
Test2();

function Test3() {
    let p = new PromiseX();
    p.then(ComputeAsyncX).then(console.log);
    p.then(ComputeAsyncX).then(console.log);
    p.setResult(2000);
    p.then(ComputeAsyncX).then(console.log);
    p.then(ComputeAsyncX).then(console.log);
}
Test3();

function Test4() {
    let p = new PromiseX();
    p.then(ComputeAsyncX).then(console.log, console.error).then(() => console.log("done 1"));
    p.then(ComputeAsyncX).then(console.log).catch(ComputeAsyncX).then((x) => console.log("### AFTER ERROR: done 2: " + x), console.error);
    p.setError("ERROR");
    p.then(ComputeAsyncX).then(console.log, console.error).then(() => console.log("done 3"));
    p.then(ComputeAsyncX).then(console.log).then(undefined, undefined).catch(() => console.error("ERROR 4"));
}
Test4();

function Test5() {
    let p = new PromiseX();
    p.then(x => {throw x;}).catch(console.error).then(_ => ComputeAsyncX(100)).then(console.log);
    let p0 = new PromiseX(resolve => setTimeout(resolve, 10000, "THROW ME (A)!!!"));
    let p1 = new PromiseX(resolve => setTimeout(resolve, 11000, "THROW ME (B)!!!"));
    p.setResult(p0);
    p.setResult(p1);
}
Test5();

function delay(ms: number)
{
    return new PromiseX<string>(resolve => setTimeout(resolve, ms, "fdafdafda"));
}

// When targeting es6 and up, it is not possible to explicitly specify a custom Promise type (e.g. PromiseX)
// while PromiseX can still be 'await'ed, the return type would always be a native Promise value
// https://github.com/Microsoft/TypeScript/pull/6631
async function TestAsync() // : PromiseX<void>
{
    console.log("TestAsync: start");

    console.log("TestAsync (1): " + await delay(1000));

    console.log("TestAsync (2): " + await delay(1000));

    console.log("TestAsync (3): " + await delay(1000));
}

TestAsync();

var a : any[] = [];
a.push(1, "hello", true);
console.log(a);

// '{}' is an empty object type, it's basically type 'Object', and follows the conversion rules of 'Object'
// var x: {} = "1337+++";
// console.log(x);

// var i: number = x;
