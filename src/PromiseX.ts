export class PromiseX<T = any> {
    private _result: T;
    private _continuations: ((x: T) => void)[] = [];

    constructor(executor?: (resolve: (x: T) => void) => void) {
        if (executor) {
            executor(result => this.setResult(result)); // NB: cannot pass this.setResult directly!
        }
    }

    public setResult(result: T): void {
        if (this._result == null && result != null) { // 'null' or 'undefined'
            this._result = result;
            for (let continuation of this._continuations) {
                continuation(this._result);
            }
        }
    }

    public then(continuation: (x: T) => PromiseX<T> | T | void): PromiseX<T> {
        if (this._result != null) {
            let r = continuation(this._result);
            if (r instanceof PromiseX) {
                return r;
            }
            let p = new PromiseX<T>();
            p.setResult(r != null ? r as T : this._result);
            return p;
        }
        let p = new PromiseX<T>();
        this._continuations.push(result => {
            let r = continuation(result);
            if (r instanceof PromiseX) {
                r.then(x => p.setResult(x));
            } else {
                p.setResult(r != null ? r as T : this._result);
            }
        });
        return p;
    }
}
