export class PromiseX<T = any> {
    private _value: T;
    private _continuation: (x: T) => void;

    constructor(executor?: (resolve: (x: T) => void) => void) {
        if (executor) {
            executor(value => this.setValue(value)); // NB: cannot pass this.setValue directly!
        }
    }

    public setValue(value: T): void {
        if (this._value == null && value != null) { // 'null' or 'undefined'
            this._value = value;
            if (this._continuation) {
                this._continuation(this._value);
            }
        }
    }

    public then(continuation: (x: T) => PromiseX<T> | T | void): PromiseX<T> {
        if (this._value != null) {
            let r = continuation(this._value);
            if (r instanceof PromiseX) {
                return r;
            }
            let p = new PromiseX<T>();
            p.setValue(r != null ? r as T : this._value);
            return p;
        }
        let p = new PromiseX<T>();
        this._continuation = value => {
            let r = continuation(value);
            if (r instanceof PromiseX) {
                r.then(x => p.setValue(x));
            } else {
                p.setValue(r != null ? r as T : this._value);
            }
        };
        return p;
    }
}

// export class PromiseX extends PromiseX<any> {}