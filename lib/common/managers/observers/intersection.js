"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionObserverManager = void 0;
const intersection_1 = require("../../observers/intersection");
class IntersectionObserverManager {
    constructor(regionId_) {
        this.regionId_ = regionId_;
        this.list_ = new Array();
        this.lastKeyCount_ = 0;
    }
    Add(target, options) {
        let observer = new intersection_1.IntersectionObserver(`${this.regionId_}.interobs.${this.lastKeyCount_++}`, target, options);
        this.list_.push(observer);
        return observer;
    }
    Remove(observer) {
        this.RemoveByKey(observer.GetKey());
    }
    RemoveByKey(key, stop = true) {
        let index = this.list_.findIndex(item => (item.GetKey() === key));
        if (index != -1) {
            if (stop) { //Stop before removing from list
                this.list_[index].Stop();
            }
            this.list_.splice(index, 1);
        }
    }
    RemoveAll(target, stop = true) {
        this.list_ = this.list_.filter((item) => {
            if ((item.GetTarget() !== target)) {
                return true;
            }
            if (stop) { //Stop before removing from list
                item.Stop();
            }
            return false;
        });
    }
}
exports.IntersectionObserverManager = IntersectionObserverManager;
