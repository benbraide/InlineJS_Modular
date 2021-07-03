import { Region } from '../region';
export class GlobalHandler {
    constructor(key_, value_, canHandle_, beforeAdd_, afterAdd_, afterRemove_) {
        this.key_ = key_;
        this.value_ = value_;
        this.canHandle_ = canHandle_;
        this.beforeAdd_ = beforeAdd_;
        this.afterAdd_ = afterAdd_;
        this.afterRemove_ = afterRemove_;
    }
    GetKey() {
        return this.key_;
    }
    BeforeAdd(manager) {
        return (!this.beforeAdd_ || this.beforeAdd_(manager));
    }
    AfterAdd(manager) {
        if (this.afterAdd_) {
            this.afterAdd_(manager);
        }
    }
    AfterRemove(manager) {
        if (this.afterRemove_) {
            this.afterRemove_(manager);
        }
    }
    CanHandle(regionId) {
        return (!this.canHandle_ || this.canHandle_(regionId));
    }
    Handle(regionId, contextElement) {
        return ((typeof this.value_ === 'function') ? this.value_(regionId, contextElement) : this.value_);
    }
}
GlobalHandler.region_ = new Region(document.createElement('template'));
