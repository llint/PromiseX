import {PromiseX} from "./PromiseX";

console.log("hello TypeScript!");

setTimeout(console.log, 1000, "xxxxxx");

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

function delay(ms: number) : PromiseLike<string>
{
    return new PromiseX(resolve => setTimeout(resolve, ms, "fdafdafda"));
}

// https://github.com/Microsoft/TypeScript/pull/6631
async function TestAsync()
{
    console.log("TestAsync: start");
    var s = await delay(1000);
    console.log("TestAsync: " + s);
}

TestAsync();

var a : any[] = [];
a.push(1, "hello", true);
console.log(a);

// var x: {} = "1337+++";
// console.log(x);

// var i: number = x;
