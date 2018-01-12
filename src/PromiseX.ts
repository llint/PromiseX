function isPromiseLike<T>(x: any): x is PromiseLike<T> {
    return x != null && (<PromiseLike<T>>x).then != undefined;
}

enum State { Pending, Fulfilled, Rejected }

export class PromiseX<T = any> implements PromiseLike<T> {
    private _result: T;
    private _continuations: [(x: T) => void, (e: any) => void][] = [];

    private _reason: any;

    private _state: State = State.Pending;

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

    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
        switch (this._state) {
            case State.Fulfilled: {
                let r = onFulfilled ? onFulfilled(this._result) : undefined;
                if (isPromiseLike(r)) {
                    return r;
                }
                let p = new PromiseX<TResult1>();
                p.setResult(r);
                return p;
            }

            case State.Rejected: {
                let r = onRejected ? onRejected(this._reason) : undefined;
                if (isPromiseLike(r)) {
                    return r;
                }
                let p = new PromiseX<TResult2>();
                p.setError(r);
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
                        let r = onRejected ? onRejected(reason) : undefined;
                        if (isPromiseLike(r)) {
                            r.then(x => p.setError(x));
                        } else {
                            p.setError(r);
                        }
                    }
                ]);
                return p;
            }
        }
    }
}
