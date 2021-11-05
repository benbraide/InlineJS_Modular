"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterGlobalHandler = exports.MountDirectiveHandler = exports.BackDirectiveHandler = exports.NavDirectiveHandler = exports.LinkDirectiveHandler = exports.RegisterDirectiveHandler = exports.RouterDirectiveHandler = exports.BackPath = void 0;
const typedefs_1 = require("../typedefs");
const generic_1 = require("../directives/extended/generic");
const fetch_1 = require("../utilities/fetch");
const generic_2 = require("./generic");
const region_1 = require("../region");
const bootstrap_1 = require("../bootstrap");
class BackPath {
}
exports.BackPath = BackPath;
class RouterDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router) {
        super(router.GetKey(), (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            if (directive.arg.key === 'load' || generic_1.ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)) {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }
            if (directive.arg.key === 'reload' || directive.arg.key === 'entry' || directive.arg.key === 'in' || directive.arg.key === 'out') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.RouterDirectiveHandler = RouterDirectiveHandler;
class RegisterDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.register`, (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load');
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let elementScope = region.AddElement(element);
            if (!elementScope) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let info = {
                path: '',
                name: null,
                title: null,
                middleware: null,
                onLoad: null,
            };
            let data = generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
            if (region_1.Region.IsObject(info)) {
                Object.entries(data).forEach(([key, value]) => {
                    if (key in info) {
                        info[key] = value;
                    }
                });
            }
            else if (typeof data === 'string') {
                info.path = data;
            }
            let id = this.router_.Register(info);
            elementScope.uninitCallbacks.push(() => {
                this.router_.Unregister(id);
            });
            info.onLoad = (reloaded) => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.load`, {
                    detail: {
                        reloaded: reloaded,
                    },
                }));
            };
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
    }
}
exports.RegisterDirectiveHandler = RegisterDirectiveHandler;
class LinkDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.link`, (region, element, directive) => {
            let elementScope = region.AddElement(element);
            if (!elementScope) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let path = '', extractedPath = null, routerPath = this.router_.GetActivePage(), regionId = region.GetId();
            let active = (extractedPath && routerPath && extractedPath.base === routerPath.base), scopeId = this.GenerateScopeId_(region);
            let getPathFromElement = () => {
                if (element instanceof HTMLAnchorElement) {
                    return this.router_.ProcessUrl(element.href);
                }
                return ((element instanceof HTMLFormElement) ? this.router_.ProcessUrl(element.action) : '');
            };
            let extractPathInfo = () => {
                let targetPath = (path || getPathFromElement());
                let queryStartIndex = targetPath.indexOf('?');
                return {
                    base: ((queryStartIndex == -1) ? targetPath : targetPath.substr(0, queryStartIndex)),
                    query: ((queryStartIndex == -1) ? '' : targetPath.substr(queryStartIndex + 1)),
                };
            };
            let updateActive = () => {
                if ((extractedPath && routerPath && extractedPath.base === routerPath.base) != active) {
                    active = !active;
                    region_1.Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
                }
            };
            let onLoad = (path) => {
                routerPath = path;
                updateActive();
            };
            let shouldReload = directive.arg.options.includes('reload'), afterEvent = null, onEvent = (e) => {
                e.preventDefault();
                extractedPath = extractPathInfo();
                updateActive();
                if (afterEvent) {
                    afterEvent(e);
                }
                this.router_.Goto(extractedPath, () => {
                    if (!shouldReload) { //Scroll top
                        window.scrollTo({ top: -window.scrollY, left: 0, behavior: 'smooth' });
                        return false;
                    }
                    return true;
                });
            };
            let bindEvent = () => {
                if (element instanceof HTMLFormElement) {
                    element.addEventListener('submit', onEvent);
                    return {
                        undo: () => {
                            element.removeEventListener('submit', onEvent);
                        },
                        after: () => {
                            let query = '';
                            (new FormData(element)).forEach((value, key) => {
                                query = (query ? `${query}&${key}=${value.toString()}` : `${key}=${value.toString()}`);
                            });
                            if (query) { //Append query
                                extractedPath.query = (extractedPath.query ? `${extractedPath.query}&${query}` : query);
                            }
                        },
                    };
                }
                element.addEventListener('click', onEvent);
                return {
                    undo: () => {
                        element.removeEventListener('click', onEvent);
                    },
                    after: null,
                };
            };
            region.GetState().TrapGetAccess(() => {
                let data = generic_1.ExtendedDirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value);
                path = ((typeof data === 'string') ? this.router_.ProcessUrl(data.trim()) : '');
                extractedPath = extractPathInfo();
                updateActive();
            }, true, element);
            let bindInfo = bindEvent();
            afterEvent = bindInfo.after;
            let checkActive = directive.arg.options.includes('active');
            if (checkActive) {
                this.router_.BindOnLoad(onLoad);
            }
            elementScope.uninitCallbacks.push(() => {
                bindInfo.undo();
                if (checkActive) {
                    this.router_.UnbindOnLoad(onLoad);
                }
            });
            elementScope.locals['$link'] = region_1.Region.CreateProxy((prop) => {
                if (prop === 'active') {
                    region_1.Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return active;
                }
            }, ['active']);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
    }
}
exports.LinkDirectiveHandler = LinkDirectiveHandler;
class NavDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.nav`, (region, element, directive) => {
            element.querySelectorAll('a').forEach(item => this.link_.Handle(region, item, directive));
            element.querySelectorAll('form').forEach(item => this.link_.Handle(region, item, directive));
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
        this.link_ = new LinkDirectiveHandler(this.router_);
    }
}
exports.NavDirectiveHandler = NavDirectiveHandler;
class BackDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.back`, (region, element, directive) => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.router_.Goto(new BackPath());
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
    }
}
exports.BackDirectiveHandler = BackDirectiveHandler;
class MountDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_, info_) {
        super(`${router_.GetKey()}.mount`, (region, element, directive) => {
            directive.arg.key = region_1.Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'load' || generic_1.ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)) {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }
            if (directive.arg.key === 'error') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.error`);
            }
            this.info_.element = document.createElement(this.info_.type || 'div');
            element.parentElement.insertBefore(this.info_.element, element);
            let lastCallback = null;
            this.info_.fetch = (url, callback) => {
                lastCallback = callback;
                this.fetch_.props.url = url;
                this.fetch_.Get();
            };
            let state = {
                active: false,
                progress: 0,
            };
            let regionId = region.GetId(), setState = (key, value) => {
                if (key in state && !region_1.Region.IsEqual(state[key], value)) {
                    state[key] = value;
                    region_1.Region.Get(regionId).GetChanges().AddComposed(key, `${this.info_.scopeId}.mount`);
                }
            };
            this.fetch_ = new fetch_1.Fetch(null, this.info_.element, {
                onBeforeRequest: () => {
                    setState('active', true);
                    setState('progress', 0);
                },
                onLoad: () => {
                    setState('active', false);
                    setState('progress', 100);
                    window.scrollTo({ top: 0, left: 0 });
                    [...this.info_.element.attributes].forEach(attr => this.info_.element.removeAttribute(attr.name));
                    (new bootstrap_1.Bootstrap()).Attach(this.info_.element);
                    window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                    if (lastCallback) {
                        lastCallback(true);
                    }
                },
                onError: (err) => {
                    setState('active', false);
                    setState('progress', 100);
                    window.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                        detail: { error: err },
                    }));
                    if (lastCallback) {
                        lastCallback(false);
                    }
                },
                onProgress: (value) => {
                    setState('progress', value);
                },
            });
            region.GetElementScope(element).uninitCallbacks.push(() => {
                this.info_ = null;
                this.fetch_ = null;
            });
            this.info_.proxy = region_1.Region.CreateProxy((prop) => {
                if (prop in state) {
                    region_1.Region.Get(regionId).GetChanges().AddGetAccess(`${this.info_.scopeId}.mount.${prop}`);
                    return state[prop];
                }
                if (prop === 'element') {
                    return this.info_.element;
                }
            }, [...Object.keys(state), 'element']);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
        this.info_ = info_;
    }
}
exports.MountDirectiveHandler = MountDirectiveHandler;
class RouterGlobalHandler extends generic_2.GlobalHandler {
    constructor(middlewares_ = new Array(), ajaxPrefix_ = 'ajax', mountElementType = '') {
        super('router', null, null, () => {
            this.mountInfo_ = {
                scopeId: this.scopeId_,
                type: mountElementType,
            };
            region_1.Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this));
            region_1.Region.GetDirectiveManager().AddHandler(new RegisterDirectiveHandler(this));
            region_1.Region.GetDirectiveManager().AddHandler(new LinkDirectiveHandler(this));
            region_1.Region.GetDirectiveManager().AddHandler(new NavDirectiveHandler(this));
            region_1.Region.GetDirectiveManager().AddHandler(new BackDirectiveHandler(this));
            region_1.Region.GetDirectiveManager().AddHandler(new MountDirectiveHandler(this, this.mountInfo_));
            window.addEventListener('popstate', this.onEvent_);
            this.proxy_ = region_1.Region.CreateProxy((prop) => {
                if (prop === 'doMount') {
                    return () => this.Mount();
                }
                if (prop === 'active') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.active_;
                }
                if (prop === 'page') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.activePage_ ? Object.assign({}, this.activePage_) : null);
                }
                if (prop === 'title') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.currentTitle_ || 'Untitled');
                }
                if (prop === 'url') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.currentUrl_;
                }
                if (prop === 'mount') {
                    return this.mountInfo_.proxy;
                }
                if (prop === 'register') {
                    return (page) => this.Register(page);
                }
                if (prop === 'addOnEntry') {
                    return (handler) => this.entryCallbacks_.push(handler);
                }
                if (prop === 'removeOnEntry') {
                    return (handler) => this.entryCallbacks_.splice(this.entryCallbacks_.findIndex(item => (item === handler)), 1);
                }
            }, ['doMount', 'active', 'page', 'title', 'url', 'mount', 'register', 'addOnEntry', 'removeOnEntry'], (prop, value) => {
                if (typeof prop !== 'string') {
                    return true;
                }
                if (prop === 'title' && value !== this.currentTitle_) {
                    generic_2.GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                    this.currentTitle_ = value;
                }
                else if (prop === 'url') {
                    this.Goto(value);
                }
                return true;
            });
        }, () => {
            this.proxy_ = null;
            window.removeEventListener('popstate', this.onEvent_);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.mount`);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.back`);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.nav`);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.link`);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.register`);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
            this.mountInfo_ = null;
        });
        this.middlewares_ = middlewares_;
        this.ajaxPrefix_ = ajaxPrefix_;
        this.onLoadHandlers_ = new Array();
        this.active_ = false;
        this.entryCallbacks_ = new Array();
        this.lastPageId_ = 0;
        this.pages_ = new Array();
        this.activePage_ = null;
        this.currentUrl_ = null;
        this.currentQuery_ = null;
        this.currentTitle_ = '';
        this.scopeId_ = generic_2.GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        this.origin_ = window.location.origin;
        if (this.origin_) { //Remove trailing slashes
            this.origin_ = this.origin_.replace(/\/+$/, '');
        }
        this.middlewares_ = (this.middlewares_ || []);
        this.onEvent_ = (e) => {
            if (e.state) {
                this.Load_(this.BuildPath(e.state));
            }
        };
        this.url_ = window.location.href;
        this.ajaxPrefix_ = this.ProcessUrl(this.ajaxPrefix_);
    }
    Mount() {
        this.Load_(this.BuildPath(this.url_));
    }
    Register(page) {
        if (!page.path) {
            return 0;
        }
        if (typeof page.path === 'string') {
            page.path = this.ProcessUrl(page.path);
        }
        let info = {
            id: ++this.lastPageId_,
            path: page.path,
            name: (page.name || ''),
            title: (page.title || 'Untitled'),
            middlewares: ((typeof page.middleware === 'string') ? (page.middleware ? [page.middleware] : []) : (page.middleware || [])),
            onLoad: page.onLoad,
        };
        this.pages_.push(info);
        return info.id;
    }
    Unregister(id) {
        this.pages_.splice(this.pages_.findIndex(page => (page.id == id)), 1);
    }
    Goto(target, shouldReload) {
        if (target instanceof BackPath) {
            return;
        }
        this.Load_(((typeof target === 'string') ? this.BuildPath(target) : target), (url, title) => {
            window.history.pushState(url, title, url);
        }, shouldReload);
    }
    Reload() {
        this.Goto(this.currentUrl_, true);
    }
    BindOnLoad(handler) {
        this.onLoadHandlers_.push(handler);
    }
    UnbindOnLoad(handler) {
        this.onLoadHandlers_.splice(this.onLoadHandlers_.indexOf(handler), 1);
    }
    GetCurrentUrl() {
        return this.currentUrl_;
    }
    GetCurrentQuery(key) {
        return (key ? ((key in this.currentQuery_) ? this.currentQuery_[key] : null) : this.currentQuery_);
    }
    GetActivePage() {
        return this.BuildPath(this.currentUrl_);
    }
    ProcessUrl(url, includeAjaxPrefix = false) {
        url = (url ? url.trim() : '');
        if (!url) {
            return '';
        }
        url = url.replace(/\/+$/, ''); //Truncate '/'
        if (url === this.origin_) { //Root
            return (includeAjaxPrefix ? (this.ajaxPrefix_ || '/') : '/');
        }
        if (url.startsWith(`${this.origin_}/`)) { //Skip origin
            url = url.substr(this.origin_.length);
        }
        if (includeAjaxPrefix && this.ajaxPrefix_) {
            return (url.startsWith('/') ? `${this.ajaxPrefix_}${url}` : `${this.ajaxPrefix_}/${url}`);
        }
        return (url.startsWith('/') ? url : `/${url}`);
    }
    ProcessQuery(query) {
        query = query.trim();
        if (query) { //Trim '&'s
            query = query.replace(/\&+$/, '').replace(/^\&+/, '');
        }
        return ((!query || query.startsWith('?')) ? (query || '') : `?${query}`);
    }
    BuildUrl(path, absolute = true, process = true, includeAjaxPrefix = false) {
        let base = (process ? this.ProcessUrl(path.base, includeAjaxPrefix) : path.base), query = (process ? this.ProcessQuery(path.query) : path.query), url;
        if (query) {
            if (query.startsWith('?') || query.startsWith('&')) {
                query = query.substr(1);
            }
            url = (base.includes('?') ? `${base}&${query}` : `${base}?${query}`);
        }
        else {
            url = base;
        }
        return (absolute ? `${this.origin_}${url}` : url);
    }
    BuildPath(url) {
        url = this.ProcessUrl(url);
        let queryIndex = url.indexOf('?');
        return {
            base: ((queryIndex == -1) ? url : url.substr(0, queryIndex)),
            query: ((queryIndex == -1) ? '' : url.substr(queryIndex + 1)),
        };
    }
    BuildQuery(query, shouldDecode = true) {
        query = query.trim();
        if (!query) {
            return {};
        }
        let formatted = {}, decode = (value) => {
            return (shouldDecode ? decodeURIComponent(value.replace(/\+/g, ' ')) : value);
        };
        query.split('&').map(part => part.trim()).forEach((part) => {
            if (part.startsWith('=')) {
                return; //Malformed
            }
            let pair = part.split('=');
            if (pair.length > 1 && pair[0].endsWith('[]')) { //Array values
                let key = decode(pair[0].substr(0, (pair[0].length - 2)));
                if (key in formatted && Array.isArray(formatted[key])) { //Append
                    formatted[key].push(decode(pair[1]));
                }
                else { //Assign
                    formatted[key] = [decode(pair[1])];
                }
            }
            else if (pair.length > 1) { //Single value
                formatted[decode(pair[0])] = decode(pair[1]);
            }
            else if (pair.length == 1) { //No value
                formatted[decode(pair[0])] = null;
            }
        });
        return formatted;
    }
    SetActiveState_(state, callHandlers = true) {
        if (state == this.active_) {
            return;
        }
        generic_2.GlobalHandler.region_.GetChanges().AddComposed('active', this.scopeId_);
        this.active_ = state;
        if (callHandlers) {
            this.entryCallbacks_.forEach((callback) => {
                try {
                    callback(state);
                }
                catch (_a) { }
            });
            window.dispatchEvent(new CustomEvent(`${this.key_}.entry`, {
                detail: {
                    active: state,
                },
            }));
            if (state) {
                window.dispatchEvent(new CustomEvent(`${this.key_}.in`));
            }
            else {
                window.dispatchEvent(new CustomEvent(`${this.key_}.out`));
            }
        }
    }
    Load_(path, callback, shouldReload) {
        let page = this.FindPage_(path), processedPath = {
            base: this.ProcessUrl(path.base),
            query: this.ProcessQuery(path.query),
        };
        this.SetActiveState_(true);
        if (!page) { //Page not found
            let notFoundText = 'Page Not Found';
            if (notFoundText !== this.currentTitle_) {
                generic_2.GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                this.currentTitle_ = notFoundText;
            }
            if (callback) {
                callback(this.BuildUrl(processedPath, true, false), notFoundText);
            }
            if (this.mountInfo_.fetch) {
                this.mountInfo_.fetch(this.BuildUrl(this.BuildPath('/404'), true, true, true), () => {
                    this.SetActiveState_(false);
                });
            }
            else {
                this.SetActiveState_(false);
            }
            return;
        }
        for (let i = 0; i < page.middlewares.length; ++i) {
            let middleware = page.middlewares[i];
            if (middleware in this.middlewares_ && this.middlewares_[middleware].Handle(path) === false) {
                this.SetActiveState_(false);
                return; //Rejected
            }
        }
        let checkShouldReload = () => {
            if (!shouldReload) {
                return false;
            }
            return ((typeof shouldReload === 'boolean') ? shouldReload : shouldReload());
        };
        let url = this.BuildUrl(processedPath, true, false), isNewUrl = false;
        if (url === this.currentUrl_) {
            window.dispatchEvent(new CustomEvent(`${this.key_}.reload`));
            if (!checkShouldReload()) {
                this.SetActiveState_(false);
                return; //Reload rejected
            }
        }
        else { //New url
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('url', this.scopeId_);
            this.currentUrl_ = url;
            this.currentQuery_ = this.BuildQuery(this.BuildPath(url).query);
            isNewUrl = true;
        }
        let isNewPage = (page !== this.activePage_);
        if (isNewPage) {
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('page', this.scopeId_);
            this.activePage_ = page;
        }
        if (page.title !== this.currentTitle_) {
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
            this.currentTitle_ = page.title;
        }
        if (callback) {
            callback(url, page.title);
        }
        else if (isNewPage) {
            document.title = (page.title || 'Untitled');
        }
        if (this.mountInfo_.fetch) {
            this.mountInfo_.fetch((this.ajaxPrefix_ ? this.BuildUrl(processedPath, true, true, true) : url), () => {
                this.SetActiveState_(false);
            });
        }
        else { //No mount
            this.SetActiveState_(false);
        }
        if (isNewUrl) {
            this.onLoadHandlers_.forEach((handler) => {
                try {
                    handler(Object.assign(Object.assign({}, processedPath), { formattedQuery: this.currentQuery_ }));
                }
                catch (_a) { }
            });
        }
        window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
    }
    FindPage_(target) {
        let targetPath = ((typeof target === 'string') ? target : target.base);
        if (!targetPath) {
            return null;
        }
        let processedTarget = this.ProcessUrl(targetPath);
        return this.pages_.find((page) => {
            return (page.name === targetPath || ((typeof page.path === 'string') ? (page.path === processedTarget) : page.path.test(processedTarget)));
        });
    }
}
exports.RouterGlobalHandler = RouterGlobalHandler;
