import {PromiseX} from "./PromiseX";

console.log("hello TypeScript!");

setTimeout(console.log, 1000, "xxxxxx");

// NB: the return type has to be PromiseLike instead of PromiseX,
// because PromiseX doesn't seem to automatically resolve to PromiseLike when resolving 'then'
// so the return value of PromiseX returning continuation will cause 'then' to return PromiseLike<PromiseX<T>>
// instead of PromiseLike<T>
function ComputeAsyncX(x: number) : PromiseLike<number> {
    return new PromiseX(resolve => setTimeout(resolve, 1000, x + 1));
}

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

var p = new PromiseX();
p.setResult(42);
p.then(console.log)
    .then(v => "xyz")
    .then(console.log)
    .then(() => ComputeAsyncX(40))
    .then(console.log)
    .then(x => 999)
    .then(console.log)
    ;

var p2 = new PromiseX();
p2.then(ComputeAsyncX).then(console.log);
p2.then(ComputeAsyncX).then(console.log);
p2.setResult(2000);
p2.then(ComputeAsyncX).then(console.log);
p2.then(ComputeAsyncX).then(console.log);

// NB: the return type could also be PromiseX, I'm using PromiseLike here for testing 'await' below
// PromiseX would work the same
function delay(ms: number) : PromiseLike<string>
{
    return new PromiseX(resolve => setTimeout(resolve, ms, "fdafdafda"));
}

// When targeting es6 and up, it is not possible to explicitly specify a custom Promise type (e.g. PromiseX)
// while PromiseX can still be 'await'ed, the return type would always be a native Promise value
// https://github.com/Microsoft/TypeScript/pull/6631
async function TestAsync() // : PromiseX<void>
{
    console.log("TestAsync: start");
    var s = await delay(1000);
    console.log("TestAsync: " + s);
}

TestAsync();

var a : any[] = [];
a.push(1, "hello", true);
console.log(a);

// '{}' is an empty object type, it's basically type 'Object', and follows the conversion rules of 'Object'
// var x: {} = "1337+++";
// console.log(x);

// var i: number = x;
