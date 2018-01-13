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
    // Note that there is a potential race if the current state is pending, while
    // someone calls setResult on two different PromiseLike values - the first one
    // gets either fulfilled or rejected would set the current promise in a non-pending state,
    // and the second PromiseLike when eventually becomes non-pending would call either setResult or setError
    // but find the state becomes non-pending, thus would have no effect!
    public setResult(result?: T | PromiseLike<T>): void {
        if (this._state == State.Pending) {
            if (isPromiseLike(result)) {
                result.then(x => this.setResult(x), e => this.setError(e));
            } else {
                this._state = State.Fulfilled;
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
                let r : TResult1 | PromiseLike<TResult1>;
                if (onFulfilled) {
                    try {
                        r = onFulfilled(this._result);
                    } catch (e) {
                        let p = new PromiseX<never>();
                        p.setError(e);
                        return p;
                    }
                }
                if (isPromiseLike(r) && isPromiseX(r)) {
                    return r;
                }
                let p = new PromiseX<TResult1>();
                p.setResult(r);
                return p;
            }

            case State.Rejected: {
                if (onRejected) {
                    let r : TResult2 | PromiseLike<TResult2>;
                    try {
                        r = onRejected(this._reason);
                    } catch (e) {
                        let p = new PromiseX<never>();
                        p.setError(e);
                        return p;
                    }
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
                        let r : TResult1 | PromiseLike<TResult1>;
                        if (onFulfilled) {
                            try {
                                r = onFulfilled(result);
                            } catch (e) {
                                p.setError(e);
                                return;
                            }
                        }
                        p.setResult(r);
                    },
                    reason => {
                        if (onRejected) {
                            let r : TResult2 | PromiseLike<TResult2>;
                            try {
                                r = onRejected(reason);
                            } catch (e) {
                                p.setError(e);
                                return;
                            }
                            p.setResult(r);
                        } else {
                            p.setError(reason); // NB: error not handled, pass the error along the chain
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
