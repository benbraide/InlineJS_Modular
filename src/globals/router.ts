import { IDirective, DirectiveHandlerReturn, IRegion, IRouterGlobalHandler, OnRouterLoadHandlerType, PathInfo, IBackPath, IModalGlobalHandler } from '../typedefs'
import { ExtendedDirectiveHandler } from '../directives/extended/generic'
import { Fetch } from '../utilities/fetch'
import { GlobalHandler } from './generic'
import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

export interface PageOptions{
    path: string | RegExp;
    name?: string;
    title?: string;
    middleware?: string | Array<string>;
    onLoad?: (reloaded?: boolean) => void;
}

export interface PageInfo{
    id: number;
    path: string | RegExp;
    name: string;
    title: string;
    middlewares: Array<string>;
    onLoad: (reloaded?: boolean) => void;
}

export class BackPath implements IBackPath{}

export interface IMiddleware{
    Handle(path?: PathInfo): void | boolean;
}

interface MountInfo{
    scopeId: string;
    type?: string;
    element?: HTMLElement;
    proxy?: any;
    fetch?: (url: string, callback: (state?: boolean) => void) => void;
}

export class RouterDirectiveHandler extends ExtendedDirectiveHandler{
    private fetch_: Fetch;
    
    public constructor(router: RouterGlobalHandler, mountInfo: MountInfo, modal: IModalGlobalHandler = null){
        super(router.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'load' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }

            if (directive.arg.key === 'reload' || directive.arg.key === 'entry' || directive.arg.key === 'in' || directive.arg.key === 'out'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            let elementScope = region.AddElement(element);
            if (!elementScope){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'register'){
                let info: PageOptions = {
                    path: '',
                    name: null,
                    title: null,
                    middleware: null,
                    onLoad: null,
                };
                
                let data = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
                if (Region.IsObject(data)){
                    Object.entries(data).forEach(([key, value]) => {
                        if (key in info){
                            info[key] = value;
                        }
                    });
                }
                else if (typeof data === 'string'){
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
            else if (directive.arg.key === 'link'){
                let path = '', extractedPath: PathInfo = null, routerPath = router.GetActivePage(), regionId = region.GetId();
                let active = (extractedPath && routerPath && extractedPath.base === routerPath.base), scopeId = this.GenerateScopeId_(region);

                let getPathFromElement = () => {
                    if (element instanceof HTMLAnchorElement){
                        return router.ProcessUrl(element.href);
                    }

                    return ((element instanceof HTMLFormElement) ? router.ProcessUrl(element.action) : '');
                };

                let extractPathInfo = (targetPath = ''): PathInfo => {
                    targetPath = (targetPath || path || getPathFromElement());

                    let queryStartIndex = targetPath.indexOf('?');
                    return {
                        base: ((queryStartIndex == -1) ? targetPath : targetPath.substring(0, (queryStartIndex + 1))),
                        query: ((queryStartIndex == -1) ? '' : targetPath.substring(queryStartIndex + 1)),
                    };
                };

                let updateActive = () => {
                    if ((extractedPath && routerPath && extractedPath.base === routerPath.base) != active){
                        active = !active;
                        Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
                    }
                };

                let onLoad = (path: PathInfo) => {
                    routerPath = path;
                    updateActive();
                };

                let shouldReload = directive.arg.options.includes('reload'), afterEvent: (e?: Event) => void = null, onEvent = (e: Event) => {
                    e.preventDefault();

                    let targetPath = (path || getPathFromElement());
                    if (modal && targetPath.startsWith('modal://')){
                        modal.SetUrl(targetPath);
                        return;
                    }
                    
                    extractedPath = extractPathInfo(targetPath);
                    updateActive();

                    if (afterEvent){
                        afterEvent(e);
                    }

                    router.Goto(extractedPath, () => {
                        if (!shouldReload){//Scroll top
                            window.scrollTo({ top: -window.scrollY, left: 0, behavior: 'smooth' });
                            return false;
                        }
                        return true;
                    });
                };
                
                let bindEvent = () => {
                    if (element instanceof HTMLFormElement){
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
                                
                                if (query){//Append query
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

                if (directive.value !== Region.GetConfig().GetDirectiveName(this.key_)){
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
                if (checkActive){
                    router.BindOnLoad(onLoad);
                }

                elementScope.uninitCallbacks.push(() => {
                    bindInfo.undo();
                    if (checkActive){
                        router.UnbindOnLoad(onLoad);
                    }
                });

                elementScope.locals['$link'] = Region.CreateProxy((prop) => {
                    if (prop === 'active'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                        return active;
                    }
                }, ['active']);
            }
            else if (directive.arg.key === 'nav'){
                directive.arg.key = 'link';
                element.querySelectorAll('a').forEach(item => this.Handle(region, item, directive));
                element.querySelectorAll('form').forEach(item => this.Handle(region, item, directive));
            }
            else if (directive.arg.key === 'back'){
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    router.Goto(new BackPath());
                });
            }
            else if (directive.arg.key === 'mount'){
                if (directive.arg.options.includes('load')){
                    return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.mount.load`);
                }
    
                if (directive.arg.options.includes('error')){
                    return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.mount.error`);
                }

                let nextSibling = element.nextElementSibling;
                if (!nextSibling || nextSibling.getAttribute('data-router') !== 'mount'){
                    mountInfo.element = document.createElement(mountInfo.type || 'div');
                    element.parentElement.insertBefore(mountInfo.element, element);
                }
                else{
                    mountInfo.element = (nextSibling as HTMLElement);
                }

                let lastCallback: (state?: boolean) => void = null;
                mountInfo.fetch = (url, callback) => {
                    lastCallback = callback;
                    this.fetch_.props.url = url;
                    this.fetch_.Get();
                };

                let state = {
                    active: false,
                    progress: 0,
                };

                let regionId = region.GetId(), setState = (key: string, value: any) => {
                    if (key in state && !Region.IsEqual(state[key], value)){
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
                        if (lastCallback){
                            lastCallback(true);
                        }
                    },
                    onError: (err) => {
                        setState('active', false);
                        setState('progress', 100);
                        
                        window.dispatchEvent(new CustomEvent(`${this.key_}.mount.error`, {
                            detail: { error: err },
                        }));

                        if (lastCallback){
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
                    if (prop in state){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${mountInfo.scopeId}.mount.${prop}`);
                        return state[prop];
                    }

                    if (prop === 'element'){
                        return mountInfo.element;
                    }
                }, [...Object.keys(state), 'element']);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class RouterGlobalHandler extends GlobalHandler implements IRouterGlobalHandler{
    private scopeId_: string;
    
    private mountInfo_: MountInfo;
    private onEvent_: (e: PopStateEvent) => void;

    private origin_: string;
    private url_: string;
    private onLoadHandlers_ = new Array<OnRouterLoadHandlerType>();

    private active_ = false;
    private entryCallbacks_ = new Array<(entered?: boolean) => void>();
    
    private lastPageId_ = 0;
    private pages_ = new Array<PageInfo>();

    private activePage_: PageInfo = null;
    private currentUrl_: string = null;
    private currentQuery_: Record<string, Array<string> | string> = null;
    private currentTitle_ = '';
    
    public constructor(private middlewares_ = new Array<IMiddleware>(), modal: IModalGlobalHandler = null, private ajaxPrefix_ = 'ajax', mountElementType = ''){
        super('router', null, null, () => {
            this.mountInfo_ = {
                scopeId: this.scopeId_,
                type: mountElementType,
            };

            Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this, this.mountInfo_, modal));
            window.addEventListener('popstate', this.onEvent_);

            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'doMount'){
                    return (load = true) => this.Mount(load);
                }
                
                if (prop === 'active'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.active_;
                }
                
                if (prop === 'page'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.activePage_ ? {...this.activePage_} : null);
                }

                if (prop === 'title'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.currentTitle_ || 'Untitled');
                }

                if (prop === 'url'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.currentUrl_;
                }

                if (prop === 'mount'){
                    return this.mountInfo_.proxy;
                }

                if (prop === 'register'){
                    return (page: PageOptions) => this.Register(page);
                }

                if (prop === 'addOnEntry'){
                    return (handler: (entered?: boolean) => void) => this.entryCallbacks_.push(handler);
                }

                if (prop === 'removeOnEntry'){
                    return (handler: (entered?: boolean) => void) => this.entryCallbacks_.splice(this.entryCallbacks_.findIndex(item => (item === handler)), 1);
                }
            }, ['doMount', 'active', 'page', 'title', 'url', 'mount', 'register', 'addOnEntry', 'removeOnEntry'], (prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if (prop === 'title' && value !== this.currentTitle_){
                    GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                    this.currentTitle_ = value;
                }
                else if (prop === 'url'){
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

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        this.origin_ = window.location.origin;

        if (this.origin_){//Remove trailing slashes
            this.origin_ = this.origin_.replace(/\/+$/, '');
        }

        this.middlewares_ = (this.middlewares_ || []);
        this.onEvent_ = (e) => {
            if (e.state){
                this.Load_(this.BuildPath(e.state));
            }
        };

        this.url_ = window.location.href;
        this.ajaxPrefix_ = this.ProcessUrl(this.ajaxPrefix_);
    }

    public Mount(load = true){
        let path = this.BuildPath(this.url_);
        if (!load){
            let page = this.FindPage_(path), processedPath: PathInfo = {
                base: this.ProcessUrl(path.base),
                query: this.ProcessQuery(path.query),
            };
            
            this.activePage_ = page;
            this.currentUrl_ = this.BuildUrl(processedPath, true, false);
        }
        else{
            this.Load_(path);
        }
    }

    public Register(page: PageOptions): number{
        if (!page.path){
            return 0;
        }

        if (typeof page.path === 'string'){
            page.path = this.ProcessUrl(page.path);
        }

        let info: PageInfo = {
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

    public Unregister(id: number){
        this.pages_.splice(this.pages_.findIndex(page => (page.id == id)), 1);
    }

    public Goto(target: string | PathInfo | BackPath, shouldReload?: boolean | (() => boolean)){
        if (target instanceof BackPath){
            return;
        }
        
        this.Load_(((typeof target === 'string') ? this.BuildPath(target) : target), (url, title) => {
            window.history.pushState(url, title, url);
        }, shouldReload);
    }

    public Reload(){
        this.Goto(this.currentUrl_, true);
    }

    public BindOnLoad(handler: OnRouterLoadHandlerType){
        this.onLoadHandlers_.push(handler);
    }

    public UnbindOnLoad(handler: OnRouterLoadHandlerType){
        this.onLoadHandlers_.splice(this.onLoadHandlers_.indexOf(handler), 1);
    }

    public GetCurrentUrl(): string{
        return this.currentUrl_;
    }

    public GetCurrentQuery(key?: string): Record<string, Array<string> | string> | Array<string> | string{
        return (key ? ((key in this.currentQuery_) ? this.currentQuery_[key] : null) : this.currentQuery_);
    }

    public GetActivePage(): PathInfo{
        return this.BuildPath(this.currentUrl_);
    }

    public ProcessUrl(url: string, includeAjaxPrefix = false){
        url = (url ? url.trim() : '');
        if (!url){
            return '';
        }

        url = url.replace(/[?]{2,}/g, '?').replace(/[&]{2,}/g, '&').replace(/\/+$/, '');//Truncate '/'
        if (url === this.origin_){//Root
            return (includeAjaxPrefix ? (this.ajaxPrefix_ || '/') : '/');
        }
        
        if (url.startsWith(`${this.origin_}/`)){//Skip origin
            url = url.substring(this.origin_.length);
        }
        
        if (/^[a-zA-Z0-9_]+:\/\//.test(url)){
            return url;
        }

        if (includeAjaxPrefix && this.ajaxPrefix_){
            return (url.startsWith('/') ? `${this.ajaxPrefix_}${url}` : `${this.ajaxPrefix_}/${url}`);
        }
        
        return (url.startsWith('/') ? url : `/${url}`);
    }

    public ProcessQuery(query: string){
        query = query.trim();
        if (query){//Trim '&'s
            query = query.replace(/\&+$/, '').replace(/^\&+/, '');
        }
        
        return ((!query || query.startsWith('?')) ? (query || '') : `?${query}`);
    }

    public BuildUrl(path: PathInfo, absolute = true, process = true, includeAjaxPrefix = false){
        let base = (process ? this.ProcessUrl(path.base, includeAjaxPrefix) : path.base), query = (process ? this.ProcessQuery(path.query) : path.query), url: string;
        if (query){
            query = query.replace(/^[?&]+/g, '').replace(/[?]+/g, '').replace(/[&]{2,}/g, '&');
            url = (base.includes('?') ? `${base}&${query}` : `${base}?${query}`);
        }
        else{
            url = base;
        }

        return (absolute ? `${this.origin_}${url}` : url);
    }

    public BuildPath(url: string): PathInfo{
        url = this.ProcessUrl(url);

        let queryIndex = url.indexOf('?');
        return {
            base: ((queryIndex == -1) ? url : url.substring(0, queryIndex)),
            query: ((queryIndex == -1) ? '' : url.substring(queryIndex + 1)),
        };
    }

    public BuildQuery(query: string, shouldDecode = true): Record<string, Array<string> | string>{
        query = query.trim();
        if (!query){
            return {};
        }

        let formatted: Record<string, Array<string> | string> = {}, decode = (value: string) => {
            return (shouldDecode ? decodeURIComponent(value.replace(/\+/g, ' ')) : value);
        };

        query.split('&').map(part => part.trim()).forEach((part) => {
            if (part.startsWith('=')){
                return;//Malformed
            }
            
            let pair = part.split('=');
            if (pair.length > 1 && pair[0].endsWith('[]')){//Array values
                let key = decode(pair[0].substr(0, (pair[0].length - 2)));
                if (key in formatted && Array.isArray(formatted[key])){//Append
                    (formatted[key] as Array<string>).push(decode(pair[1]));
                }
                else{//Assign
                    formatted[key] = [decode(pair[1])];
                }
            }
            else if (pair.length > 1){//Single value
                formatted[decode(pair[0])] = decode(pair[1]);
            }
            else if (pair.length == 1){//No value
                formatted[decode(pair[0])] = null;
            }
        });

        return formatted;
    }

    private SetActiveState_(state: boolean, callHandlers = true){
        if (state == this.active_){
            return;
        }
        
        GlobalHandler.region_.GetChanges().AddComposed('active', this.scopeId_);
        this.active_ = state;

        if (callHandlers){
            this.entryCallbacks_.forEach((callback) => {
                try{
                    callback(state);
                }
                catch{}
            });

            window.dispatchEvent(new CustomEvent(`${this.key_}.entry`, {
                detail: {
                    active: state,
                },
            }));

            if (state){
                window.dispatchEvent(new CustomEvent(`${this.key_}.in`));
            }
            else{
                window.dispatchEvent(new CustomEvent(`${this.key_}.out`));
            }
        }
    }

    private Load_(path: PathInfo, callback?: (url: string, title: string) => void, shouldReload?: boolean | (() => boolean)){
        let page = this.FindPage_(path), processedPath: PathInfo = {
            base: this.ProcessUrl(path.base),
            query: this.ProcessQuery(path.query),
        };
        
        this.SetActiveState_(true);
        if (!page){//Page not found
            let notFoundText = 'Page Not Found';
            if (notFoundText !== this.currentTitle_){
                GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                this.currentTitle_ = notFoundText;
            }
            
            if (callback){
                callback(this.BuildUrl(processedPath, true, false), notFoundText);
            }
            
            if (this.mountInfo_.fetch){
                this.mountInfo_.fetch(this.BuildUrl(this.BuildPath('/404'), true, true, true), () => {
                    this.SetActiveState_(false);
                });
            }
            else{
                this.SetActiveState_(false);
            }
            
            return;
        }

        for (let i = 0; i < page.middlewares.length; ++i){
            let middleware = page.middlewares[i];
            if (middleware in this.middlewares_ && (this.middlewares_[middleware] as IMiddleware).Handle(path) === false){
                this.SetActiveState_(false);
                return;//Rejected
            }
        }

        let checkShouldReload = () => {
            if (!shouldReload){
                return false;
            }

            return ((typeof shouldReload === 'boolean') ? shouldReload : shouldReload());
        };

        let url = this.BuildUrl(processedPath, true, false), isNewUrl = false;
        if (url === this.currentUrl_){
            window.dispatchEvent(new CustomEvent(`${this.key_}.reload`));
            if (!checkShouldReload()){
                this.SetActiveState_(false);
                return;//Reload rejected
            }
        }
        else{//New url
            GlobalHandler.region_.GetChanges().AddComposed('url', this.scopeId_);
            this.currentUrl_ = url;
            this.currentQuery_ = this.BuildQuery(this.BuildPath(url).query);
            isNewUrl = true;
        }

        let isNewPage = (page !== this.activePage_);
        if (isNewPage){
            GlobalHandler.region_.GetChanges().AddComposed('page', this.scopeId_);
            this.activePage_ = page;
        }

        if (page.title !== this.currentTitle_){
            GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
            this.currentTitle_ = page.title;
        }

        if (callback){
            callback(url, page.title);
        }
        else if (isNewPage){
            document.title = (page.title || 'Untitled');
        }

        if (this.mountInfo_.fetch){
            this.mountInfo_.fetch((this.ajaxPrefix_ ? this.BuildUrl(processedPath, true, true, true) : url), () => {
                this.SetActiveState_(false);
            });
        }
        else{//No mount
            this.SetActiveState_(false);
        }

        if (isNewUrl){
            this.onLoadHandlers_.forEach((handler) => {
                try{
                    handler({
                        ...processedPath,
                        formattedQuery: this.currentQuery_,
                    });
                }
                catch{}
            });
        }
        
        window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
    }

    private FindPage_(target: string | PathInfo){
        let targetPath = ((typeof target === 'string') ? target : target.base);
        if (!targetPath){
            return null;
        }

        let processedTarget = this.ProcessUrl(targetPath);
        return this.pages_.find((page) => {//Find matching path
            return (page.name === targetPath || ((typeof page.path === 'string') ? (page.path === processedTarget) : page.path.test(processedTarget)));
        });
    }
}
