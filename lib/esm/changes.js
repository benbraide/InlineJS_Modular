import { Stack } from './stack';
export class Changes {
    constructor(regionId_, regionFinder_, currentRegionGetter_) {
        this.regionId_ = regionId_;
        this.regionFinder_ = regionFinder_;
        this.currentRegionGetter_ = currentRegionGetter_;
        this.isScheduled_ = false;
        this.list_ = new Array();
        this.subscriberId_ = null;
        this.subscribers_ = {};
        this.subscriptionCallbacks_ = {};
        this.getAccessStorages_ = new Stack();
        this.getAccessHooks_ = new Stack();
        this.origins_ = new Stack();
    }
    GetRegionId() {
        return this.regionId_;
    }
    Schedule() {
        if (this.isScheduled_) {
            return;
        }
        this.isScheduled_ = true;
        setTimeout(() => {
            this.isScheduled_ = false;
            if (0 < this.list_.length) {
                let list = this.list_, batches = new Array();
                this.list_ = new Array();
                list.forEach((item) => {
                    if (item.path in this.subscriptionCallbacks_) {
                        let subscriptionCallbacks = this.subscriptionCallbacks_[item.path];
                        Object.keys(subscriptionCallbacks).forEach((key) => {
                            if (subscriptionCallbacks[key] !== Changes.GetOrigin(item)) { //Ignore originating callback
                                Changes.AddBatch(batches, item, subscriptionCallbacks[key]);
                            }
                        });
                    }
                });
                batches.forEach(batch => batch.callback(batch.changes));
            }
            let region = this.regionFinder_(this.regionId_);
            if (region) {
                region.ExecuteNextTick();
            }
        }, 0);
    }
    Add(item) {
        this.list_.push(item);
        this.Schedule();
    }
    AddComposed(prop, prefix, targetPath, regionId) {
        let change = {
            regionId: (regionId || this.regionId_),
            type: 'set',
            path: (prefix ? `${prefix}.${prop}` : prop),
            prop: prop,
            origin: this.GetOrigin(),
        };
        if (targetPath) {
            this.Add({
                original: change,
                path: targetPath,
            });
        }
        else {
            this.Add(change);
        }
    }
    Subscribe(path, callback) {
        let id;
        if (this.subscriberId_ === null) {
            id = `sub_${(this.subscriberId_ = 0)}`;
        }
        else {
            id = `sub_${++this.subscriberId_}`;
        }
        let region = this.currentRegionGetter_(this.regionId_);
        if (region) { //Check for a context element
            let contextElement = region.GetState().GetContext(region.GetState().ElementContextKey());
            if (contextElement) { //Add reference
                let scope = region.AddElement(contextElement, true);
                if (scope) {
                    scope.changeRefs.push({
                        regionId: region.GetId(),
                        subscriptionId: id
                    });
                }
            }
        }
        (this.subscriptionCallbacks_[path] = (this.subscriptionCallbacks_[path] || {}))[id] = callback;
        this.subscribers_[id] = {
            path: path,
            callback: callback,
        };
        return id;
    }
    Unsubscribe(id) {
        if (id in this.subscribers_) {
            delete this.subscriptionCallbacks_[this.subscribers_[id].path][id];
            delete this.subscribers_[id];
        }
    }
    AddGetAccess(path) {
        let region = this.currentRegionGetter_(this.regionId_);
        if (!region) {
            return;
        }
        let hook = region.GetChanges().getAccessHooks_.Peek();
        if (hook && !hook(region.GetId(), path)) { //Rejected
            return;
        }
        let storageInfo = region.GetChanges().getAccessStorages_.Peek();
        if (!storageInfo || !storageInfo.storage) {
            return;
        }
        if (storageInfo.storage.raw) {
            storageInfo.storage.raw.push({
                regionId: this.regionId_,
                path: path
            });
        }
        if (!storageInfo.storage.optimized) {
            return;
        }
        let optimized = storageInfo.storage.optimized;
        if (storageInfo.lastAccessPath && 0 < optimized.length && storageInfo.lastAccessPath.length < path.length &&
            1 < (path.match(/\./g) || []).length && path.substr(0, storageInfo.lastAccessPath.length) === storageInfo.lastAccessPath) { //Deeper access
            optimized[(optimized.length - 1)].path = path;
        }
        else { //New entry
            optimized.push({
                regionId: this.regionId_,
                path: path
            });
        }
        storageInfo.lastAccessPath = path;
    }
    ReplaceOptimizedGetAccesses() {
        if (!this.regionFinder_(this.regionId_).GetConfig().IsOptimizedBinds()) {
            return;
        }
        let info = this.getAccessStorages_.Peek();
        if (info && info.storage && info.storage.raw) {
            info.storage.optimized = new Array();
            info.storage.raw.forEach(item => info.storage.optimized.push(item));
        }
    }
    FlushRawGetAccesses() {
        if (!this.regionFinder_(this.regionId_).GetConfig().IsOptimizedBinds()) {
            return;
        }
        let info = this.getAccessStorages_.Peek();
        if (info && info.storage && info.storage.raw) {
            info.storage.raw = [];
        }
    }
    AddGetAccessesCheckpoint() {
        let info = this.getAccessStorages_.Peek();
        if (!info || !info.storage) {
            return;
        }
        if (info.storage.optimized) {
            info.storage.checkpoint.optimized = info.storage.optimized.length;
        }
        if (info.storage.raw) {
            info.storage.checkpoint.raw = info.storage.raw.length;
        }
    }
    DiscardGetAccessesCheckpoint() {
        let info = this.getAccessStorages_.Peek();
        if (!info || !info.storage) {
            return;
        }
        if (info.storage.optimized && info.storage.checkpoint.optimized != -1 && info.storage.checkpoint.optimized < info.storage.optimized.length) {
            info.storage.optimized.splice(info.storage.checkpoint.optimized);
        }
        if (info.storage.raw && info.storage.checkpoint.raw != -1 && info.storage.checkpoint.raw < info.storage.raw.length) {
            info.storage.raw.splice(info.storage.checkpoint.raw);
        }
        info.storage.checkpoint.optimized = -1;
        info.storage.checkpoint.raw = -1;
    }
    PushGetAccessStorage(storage) {
        this.getAccessStorages_.Push({
            storage: (storage || {
                optimized: (this.regionFinder_(this.regionId_).IsOptimizedBinds() ? new Array() : null),
                raw: new Array(),
                checkpoint: {
                    optimized: -1,
                    raw: -1,
                }
            }),
            lastAccessPath: '',
        });
    }
    RetrieveGetAccessStorage(optimized = true) {
        let info = this.getAccessStorages_.Peek();
        return ((info && info.storage) ? (optimized ? (info.storage.optimized || info.storage.raw) : info.storage) : null);
    }
    PopGetAccessStorage(optimized) {
        let info = this.getAccessStorages_.Pop();
        return ((info && info.storage) ? (optimized ? (info.storage.optimized || info.storage.raw) : info.storage) : null);
    }
    PushGetAccessHook(hook) {
        this.getAccessHooks_.Push(hook);
    }
    RetrieveGetAccessHook() {
        return this.getAccessHooks_.Peek();
    }
    PopGetAccessHook() {
        return this.getAccessHooks_.Pop();
    }
    PushOrigin(origin) {
        this.origins_.Push(origin);
    }
    GetOrigin() {
        return this.origins_.Peek();
    }
    PopOrigin() {
        return this.origins_.Pop();
    }
    static SetOrigin(change, origin) {
        if ('original' in change) {
            change.original.origin = origin;
        }
        else {
            change.origin = origin;
        }
    }
    static GetOrigin(change) {
        return (('original' in change) ? change.original.origin : change.origin);
    }
    static AddBatch(batches, change, callback) {
        let batch = batches.find(info => (info.callback === callback));
        if (batch) {
            batch.changes.push(change);
        }
        else { //Add new
            batches.push({
                callback: callback,
                changes: new Array(change)
            });
        }
    }
}
