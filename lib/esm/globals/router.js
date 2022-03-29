import { DirectiveHandlerReturn } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { Fetch } from '../utilities/fetch';
import { GlobalHandler } from './generic';
import { Region } from '../region';
import { Bootstrap } from '../bootstrap';
export class BackPath {
}
export class RouterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(router, mountInfo, modal = null) {
        super(router.GetKey(), (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return DirectiveHandlerReturn.Handled;
            }
            if (directive.arg.key === 'load' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)) {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }
            if (directive.arg.key === 'reload' || directive.arg.key === 'entry' || directive.arg.key === 'in' || directive.arg.key === 'out') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }
            let elementScope = region.AddElement(element);
            if (!elementScope) {
                return DirectiveHandlerReturn.Handled;
            }
            if (directive.arg.key === 'register') {
                let info = {
                    path: '',
                    name: null,
                    title: null,
                    middleware: null,
                    onLoad: null,
                };
                let data = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
                if (Region.IsObject(data)) {
                    Object.entries(data).forEach(([key, value]) => {
                        if (key in info) {
                            info[key] = value;
                        }
                    });
                }
                else if (typeof data === 'string') {
                    info.path = data;
                }
                let id = router.Register(info);
                elementScope.uninitCallbacks.push(() => {
                    router.Unregister(id);
                });
                info.onLoad = (reloaded) => {
                    window.dispatchEvent(new CustomEvent(`${this.key_}.load`, {
                        detail: {
                            reloaded: reloaded,
                        },
                    }));
                };
            }
            else if (directive.arg.key === 'link') {
                let path = '', extractedPath = null, routerPath = router.GetActivePage(), regionId = region.GetId();
                let active = (extractedPath && routerPath && extractedPath.base === routerPath.base), scopeId = this.GenerateScopeId_(region);
                let getPathFromElement = () => {
                    if (element instanceof HTMLAnchorElement) {
                        return router.ProcessUrl(element.href);
                    }
                    return ((element instanceof HTMLFormElement) ? router.ProcessUrl(element.action) : '');
                };
                let extractPathInfo = (targetPath = '') => {
                    targetPath = (targetPath || path || getPathFromElement());
                    let queryStartIndex = targetPath.indexOf('?');
                    return {
                        base: ((queryStartIndex == -1) ? targetPath : targetPath.substring(0, (queryStartIndex + 1))),
                        query: ((queryStartIndex == -1) ? '' : targetPath.substring(queryStartIndex + 1)),
                    };
                };
                let updateActive = () => {
                    if ((extractedPath && routerPath && extractedPath.base === routerPath.base) != active) {
                        active = !active;
                        Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
                    }
                };
                let onLoad = (path) => {
                    routerPath = path;
                    updateActive();
                };
                let shouldReload = directive.arg.options.includes('reload'), afterEvent = null, onEvent = (e) => {
                    e.preventDefault();
                    let targetPath = (path || getPathFromElement());
                    if (modal && targetPath.startsWith('modal://')) {
                        modal.SetUrl(targetPath);
                        return;
                    }
                    extractedPath = extractPathInfo(targetPath);
                    updateActive();
                    if (afterEvent) {
                        afterEvent(e);
                    }
                    router.Goto(extractedPath, () => {
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
                if (directive.value !== Region.GetConfig().GetDirectiveName(this.key_)) {
                    region.GetState().TrapGetAccess(() => {
                        let data = ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                        path = ((typeof data === 'string') ? router.ProcessUrl(data.trim()) : '');
                        extractedPath = extractPathInfo();
                        updateActive();
                    }, true, element);
                }
                let bindInfo = bindEvent();
                afterEvent = bindInfo.after;
                let checkActive = directive.arg.options.includes('active');
                if (checkActive) {
                    router.BindOnLoad(onLoad);
                }
                elementScope.uninitCallbacks.push(() => {
                    bindInfo.undo();
                    if (checkActive) {
                        router.UnbindOnLoad(onLoad);
                    }
                });
                elementScope.locals['$link'] = Region.CreateProxy((prop) => {
                    if (prop === 'active') {
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                        return active;
                    }
                }, ['active']);
            }
            else if (directive.arg.key === 'nav') {
                directive.arg.key = 'link';
                element.querySelectorAll('a').forEach(item => this.Handle(region, item, directive));
                element.querySelectorAll('form').forEach(item => this.Handle(region, item, directive));
            }
            else if (directive.arg.key === 'back') {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    router.Goto(new BackPath());
                });
            }
            else if (directive.arg.key === 'mount') {
                if (directive.arg.options.includes('load')) {
                    return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.mount.load`);
                }
                if (directive.arg.options.includes('error')) {
                    return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.mount.error`);
                }
                let nextSibling = element.nextElementSibling;
                if (!nextSibling || nextSibling.getAttribute('data-router') !== 'mount') {
                    mountInfo.element = document.createElement(mountInfo.type || 'div');
                    element.parentElement.insertBefore(mountInfo.element, element);
                }
                else {
                    mountInfo.element = nextSibling;
                }
                let lastCallback = null;
                mountInfo.fetch = (url, callback) => {
                    lastCallback = callback;
                    this.fetch_.props.url = url;
                    this.fetch_.Get();
                };
                let state = {
                    active: false,
                    progress: 0,
                };
                let regionId = region.GetId(), setState = (key, value) => {
                    if (key in state && !Region.IsEqual(state[key], value)) {
                        state[key] = value;
                        Region.Get(regionId).GetChanges().AddComposed(key, `${mountInfo.scopeId}.mount`);
                    }
                };
                this.fetch_ = new Fetch(null, mountInfo.element, {
                    onBeforeRequest: () => {
                        setState('active', true);
                        setState('progress', 0);
                    },
                    onLoad: () => {
                        setState('active', false);
                        setState('progress', 100);
                        window.scrollTo({ top: 0, left: 0 });
                        [...mountInfo.element.attributes].forEach(attr => mountInfo.element.removeAttribute(attr.name));
                        (new Bootstrap()).Attach(mountInfo.element);
                        window.dispatchEvent(new CustomEvent(`${this.key_}.mount.load`));
                        if (lastCallback) {
                            lastCallback(true);
                        }
                    },
                    onError: (err) => {
                        setState('active', false);
                        setState('progress', 100);
                        window.dispatchEvent(new CustomEvent(`${this.key_}.mount.error`, {
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
                    mountInfo = null;
                    this.fetch_ = null;
                });
                mountInfo.proxy = Region.CreateProxy((prop) => {
                    if (prop in state) {
                        Region.Get(regionId).GetChanges().AddGetAccess(`${mountInfo.scopeId}.mount.${prop}`);
                        return state[prop];
                    }
                    if (prop === 'element') {
                        return mountInfo.element;
                    }
                }, [...Object.keys(state), 'element']);
            }
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class RouterGlobalHandler extends GlobalHandler {
    constructor(middlewares_ = new Array(), modal = null, ajaxPrefix_ = 'ajax', mountElementType = '') {
        super('router', null, null, () => {
            this.mountInfo_ = {
                scopeId: this.scopeId_,
                type: mountElementType,
            };
            Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this, this.mountInfo_, modal));
            window.addEventListener('popstate', this.onEvent_);
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'doMount') {
                    return (load = true) => this.Mount(load);
                }
                if (prop === 'active') {
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.active_;
                }
                if (prop === 'page') {
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.activePage_ ? Object.assign({}, this.activePage_) : null);
                }
                if (prop === 'title') {
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.currentTitle_ || 'Untitled');
                }
                if (prop === 'url') {
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
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
                    GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
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
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
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
        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
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
    Mount(load = true) {
        let path = this.BuildPath(this.url_);
        if (!load) {
            let page = this.FindPage_(path), processedPath = {
                base: this.ProcessUrl(path.base),
                query: this.ProcessQuery(path.query),
            };
            this.activePage_ = page;
            this.currentUrl_ = this.BuildUrl(processedPath, true, false);
        }
        else {
            this.Load_(path);
        }
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
        url = url.replace(/[?]{2,}/g, '?').replace(/[&]{2,}/g, '&').replace(/\/+$/, ''); //Truncate '/'
        if (url === this.origin_) { //Root
            return (includeAjaxPrefix ? (this.ajaxPrefix_ || '/') : '/');
        }
        if (url.startsWith(`${this.origin_}/`)) { //Skip origin
            url = url.substring(this.origin_.length);
        }
        if (/^[a-zA-Z0-9_]+:\/\//.test(url)) {
            return url;
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
            query = query.replace(/^[?&]+/g, '').replace(/[?]+/g, '').replace(/[&]{2,}/g, '&');
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
            base: ((queryIndex == -1) ? url : url.substring(0, queryIndex)),
            query: ((queryIndex == -1) ? '' : url.substring(queryIndex + 1)),
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
        GlobalHandler.region_.GetChanges().AddComposed('active', this.scopeId_);
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
                GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
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
            GlobalHandler.region_.GetChanges().AddComposed('url', this.scopeId_);
            this.currentUrl_ = url;
            this.currentQuery_ = this.BuildQuery(this.BuildPath(url).query);
            isNewUrl = true;
        }
        let isNewPage = (page !== this.activePage_);
        if (isNewPage) {
            GlobalHandler.region_.GetChanges().AddComposed('page', this.scopeId_);
            this.activePage_ = page;
        }
        if (page.title !== this.currentTitle_) {
            GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
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
