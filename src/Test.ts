import {PromiseX} from "./PromiseX";

console.log("hello TypeScript!");

setTimeout(console.log, 1000, "xxxxxx");

// function ComputeAsyncX(x: number) : PromiseX<number> {
//     return new PromiseX(resolve => setTimeout(resolve, 1000, x + 1));
// }

// ComputeAsyncX(0)
//     .then(console.log)
//     .then(ComputeAsyncX)
//     .then(r => { console.log(r); return ComputeAsyncX(r); })
//     .then(r => { console.log(r); return ComputeAsyncX(r); })
//     .then(r => { console.log(r); return r + 1; })

//     .then(r => { console.log(r); return ComputeAsyncX(r); })
//     .then(console.log)
//     .then(ComputeAsyncX)
//     .then(console.log)
//     .then(ComputeAsyncX)
//     .then(console.log)
//     .then(x => 233)
//     .then(console.log)
//     ;

// var p = new PromiseX();
// p.setResult(42);
// p.then(console.log)
//     .then(v => "xyz")
//     .then(console.log)
//     .then(ComputeAsyncX)
//     .then(console.log)
//     .then(x => 999)
//     .then(console.log)
//     ;

// var p2 = new PromiseX();
// p2.then(ComputeAsyncX).then(console.log);
// p2.then(ComputeAsyncX).then(console.log);
// p2.setResult(2000);
// p2.then(ComputeAsyncX).then(console.log);
// p2.then(ComputeAsyncX).then(console.log);

function delay(ms: number) : PromiseX
{
    return new PromiseX(resolve => setTimeout(resolve, ms));
}

async function TestAsync() : PromiseX
{
    console.log("TestAsync: start");
    await delay(1000);
    console.log("TestAsync: done");
}

TestAsync();

var a : any[] = [];
a.push(1, "hello", true);
console.log(a);

// var x: {} = "1337+++";
// console.log(x);

// var i: number = x;
