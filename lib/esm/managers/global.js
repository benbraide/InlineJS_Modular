export class GlobalManager {
    constructor(getRegion_, inferRegion_) {
        this.getRegion_ = getRegion_;
        this.inferRegion_ = inferRegion_;
        this.handlers_ = {};
    }
    AddHandler(handler) {
        if (handler.BeforeAdd(this)) {
            let key = ('$' + handler.GetKey());
            if (key in this.handlers_) {
                this.handlers_[key].AfterRemove();
            }
            this.handlers_[key] = handler;
            handler.AfterAdd(this);
        }
    }
    RemoveHandler(handler) {
        this.RemoveHandlerByKey(handler.GetKey());
    }
    RemoveHandlerByKey(key) {
        key = ('$' + key);
        if (key in this.handlers_) {
            delete this.handlers_[key];
            this.handlers_[key].AfterRemove();
        }
    }
    GetHandler(regionId, key) {
        if (key in this.handlers_) {
            return ((!regionId || this.handlers_[key].CanHandle(regionId)) ? this.handlers_[key] : null);
        }
        if (!key.startsWith('$')) {
            return this.GetHandler(regionId, ('$' + key));
        }
        return null;
    }
    Handle(regionId, contextElement, key, noResultCreator) {
        let handler = this.GetHandler(regionId, key);
        if (handler) {
            return handler.Handle(regionId, contextElement);
        }
        if (key.startsWith('$$')) { //External access
            key = key.substr(1);
            return (target) => {
                var _a;
                let region = (this.inferRegion_(target) || this.getRegion_(regionId));
                if (!region) {
                    return null;
                }
                let local = region.GetLocal(target, key, false, true);
                if (local) { //Prioritize local value
                    return local;
                }
                return (_a = this.GetHandler(region.GetId(), key)) === null || _a === void 0 ? void 0 : _a.Handle(region.GetId(), target);
            };
        }
        return (noResultCreator ? noResultCreator() : null);
    }
}
