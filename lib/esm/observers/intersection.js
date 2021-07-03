import { Region } from '../region';
export class IntersectionObserver {
    constructor(key_, target_, options_) {
        this.key_ = key_;
        this.target_ = target_;
        this.options_ = options_;
        this.observer_ = null;
        this.handlers_ = new Array();
        this.isObserving_ = false;
        let key = this.key_;
        this.observer_ = new globalThis.IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                this.handlers_.forEach((handler) => {
                    try {
                        handler(entry, key, observer);
                    }
                    catch (_a) { }
                });
            });
        }, this.options_);
    }
    GetKey() {
        return this.key_;
    }
    GetObserver() {
        return this.observer_;
    }
    GetTarget() {
        return this.target_;
    }
    GetOptions() {
        return this.options_;
    }
    AddHandler(handler) {
        this.handlers_.push(handler);
    }
    RemoveHandler(handler) {
        this.handlers_.splice(this.handlers_.findIndex(item => (item === handler)), 1);
    }
    Start(handler) {
        if (!this.isObserving_) {
            if (handler) {
                this.AddHandler(handler);
            }
            this.isObserving_ = true;
            this.observer_.observe(this.target_);
        }
    }
    Stop() {
        if (this.isObserving_) {
            this.observer_.unobserve(this.target_);
            this.isObserving_ = false;
        }
    }
    static BuildOptions(value) {
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: 0,
        };
        if (Region.IsObject(value)) {
            Object.entries(value).forEach(([key, entry]) => {
                if (key in options) {
                    if (key === 'root' && !(entry instanceof HTMLElement)) {
                        let query = Region.ToString(entry);
                        options[key] = (query ? document.querySelector(query) : null);
                    }
                    else {
                        options[key] = entry;
                    }
                }
            });
        }
        return options;
    }
}
