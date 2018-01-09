// the reason that a generic type is not used is that T is too rigid in terms of type conversion
// type erasure as provided by any simplifies a lot of the potential issues, and really we don't care the actual type of the value
class PromiseX {
    private _value: any;
    private _continuation: (x: any) => void;

    constructor(executor?: (resolve: (x: any) => void) => void) {
        if (executor) {
            executor(this.setValue);
        }
    }

    public setValue(value: any): void {
        if (this._value == null) { // 'null' or 'undefined'
            this._value = value;
            if (this._continuation) {
                this._continuation(this._value);
            }
        }
    }

    public then(continuation: (x: any) => any | void): PromiseX {
        if (this._value != null) {
            let r = continuation(this._value);
            if (r instanceof PromiseX) {
                return r;
            }
            let p = new PromiseX();
            p.setValue(r != null ? r : this._value);
            return p;
        }
        let p = new PromiseX();
        this._continuation = value => {
            let r = continuation(value);
            if (r instanceof PromiseX) {
                r.then(x => p.setValue(x));
            } else {
                p.setValue(r != null ? r : this._value);
            }
        };
        return p;
    }
}
