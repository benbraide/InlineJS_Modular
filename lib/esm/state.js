import { Stack } from './stack';
export class State {
    constructor(regionId_, regionFinder_) {
        this.regionId_ = regionId_;
        this.regionFinder_ = regionFinder_;
        this.contexts_ = {};
    }
    PushContext(key, value) {
        let context;
        if (!(key in this.contexts_)) {
            context = (this.contexts_[key] = new Stack());
        }
        else {
            context = this.contexts_[key];
        }
        context.Push(value);
    }
    PopContext(key) {
        if (key in this.contexts_) {
            this.contexts_[key].Pop();
            if (this.contexts_[key].IsEmpty()) {
                delete this.contexts_[key];
            }
        }
    }
    GetContext(key, noResult = null) {
        return ((key in this.contexts_ && !this.contexts_[key].IsEmpty()) ? this.contexts_[key].Peek() : noResult);
    }
    TrapGetAccess(callback, changeCallback, elementContext, staticCallback) {
        let region = this.regionFinder_(this.regionId_);
        if (!region) {
            return {};
        }
        let info = {
            stopped: false,
            callback: null
        };
        try {
            region.GetChanges().PushGetAccessStorage(null);
            info.stopped = (callback(null) === false);
        }
        catch (err) {
            this.ReportError(err, `InlineJs.Region<${this.regionId_}>.State.TrapAccess`);
        }
        let storage = region.GetChanges().PopGetAccessStorage(true);
        if (info.stopped || !changeCallback || storage.length == 0) { //Not reactive
            if (staticCallback) {
                staticCallback();
            }
            return {};
        }
        if (elementContext) {
            let scope = region.GetElementScope(elementContext);
            if (!scope && typeof elementContext !== 'string') {
                scope = region.AddElement(elementContext, false);
            }
            if (scope) { //Add info
                scope.trapInfoList.push(info);
            }
        }
        let ids = {};
        let onChange = (changes) => {
            if (Object.keys(ids).length == 0) {
                return;
            }
            let myRegion = this.regionFinder_(this.regionId_);
            if (myRegion) { //Mark changes
                myRegion.GetChanges().PushOrigin(onChange);
            }
            try {
                if (!info.stopped && changeCallback === true) {
                    info.stopped = (callback(changes) === false);
                }
                else if (!info.stopped && changeCallback !== true) {
                    info.stopped = (changeCallback(changes) === false);
                }
            }
            catch (err) {
                this.ReportError(err, `InlineJs.Region<${this.regionId_}>.State.TrapAccess`);
            }
            if (myRegion) {
                myRegion.GetChanges().PopOrigin();
            }
            if (info.stopped) { //Unsubscribe all subscribed
                for (let regionId in ids) {
                    let myRegion = this.regionFinder_(regionId);
                    if (myRegion) {
                        ids[regionId].forEach(id => myRegion.GetChanges().Unsubscribe(id));
                    }
                }
            }
        };
        let uniqueEntries = {};
        storage.forEach(info => uniqueEntries[info.path] = info.regionId);
        info.callback = onChange;
        for (let path in uniqueEntries) {
            let targetRegion = this.regionFinder_(uniqueEntries[path]);
            if (targetRegion) {
                (ids[targetRegion.GetId()] = (ids[targetRegion.GetId()] || new Array())).push(targetRegion.GetChanges().Subscribe(path, onChange));
            }
        }
        return ids;
    }
    ReportError(value, ref) {
        console.error(value, ref);
    }
    Warn(value, ref) {
        console.warn(value, ref);
    }
    Log(value, ref) {
        console.log(value, ref);
    }
    ElementContextKey() {
        return State.ElementContextKey();
    }
    EventContextKey() {
        return State.EventContextKey();
    }
    static ElementContextKey() {
        return 'self';
    }
    static EventContextKey() {
        return 'event';
    }
}
