function isPromiseLike<T>(x: any): x is PromiseLike<T> {
    return x != null && (<PromiseLike<T>>x).then != undefined;
}

function isPromiseX<T>(x: PromiseLike<T>): x is PromiseX<T> {
    return x != null && (<PromiseX<T>>x).type == PromiseX.symbolPromiseX;
}

enum State { Pending, Fulfilled, Rejected }

export class PromiseX<T = any> implements PromiseLike<T> {
    static symbolPromiseX: symbol = Symbol('PromiseX');
    readonly type: symbol = PromiseX.symbolPromiseX;

    private _state: State = State.Pending;

    private _result: T;

    private _reason: any;

    private _continuations: [(x: T) => void, (e: any) => void][] = [];

    constructor(executor?: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        if (executor) {
            executor(result => this.setResult(result), error => this.setError(error));
        }
    }

    // if 'result' is 'undefined', it'll be passed along
    public setResult(result?: T | PromiseLike<T>): void {
        if (this._state == State.Pending) {
            this._state = State.Fulfilled;
            if (isPromiseLike(result)) {
                result.then(x => this.setResult(x));
            } else {
                this._result = result;
                for (let continuation of this._continuations) {
                    continuation[0](this._result);
                }
            }
        }
    }

    public setError(reason?: any): void {
        if (this._state == State.Pending) {
            this._state = State.Rejected;
            this._reason = reason;
            for (let continuation of this._continuations) {
                continuation[1](this._reason);
            }
        }
    }

    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseX<TResult1 | TResult2> {
        switch (this._state) {
            case State.Fulfilled: {
                let r = onFulfilled ? onFulfilled(this._result) : undefined;
                if (isPromiseLike(r) && isPromiseX(r)) {
                    return r;
                }
                let p = new PromiseX<TResult1>();
                p.setResult(r);
                return p;
            }

            case State.Rejected: {
                if (onRejected) {
                    let r = onRejected(this._reason);
                    if (isPromiseLike(r) && isPromiseX(r)) {
                        return r;
                    }
                    let p = new PromiseX<TResult2>();
                    p.setResult(r); // NB: the error has been handled, we pass along the handled result
                    return p;
                }
                let p = new PromiseX<TResult2>();
                p.setError(this._reason); // NB: the error is not handled, mark the returned promise to be the same error, so it can be passed along until handled
                return p;
            }

            case State.Pending: {
                let p = new PromiseX<TResult1 | TResult2>();
                this._continuations.push([
                    result => {
                        let r = onFulfilled ? onFulfilled(result) : undefined;
                        if (isPromiseLike(r)) {
                            r.then(x => p.setResult(x));
                        } else {
                            p.setResult(r);
                        }
                    },
                    reason => {
                        if (onRejected) {
                            let r = onRejected(reason);
                            if (isPromiseLike(r)) {
                                r.then(x => p.setResult(x)); // NB: since the error is handled, the result from the error handler is passed along
                            } else {
                                p.setResult(r); // NB: the error is handled, so the promised returned would be signaled with whatever result from the error handler
                            }
                        } else {
                            p.setError(reason); // NB: pass the error along the chain
                        }
                    }
                ]);
                return p;
            }
        }
    }

    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseX<T | TResult> {
        return this.then(undefined, onRejected);
    }
}
