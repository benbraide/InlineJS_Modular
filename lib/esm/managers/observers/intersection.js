import { IntersectionObserver } from '../../observers/intersection';
export class IntersectionObserverManager {
    constructor(regionId_) {
        this.regionId_ = regionId_;
        this.list_ = new Array();
        this.lastKeyCount_ = 0;
    }
    Add(target, options) {
        let observer = new IntersectionObserver(`${this.regionId_}.interobs.${this.lastKeyCount_++}`, target, options);
        this.list_.push(observer);
        return observer;
    }
    Remove(observer) {
        this.list_.splice(this.list_.findIndex(item => (item === observer)), 1);
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