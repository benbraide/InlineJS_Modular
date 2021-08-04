"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxiedGlobalHandler = exports.SimpleGlobalHandler = exports.GlobalHandler = void 0;
const region_1 = require("../region");
class GlobalHandler {
    constructor(key_, canHandle_, beforeAdd_, afterAdd_, afterRemove_, value_ = undefined) {
        this.key_ = key_;
        this.canHandle_ = canHandle_;
        this.beforeAdd_ = beforeAdd_;
        this.afterAdd_ = afterAdd_;
        this.afterRemove_ = afterRemove_;
        this.value_ = value_;
        this.proxy_ = null;
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
        if (typeof this.value_ === 'function') {
            return this.value_(regionId, contextElement);
        }
        return ((this.value_ === undefined) ? this.proxy_ : this.value_);
    }
}
exports.GlobalHandler = GlobalHandler;
GlobalHandler.region_ = new region_1.Region(document.createElement('template'));
class SimpleGlobalHandler extends GlobalHandler {
    constructor(key, value, canHandle) {
        super(key, canHandle, null, null, null, value);
    }
}
exports.SimpleGlobalHandler = SimpleGlobalHandler;
class ProxiedGlobalHandler extends GlobalHandler {
    constructor(key, value, canHandle, beforeAdd, afterAdd, afterRemove) {
        super(key, canHandle, beforeAdd, afterAdd, afterRemove, value);
        this.proxies_ = new Array();
    }
    AddProxy(element, proxy, region) {
        this.proxies_.push({
            element: element,
            proxy: proxy,
        });
        if (region) {
            let elementScope = region.GetElementScope(element);
            if (elementScope) {
                elementScope.uninitCallbacks.push(() => {
                    this.RemoveProxy(element);
                });
            }
        }
        return proxy;
    }
    RemoveProxy(element) {
        this.proxies_.splice(this.proxies_.findIndex(proxy => (proxy.element === element)), 1);
    }
    GetProxy(element) {
        let index = this.proxies_.findIndex(proxy => (proxy.element === element));
        return ((index == -1) ? null : this.proxies_[index].proxy);
    }
}
exports.ProxiedGlobalHandler = ProxiedGlobalHandler;
