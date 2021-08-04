export class Evaluator {
    constructor(regionFinder_, elementKeyName_, scopeRegionIds_) {
        this.regionFinder_ = regionFinder_;
        this.elementKeyName_ = elementKeyName_;
        this.scopeRegionIds_ = scopeRegionIds_;
        this.cachedProxy_ = {};
    }
    Evaluate(regionId, elementContext, expression, useWindow = false, ignoreRemoved = true, useBlock = false) {
        if (!(expression = expression.trim())) {
            return null;
        }
        let region = this.regionFinder_(regionId);
        if (!region) {
            return null;
        }
        if (ignoreRemoved && !region.ElementExists(elementContext)) {
            return null;
        }
        let result;
        let state = region.GetState(), elementContextKey = state.ElementContextKey();
        this.scopeRegionIds_.Push(regionId);
        state.PushContext(elementContextKey, region.GetElement(elementContext));
        try {
            if (useBlock) {
                result = (new Function(this.GetContextKey(), `
                    with (${this.GetContextKey()}){
                        ${expression};
                    };
                `)).bind(elementContext)(this.GetProxy(regionId, region.GetRootProxy().GetNativeProxy()));
            }
            else {
                result = (new Function(this.GetContextKey(), `
                    with (${this.GetContextKey()}){
                        return (${expression});
                    };
                `)).bind(elementContext)(this.GetProxy(regionId, region.GetRootProxy().GetNativeProxy()));
            }
        }
        catch (err) {
            let elementId = elementContext.getAttribute(this.elementKeyName_);
            state.ReportError(err, `InlineJs.Region<${regionId}>.Evaluator.Evaluate(${elementContext.tagName}#${elementId}, ${expression})`);
            result = null;
        }
        state.PopContext(elementContextKey);
        this.scopeRegionIds_.Pop();
        return result;
    }
    GetContextKey() {
        return '__InlineJS_Context__';
    }
    GetProxy(regionId, proxy) {
        if (regionId in this.cachedProxy_) {
            return this.cachedProxy_[regionId];
        }
        return (this.cachedProxy_[regionId] = this.CreateProxy(proxy));
    }
    CreateProxy(proxy) {
        return new window.Proxy({}, {
            get(target, prop) {
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)) {
                    return window[prop]; //Use window
                }
                return proxy[prop];
            },
            set(target, prop, value) {
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)) {
                    window[prop] = value; //Use window
                    return true;
                }
                try {
                    proxy[prop] = value;
                }
                catch (err) {
                    return false;
                }
                return true;
            },
            deleteProperty(target, prop) {
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)) {
                    delete window[prop]; //Use window
                    return true;
                }
                try {
                    delete proxy[prop];
                }
                catch (err) {
                    return false;
                }
                return true;
            },
            has(target, prop) {
                return (Reflect.has(target, prop) || (prop in proxy));
            }
        });
    }
    RemoveProxyCache(regionId) {
        if (regionId in this.cachedProxy_) {
            delete this.cachedProxy_[regionId];
        }
    }
    GetScopeRegionIds() {
        return this.scopeRegionIds_;
    }
}
