import { Stack } from './stack';
import { State } from './state';
import { Changes } from './changes';
import { Evaluator } from './evaluator';
import { Config } from './config';
import { Database } from './utilities/database';
import { Processor } from './processor';
import { DirectiveManager } from './managers/directive';
import { GlobalManager } from './managers/global';
import { OutsideEventManager } from './managers/outside_event';
import { IntersectionObserverManager } from './managers/observers/intersection';
import { ResizeObserver } from './observers/resize';
import { RootProxy, NoResult } from './proxy';
export class NoAnimation {
    constructor() {
        this.beforeHandlers_ = new Array();
        this.afterHandlers_ = new Array();
    }
    Run(show, target, afterHandler, beforeHandler) {
        if (beforeHandler) {
            try {
                beforeHandler(show);
            }
            catch (_a) { }
        }
        this.beforeHandlers_.forEach((handler) => {
            try {
                handler();
            }
            catch (_a) { }
        });
        if (target && typeof target === 'function') {
            target(show ? 1 : 0);
        }
        if (afterHandler) {
            try {
                afterHandler(false, show);
            }
            catch (_b) { }
        }
        this.afterHandlers_.forEach((handler) => {
            try {
                handler();
            }
            catch (_a) { }
        });
    }
    Cancel() { }
    Bind(target) {
        return null;
    }
    BindOne(show, target) {
        return null;
    }
    AddBeforeHandler(handler) {
        this.beforeHandlers_.push(handler);
    }
    RemoveBeforeHandler(handler) {
        this.beforeHandlers_.splice(this.beforeHandlers_.findIndex(item => (item === handler)), 1);
    }
    AddAfterHandler(handler) {
        this.afterHandlers_.push(handler);
    }
    RemoveAfterHandler(handler) {
        this.afterHandlers_.splice(this.afterHandlers_.findIndex(item => (item === handler)), 1);
    }
}
export class Region {
    constructor(rootElement_) {
        this.rootElement_ = rootElement_;
        this.id_ = null;
        this.componentKey_ = '';
        this.doneInit_ = false;
        this.scopes_ = {};
        this.elementScopes_ = {};
        this.lastElementId_ = null;
        this.rootProxy_ = null;
        this.proxies_ = {};
        this.refs_ = {};
        this.observer_ = null;
        this.intersectionObserverManager_ = null;
        this.resizeObserver_ = null;
        this.localHandlers_ = new Array();
        this.nextTickCallbacks_ = new Array();
        this.tempCallbacks_ = {};
        this.scopeId_ = 0;
        this.directiveScopeId_ = 0;
        this.tempCallbacksId_ = 0;
        this.enableOptimizedBinds_ = true;
        let regionSubId;
        if (Region.lastSubId_ === null) {
            regionSubId = (Region.lastSubId_ = 0);
        }
        else if (Region.lastSubId_ == (Number.MAX_SAFE_INTEGER || 9007199254740991)) { //Roll over
            ++Region.lastId_;
            regionSubId = Region.lastSubId_ = 0;
        }
        else {
            regionSubId = ++Region.lastSubId_;
        }
        this.id_ = `rgn__${Region.lastId_}_${regionSubId}`;
        Region.entries_[this.id_] = this;
        this.rootProxy_ = new RootProxy(this.id_, Region.Get, {});
        this.state_ = new State(this.id_, Region.Get);
        this.changes_ = new Changes(this.id_, Region.Get, Region.GetCurrent);
        this.enableOptimizedBinds_ = Region.config_.IsOptimizedBinds();
        let id = this.id_;
        if (window.MutationObserver) {
            this.observer_ = new window.MutationObserver((mutations) => {
                let region = Region.Get(id);
                if (!region) {
                    return;
                }
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach((node) => {
                            if (node instanceof HTMLElement) {
                                region.RemoveElement(node);
                            }
                        });
                        mutation.addedNodes.forEach((node) => {
                            if (node instanceof HTMLElement) {
                                Region.processor_.All(region, node, {
                                    checkTemplate: true,
                                    checkDocument: false,
                                });
                            }
                        });
                    }
                    else if (mutation.type === 'attributes') {
                        let directive = (mutation.target.hasAttribute(mutation.attributeName) ? Region.processor_.GetDirectiveWith(mutation.attributeName, mutation.target.getAttribute(mutation.attributeName)) : null);
                        if (!directive) {
                            let scope = region.GetElementScope(mutation.target);
                            if (scope) {
                                scope.attributeChangeCallbacks.forEach(callback => callback(mutation.attributeName));
                            }
                        }
                        else { //Process directive
                            Region.processor_.DispatchDirective(region, mutation.target, directive);
                        }
                    }
                });
                Region.ExecutePostProcessCallbacks();
            });
        }
        Region.hooks_.forEach((hook) => {
            try {
                hook(this, true);
            }
            catch (_a) { }
        });
    }
    SetOptimizedBindsState(value) {
        this.enableOptimizedBinds_ = value;
    }
    IsOptimizedBinds() {
        return this.enableOptimizedBinds_;
    }
    SetDoneInit() {
        this.doneInit_ = true;
    }
    GetDoneInit() {
        return this.doneInit_;
    }
    GenerateScopeId() {
        return `${this.id_}_scope_${this.scopeId_++}`;
    }
    GenerateDirectiveScopeId(prefix, suffix) {
        return `${prefix || ''}${this.id_}_dirscope_${this.directiveScopeId_++}${suffix || ''}`;
    }
    GetId() {
        return this.id_;
    }
    GetComponentKey() {
        return this.componentKey_;
    }
    AddScope(key, value) {
        this.scopes_[key] = (value || {});
    }
    RemoveScope(key) {
        delete this.scopes_[key];
    }
    GetScope(key) {
        return ((key in this.scopes_) ? this.scopes_[key] : null);
    }
    GetRootElement() {
        return this.rootElement_;
    }
    GetElementWith(target, callback) {
        let resolvedTarget = ((target === true) ? this.state_.GetContext(State.ElementContextKey()) : target);
        while (resolvedTarget) {
            if (callback(resolvedTarget)) {
                return resolvedTarget;
            }
            if (resolvedTarget === this.rootElement_) {
                break;
            }
            resolvedTarget = resolvedTarget.parentElement;
        }
        return null;
    }
    GetElementAncestor(target, index) {
        let resolvedTarget = ((target === true) ? this.state_.GetContext(State.ElementContextKey()) : target);
        if (!resolvedTarget || resolvedTarget === this.rootElement_) {
            return null;
        }
        let ancestor = resolvedTarget;
        for (; 0 <= index && ancestor && ancestor !== this.rootElement_; --index) {
            ancestor = ancestor.parentElement;
        }
        return ((0 <= index) ? null : ancestor);
    }
    GetElementScope(element) {
        var _a;
        let key;
        if (typeof element === 'string') {
            key = element;
        }
        else if (element === true) {
            key = (_a = this.state_.GetContext(State.ElementContextKey())) === null || _a === void 0 ? void 0 : _a.getAttribute(Region.GetElementKeyName());
        }
        else if (!(element instanceof HTMLElement)) {
            key = this.rootElement_.getAttribute(Region.GetElementKeyName());
        }
        else if (element) { //HTMLElement
            key = element.getAttribute(Region.GetElementKeyName());
        }
        return ((key && key in this.elementScopes_) ? this.elementScopes_[key] : null);
    }
    GetElement(element) {
        if (typeof element !== 'string') {
            return element;
        }
        let scope = this.GetElementScope(element);
        return (scope ? scope.element : null);
    }
    GetState() {
        return this.state_;
    }
    GetChanges() {
        return this.changes_;
    }
    GetEvaluator() {
        return Region.evaluator_;
    }
    GetProcessor() {
        return Region.processor_;
    }
    GetConfig() {
        return Region.config_;
    }
    GetDatabase(createIfNotExists) {
        return Region.GetDatabase(createIfNotExists);
    }
    GetDirectiveManager() {
        return Region.directiveManager_;
    }
    GetGlobalManager() {
        return Region.globalManager_;
    }
    GetOutsideEventManager() {
        return Region.outsideEventManager_;
    }
    GetIntersectionObserverManager() {
        return (this.intersectionObserverManager_ = (this.intersectionObserverManager_ || new IntersectionObserverManager(this.id_)));
    }
    GetResizeObserver() {
        return (this.resizeObserver_ = (this.resizeObserver_ || new ResizeObserver(this.id_)));
    }
    SetAlertHandler(handler) {
        return Region.SetAlertHandler(handler);
    }
    GetAlertHandler() {
        return Region.alertHandler_;
    }
    Alert(data) {
        return Region.Alert(data);
    }
    ParseAnimation(options, target, parse) {
        if (!target || typeof target === 'function') {
            return Region.ParseAnimation(options, target, parse);
        }
        if (!Region.animationParser_ || !parse) {
            return Region.noAnimation_;
        }
        let parsed = Region.animationParser_.Parse(options, target);
        if (!parsed) {
            return Region.noAnimation_;
        }
        let elementScope = this.AddElement(target);
        if (!elementScope) {
            return parsed;
        }
        let regionId = this.id_, active = false, scopeId = this.GenerateDirectiveScopeId(null, '_anime');
        elementScope.locals['$animation'] = Region.CreateProxy((prop) => {
            if (prop === 'active') {
                Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                return active;
            }
        }, ['active', 'cancel']);
        parsed.AddBeforeHandler(() => {
            if (!active) {
                active = true;
                Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
            }
        });
        parsed.AddAfterHandler((isCanceled) => {
            if (!isCanceled && active) {
                active = false;
                Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
            }
        });
        return parsed;
    }
    GetRootProxy() {
        if (this.componentKey_ && this.componentKey_ in Region.components_) {
            let targetRegion = Region.Get(Region.components_[this.componentKey_]);
            return (targetRegion ? targetRegion.rootProxy_ : this.rootProxy_);
        }
        return this.rootProxy_;
    }
    FindProxy(path) {
        if (path === this.rootProxy_.GetName()) {
            return this.rootProxy_;
        }
        return ((path in this.proxies_) ? this.proxies_[path] : null);
    }
    AddProxy(proxy) {
        this.proxies_[proxy.GetPath()] = proxy;
    }
    RemoveProxy(path) {
        delete this.proxies_[path];
    }
    AddRef(key, element) {
        this.refs_[key] = element;
    }
    GetRefs() {
        return this.refs_;
    }
    AddElement(element, check = true) {
        if (check) { //Check for existing
            let scope = this.GetElementScope(element);
            if (scope) {
                return scope;
            }
        }
        if (!element || (element !== this.rootElement_ && !this.rootElement_.contains(element))) {
            return null;
        }
        let id;
        if (this.lastElementId_ === null) {
            id = (this.lastElementId_ = 0);
        }
        else {
            id = ++this.lastElementId_;
        }
        let key = `${this.id_}.${id}`;
        this.elementScopes_[key] = {
            key: key,
            element: element,
            locals: {},
            uninitCallbacks: new Array(),
            changeRefs: new Array(),
            directiveManager: null,
            preProcessCallbacks: new Array(),
            postProcessCallbacks: new Array(),
            eventExpansionCallbacks: new Array(),
            attributeChangeCallbacks: new Array(),
            ifConditionChange: null,
            trapInfoList: new Array(),
            removed: false,
            preserve: false,
            preserveSubscriptions: false,
            paused: false,
            isRoot: false,
            controlCount: 0,
        };
        element.setAttribute(Region.GetElementKeyName(), key);
        return this.elementScopes_[key];
    }
    RemoveElement(element, preserve = false) {
        let scope = this.GetElementScope(element);
        if (scope) {
            if (scope.paused) { //Paused removal
                scope.paused = false;
                return;
            }
            scope.uninitCallbacks.splice(0).forEach((callback) => {
                try {
                    callback();
                }
                catch (err) {
                    this.state_.ReportError(err, `InlineJs.Region<${this.id_}>.$uninit`);
                }
            });
            if (!preserve && !scope.preserve) {
                Region.directiveManager_.Expunge(scope.element);
                if (this.intersectionObserverManager_) {
                    this.intersectionObserverManager_.RemoveAll(scope.element);
                }
                if (this.resizeObserver_) {
                    this.resizeObserver_.Unbind(scope.element);
                }
                if (!scope.preserveSubscriptions) {
                    Region.UnsubscribeAll(scope.changeRefs);
                    scope.changeRefs = [];
                    scope.element.removeAttribute(Region.GetElementKeyName());
                }
            }
            else {
                scope.preserve = !(preserve = true);
            }
            if (!(scope.element instanceof HTMLTemplateElement) && scope.element.tagName.toLowerCase() !== 'svg') {
                Array.from(scope.element.children).forEach(child => this.RemoveElement(child, preserve));
            }
            if (!preserve) { //Delete scope
                scope.trapInfoList.forEach((info) => {
                    if (!info.stopped) {
                        info.stopped = true;
                        info.callback([]);
                    }
                });
                delete this.elementScopes_[scope.key];
                if (scope.element === this.rootElement_) { //Remove from map
                    Region.hooks_.forEach((hook) => {
                        try {
                            hook(this, false);
                        }
                        catch (_a) { }
                    });
                    this.AddNextTickCallback(() => {
                        Region.evaluator_.RemoveProxyCache(this.id_);
                        if (this.componentKey_ && this.componentKey_ in Region.components_) {
                            delete Region.components_[this.componentKey_];
                        }
                        delete Region.entries_[this.id_];
                    });
                }
            }
        }
        else if (typeof element !== 'string') {
            Array.from(element.children).forEach(child => this.RemoveElement(child, preserve));
        }
    }
    MarkElementAsRemoved(element) {
        let scope = this.GetElementScope(element);
        if (scope) {
            scope.removed = true;
        }
    }
    ElementIsRemoved(element) {
        let scope = this.GetElementScope(element);
        return (scope && scope.removed);
    }
    ElementIsContained(element, checkDocument = true) {
        if (typeof element === 'string') {
            return (element && element in this.elementScopes_);
        }
        if (!element || (checkDocument && !document.contains(element))) {
            return false;
        }
        let key = element.getAttribute(Region.GetElementKeyName());
        return ((key && key in this.elementScopes_) || this.ElementIsContained(element, false));
    }
    ElementExists(element) {
        let scope = this.GetElementScope(element);
        return (scope && !scope.removed);
    }
    AddNextTickCallback(callback) {
        this.nextTickCallbacks_.push(callback);
        this.changes_.Schedule();
    }
    ExecuteNextTick() {
        if (this.nextTickCallbacks_.length == 0) {
            return;
        }
        let callbacks = this.nextTickCallbacks_;
        let proxy = this.rootProxy_.GetNativeProxy();
        this.nextTickCallbacks_ = new Array();
        callbacks.forEach((callback) => {
            try {
                callback.call(proxy);
            }
            catch (err) {
                this.state_.ReportError(err, `InlineJs.Region<${this.id_}>.$nextTick`);
            }
        });
    }
    AddLocal(element, key, value) {
        let scope = ((typeof element === 'string') ? this.GetElementScope(element) : this.AddElement(element, true));
        if (scope) {
            scope.locals = (scope.locals || {});
            scope.locals[key] = value;
        }
    }
    GetLocal(element, key, bubble = true, useNull = false) {
        if (!element) {
            return (useNull ? null : new NoResult());
        }
        if (typeof element !== 'string') {
            for (let i = 0; i < this.localHandlers_.length; ++i) {
                if (this.localHandlers_[i].element === element) {
                    return this.localHandlers_[i].callback(element, key, bubble, useNull);
                }
            }
        }
        let scope = this.GetElementScope(element);
        if (scope && key in scope.locals) {
            return scope.locals[key];
        }
        if (!bubble || typeof element === 'string') {
            return (useNull ? null : new NoResult());
        }
        for (let ancestor = this.GetElementAncestor(element, 0); ancestor; ancestor = this.GetElementAncestor(ancestor, 0)) {
            scope = this.GetElementScope(ancestor);
            if (scope && key in scope.locals) {
                return scope.locals[key];
            }
        }
        return (useNull ? null : new NoResult());
    }
    AddLocalHandler(element, callback) {
        this.localHandlers_.push({
            element: element,
            callback: callback
        });
    }
    RemoveLocalHandler(element) {
        this.localHandlers_ = this.localHandlers_.filter(info => (info.element !== element));
    }
    GetObserver() {
        return this.observer_;
    }
    ExpandEvent(event, element) {
        let scope = this.GetElementScope(element);
        if (!scope) {
            return event;
        }
        for (let i = 0; i < scope.eventExpansionCallbacks.length; ++i) {
            let expanded = scope.eventExpansionCallbacks[i](event);
            if (expanded !== null) {
                return expanded;
            }
        }
        return event;
    }
    ForwardEventBinding(element, directiveValue, directiveOptions, event) {
        let name = Region.GetConfig().GetDirectiveName('on');
        return Region.directiveManager_.Handle(this, element, {
            original: name,
            expanded: name,
            parts: ['on'],
            raw: 'on',
            key: 'on',
            arg: {
                key: event,
                options: directiveOptions,
            },
            value: directiveValue,
        });
    }
    Call(target, ...args) {
        return ((target.name in this.rootProxy_.GetTarget()) ? target.call(this.rootProxy_.GetNativeProxy(), ...args) : target(...args));
    }
    AddTemp(callback) {
        let key = `Region<${this.id_}>.temp<${++this.tempCallbacksId_}>`;
        this.tempCallbacks_[key] = callback;
        return key;
    }
    CallTemp(key) {
        if (!(key in this.tempCallbacks_)) {
            return null;
        }
        let callback = this.tempCallbacks_[key];
        delete this.tempCallbacks_[key];
        return callback();
    }
    AddComponent(element, key) {
        if (!key || this.rootElement_ !== element || this.componentKey_) {
            return false;
        }
        this.componentKey_ = key;
        if (!(key in Region.components_)) {
            Region.components_[key] = this.id_;
        }
        return true;
    }
    Get(id) {
        return Region.Get(id);
    }
    GetCurrent(id) {
        return Region.GetCurrent(id);
    }
    Infer(element) {
        return Region.Infer(element);
    }
    Find(key, getNativeProxy) {
        return (getNativeProxy ? Region.Find(key, true) : Region.Find(key, false));
    }
    PushPostProcessCallback() {
        Region.PushPostProcessCallback();
    }
    PopPostProcessCallback() {
        Region.PopPostProcessCallback();
    }
    AddPostProcessCallback(callback) {
        Region.AddPostProcessCallback(callback);
    }
    TraversePostProcessCallbacks(handler) {
        Region.TraversePostProcessCallbacks(handler);
    }
    ExecutePostProcessCallbacks(pop = true) {
        Region.ExecutePostProcessCallbacks(pop);
    }
    IsObject(target) {
        return Region.IsObject(target);
    }
    IsEqual(first, second) {
        return Region.IsEqual(first, second);
    }
    DeepCopy(target) {
        return Region.DeepCopy(target);
    }
    UnsubscribeAll(list) {
        Region.UnsubscribeAll(list);
    }
    GetElementKeyName() {
        return Region.GetElementKeyName();
    }
    static GetEntries() {
        return Region.entries_;
    }
    static GetEvaluator() {
        return Region.evaluator_;
    }
    static GetProcessor() {
        return Region.processor_;
    }
    static GetConfig() {
        return Region.config_;
    }
    static GetDatabase(createIfNotExists = true) {
        if (!createIfNotExists || Region.database_) {
            return Region.database_;
        }
        let db = new Database(Region.config_.GetAppName() || 'defaultdb');
        db.Open();
        return (Region.database_ = db);
    }
    static GetDirectiveManager() {
        return Region.directiveManager_;
    }
    static GetGlobalManager() {
        return Region.globalManager_;
    }
    static SetAlertHandler(handler) {
        let oldHandler = Region.alertHandler_;
        Region.alertHandler_ = handler;
        return oldHandler;
    }
    static GetAlertHandler() {
        return Region.alertHandler_;
    }
    static Alert(data) {
        return (Region.alertHandler_ ? Region.alertHandler_.Alert(data) : false);
    }
    static SetAnimationParser(parser) {
        Region.animationParser_ = parser;
    }
    static GetAnimationParser() {
        return Region.animationParser_;
    }
    static ParseAnimation(options, target, parse = true) {
        return ((Region.animationParser_ && parse) ? (Region.animationParser_.Parse(options, target) || Region.noAnimation_) : Region.noAnimation_);
    }
    static Get(id) {
        return ((id && id in Region.entries_) ? Region.entries_[id] : null);
    }
    static GetCurrent(id) {
        return Region.Get(Region.scopeRegionIds_.Peek() || id);
    }
    static Infer(element) {
        if (!element) {
            return null;
        }
        let key = ((typeof element === 'string') ? element : element.getAttribute(Region.GetElementKeyName()));
        if (!key) {
            return null;
        }
        return Region.Get(key.split('.')[0]);
    }
    static RemoveElement(element, preserve = false) {
        let region = Region.Infer(element);
        if (!region) {
            Array.from(element.children).forEach(child => Region.RemoveElement(child));
        }
        else {
            region.RemoveElement(element, preserve);
        }
    }
    static Find(key, getNativeProxy) {
        if (!key || !(key in Region.components_)) {
            return null;
        }
        let region = Region.Get(Region.components_[key]);
        return (region ? (getNativeProxy ? region.rootProxy_.GetNativeProxy() : region) : null);
    }
    static PushPostProcessCallback() {
        Region.postProcessCallbacks_.Push(Region.forcedPostProcessCallbacks_);
        Region.forcedPostProcessCallbacks_ = new Array();
    }
    static PopPostProcessCallback() {
        Region.postProcessCallbacks_.Pop();
    }
    static AddPostProcessCallback(callback, forced = false) {
        let list = Region.postProcessCallbacks_.Peek();
        if (list) {
            list.push(callback);
        }
        else if (forced) {
            Region.forcedPostProcessCallbacks_.push(callback);
        }
    }
    static TraversePostProcessCallbacks(handler) {
        let list = Region.postProcessCallbacks_.Peek();
        if (list) {
            list.forEach(handler);
        }
    }
    static ExecutePostProcessCallbacks(pop = true) {
        let list = (pop ? Region.postProcessCallbacks_.Pop() : Region.postProcessCallbacks_.Peek());
        if (list) {
            list.forEach((callback) => {
                try {
                    callback();
                }
                catch (err) {
                    console.error(err, 'InlineJs.Region<NIL>.ExecutePostProcessCallbacks');
                }
            });
        }
    }
    static IsObject(target) {
        return (target && typeof target === 'object' && (('__InlineJS_Target__' in target) || (target.__proto__ && target.__proto__.constructor.name === 'Object')));
    }
    static IsEqual(first, second) {
        let firstIsObject = (first && typeof first === 'object'), secondIsObject = (second && typeof second === 'object');
        if (firstIsObject && '__InlineJS_Target__' in first) { //Get underlying object
            first = first['__InlineJS_Target__'];
        }
        if (secondIsObject && '__InlineJS_Target__' in second) { //Get underlying object
            second = second['__InlineJS_Target__'];
        }
        if (firstIsObject != secondIsObject) {
            return false;
        }
        if (!firstIsObject) {
            return (first == second);
        }
        if (Array.isArray(first)) {
            if (!Array.isArray(second) || first.length != second.length) {
                return false;
            }
            for (let i = 0; i < first.length; ++i) {
                if (!Region.IsEqual(first[i], second[i])) {
                    return false;
                }
            }
            return true;
        }
        if (!Region.IsObject(first) || !Region.IsObject(second)) {
            return (first === second);
        }
        if (Object.keys(first).length != Object.keys(second).length) {
            return false;
        }
        for (let key in first) {
            if (!(key in second) || !Region.IsEqual(first[key], second[key])) {
                return false;
            }
        }
        return true;
    }
    static DeepCopy(target) {
        let isObject = (target && typeof target === 'object');
        if (isObject && '__InlineJS_Target__' in target) { //Get underlying object
            target = target['__InlineJS_Target__'];
        }
        if (!isObject) {
            return target;
        }
        if (Array.isArray(target)) {
            let copy = [];
            target.forEach(item => copy.push(Region.DeepCopy(item)));
            return copy;
        }
        if (!Region.IsObject(target)) {
            return target;
        }
        let copy = {};
        for (let key in target) {
            copy[key] = Region.DeepCopy(target[key]);
        }
        return copy;
    }
    static ToString(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (value === null || value === undefined) {
            return '';
        }
        if (value === true) {
            return 'true';
        }
        if (value === false) {
            return 'false';
        }
        if (typeof value === 'object' && '__InlineJS_Target__' in value) {
            return Region.ToString(value['__InlineJS_Target__']);
        }
        if (Region.IsObject(value) || Array.isArray(value)) {
            return JSON.stringify(value);
        }
        return value.toString();
    }
    static CreateProxy(getter, contains, setter, target) {
        let hasTarget = !!target;
        let handler = {
            get(target, prop) {
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')) {
                    return Reflect.get(target, prop);
                }
                return getter(prop.toString());
            },
            set(target, prop, value) {
                if (hasTarget) {
                    return (setter ? setter(prop, value, target) : Reflect.set(target, prop, value));
                }
                return (setter && setter(prop, value, target));
            },
            deleteProperty(target, prop) {
                return (hasTarget ? Reflect.deleteProperty(target, prop) : false);
            },
            has(target, prop) {
                if (Reflect.has(target, prop)) {
                    return true;
                }
                if (!contains) {
                    return false;
                }
                return ((typeof contains === 'function') ? contains(prop.toString()) : contains.includes(prop.toString()));
            }
        };
        return new window.Proxy((target || {}), handler);
    }
    static UnsubscribeAll(list) {
        (list || []).forEach((info) => {
            let region = Region.Get(info.regionId);
            if (region) {
                region.changes_.Unsubscribe(info.subscriptionId);
            }
        });
    }
    static InsertHtml(target, value, replace = true, append = true, region) {
        if (replace) { //Remove all child nodes
            let targetRegion = (region || Region.Infer(target)), removeOffspring = (node) => {
                Array.from(node.childNodes).forEach((child) => {
                    if (child.nodeType === 1) {
                        let myRegion = (targetRegion || Region.Infer(child));
                        if (myRegion) {
                            myRegion.RemoveElement(child);
                        }
                        else {
                            removeOffspring(child);
                        }
                    }
                });
            };
            removeOffspring(target);
            Array.from(target.childNodes).forEach(child => target.removeChild(child));
            Region.ExecutePostProcessCallbacks();
        }
        let tmpl = document.createElement('template');
        tmpl.innerHTML = value;
        let childNodes = [...tmpl.content.childNodes];
        if (replace || append) {
            target.append(...childNodes);
        }
        else { //Insert before child nodes
            target.prepend(...childNodes);
        }
        if (region && !region.GetDoneInit()) { //Mutation observer not yet bound
            let scope = region.GetElementScope(target);
            if (scope) { //Schedule processing
                scope.postProcessCallbacks.push(() => {
                    Region.processor_.All(region, target, {
                        checkDocument: true,
                    });
                });
            }
        }
    }
    static GetElementKeyName() {
        return '__inlinejs_key__';
    }
}
Region.components_ = {};
Region.postProcessCallbacks_ = new Stack();
Region.forcedPostProcessCallbacks_ = new Array();
Region.lastId_ = 0;
Region.lastSubId_ = null;
Region.entries_ = {};
Region.scopeRegionIds_ = new Stack();
Region.hooks_ = new Array();
Region.evaluator_ = new Evaluator(Region.Get, Region.GetElementKeyName(), Region.scopeRegionIds_);
Region.config_ = new Config();
Region.database_ = null;
Region.directiveManager_ = new DirectiveManager();
Region.globalManager_ = new GlobalManager(Region.Get, Region.Infer);
Region.outsideEventManager_ = new OutsideEventManager();
Region.alertHandler_ = null;
Region.processor_ = new Processor(Region.config_, Region.directiveManager_);
Region.animationParser_ = null;
Region.noAnimation_ = new NoAnimation();
