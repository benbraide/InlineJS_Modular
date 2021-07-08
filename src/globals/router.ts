import { IDirective, DirectiveHandlerReturn, IRegion, IRouterGlobalHandler, OnRouterLoadHandlerType, IBackPath } from '../typedefs'
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

export interface PathInfo{
    base: string;
    query: string;
}

export class BackPath implements IBackPath{}

export interface IMiddleware{
    Handle(path?: PathInfo): void | boolean;
}

export class RouterDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(router: RouterGlobalHandler){
        super(router.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'breakpoint'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.breakpoint`);
            }

            if (directive.arg.key === 'checkpoint'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.checkpoint`);
            }

            if (directive.arg.key === 'direction' || directive.arg.key === 'scrollDirection'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction`);
            }

            if (directive.arg.key === 'directionOffset' || directive.arg.key === 'scrollDirectionOffset'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction.offset`);
            }

            if (directive.arg.key === 'percentage' || directive.arg.key === 'scrollPercentage'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.percentage`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class RegisterDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(private router_: RouterGlobalHandler){
        super(`${router_.GetKey()}.register`, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load');
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let elementScope = region.AddElement(element);
            if (!elementScope){
                return DirectiveHandlerReturn.Handled;    
            }

            let info: PageOptions = {
                path: '',
                name: null,
                title: null,
                middleware: null,
                onLoad: null,
            };
            
            let data = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
            if (Region.IsObject(info)){
                Object.entries(data).forEach(([key, value]) => {
                    if (key in info){
                        info[key] = value;
                    }
                });
            }
            else if (typeof data === 'string'){
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
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class LinkDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(private router_: RouterGlobalHandler){
        super(`${router_.GetKey()}.link`, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let elementScope = region.AddElement(element);
            if (!elementScope){
                return DirectiveHandlerReturn.Handled;
            }
            
            let path = '', extractedPath: PathInfo = null, routerPath = this.router_.GetActivePage();
            region.GetState().TrapGetAccess(() => {
                let data = ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                path = ((typeof data === 'string') ? this.router_.ProcessUrl(data.trim()) : '');
                extractedPath = extractPathInfo();
                updateActive();
            }, true, element);

            let active = (extractedPath && routerPath && extractedPath.base === routerPath.base), regionId = region.GetId(), scopeId = this.GenerateScopeId_(region);
            let getPathFromElement = () => {
                if (element instanceof HTMLAnchorElement){
                    return this.router_.ProcessUrl(element.href);
                }

                return ((element instanceof HTMLFormElement) ? this.router_.ProcessUrl(element.action) : '');
            };

            let extractPathInfo = (): PathInfo => {
                let targetPath = (path || getPathFromElement());

                let queryStartIndex = targetPath.indexOf('?');
                return {
                    base: ((queryStartIndex == -1) ? targetPath : targetPath.substr(0, queryStartIndex)),
                    query: ((queryStartIndex == -1) ? '' : targetPath.substr(queryStartIndex + 1)),
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
                extractedPath = extractPathInfo();

                updateActive();
                if (afterEvent){
                    afterEvent(e);
                }

                this.router_.Goto(extractedPath, () => {
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

            let bindInfo = bindEvent();
            afterEvent = bindInfo.after;

            this.router_.BindOnLoad(onLoad);
            elementScope.uninitCallbacks.push(() => {
                this.router_.UnbindOnLoad(onLoad);
                bindInfo.undo();
            });

            elementScope.locals['$link'] = Region.CreateProxy((prop) => {
                if (prop === 'active'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return active;
                }
            }, ['active']);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class BackDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(private router_: RouterGlobalHandler){
        super(`${router_.GetKey()}.back`, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.router_.Goto(new BackPath());
            });
            return DirectiveHandlerReturn.Handled;
        });
    }
}

interface MountInfo{
    scopeId: string;
    type?: string;
    element?: HTMLElement;
    proxy?: any;
    fetch?: (url: string) => void;
    notFound?: (url: string) => void;
}

export class MountDirectiveHandler extends ExtendedDirectiveHandler{
    private fetch_: Fetch;
    
    public constructor(private router_: RouterGlobalHandler, private info_: MountInfo){
        super(`${router_.GetKey()}.mount`, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'load' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }

            if (directive.arg.key === 'error'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.error`);
            }
            
            this.info_.element = document.createElement(this.info_.type || 'div');
            element.parentElement.insertBefore(this.info_.element, element);

            this.info_.fetch = (url) => {
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
                    Region.Get(regionId).GetChanges().AddComposed(key, `${this.info_.scopeId}.mount`);
                }
            };

            this.fetch_ = new Fetch(null, this.info_.element, {
                onBeforeRequest: () => {
                    setState('active', true);
                    setState('progress', 0);
                },
                onLoad: () => {
                    setState('active', false);
                    setState('progress', 100);
                    
                    window.scrollTo({ top: 0, left: 0 });
                    [...this.info_.element.attributes].forEach(attr => this.info_.element.removeAttribute(attr.name));
                    (new Bootstrap()).Attach(this.info_.element);

                    window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                },
                onError: (err) => {
                    setState('active', false);
                    setState('progress', 100);
                    
                    window.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                        detail: { error: err },
                    }));
                },
                onProgress: (value) => {
                    setState('progress', value);
                },
            });

            region.GetElementScope(element).uninitCallbacks.push(() => {
                this.info_ = null;
                this.fetch_ = null;
            });

            this.info_.proxy = Region.CreateProxy((prop) => {
                if (prop in state){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${this.info_.scopeId}.mount.${prop}`);
                    return state[prop];
                }

                if (prop === 'element'){
                    return this.info_.element;
                }
            }, [...Object.keys(state), 'element']);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class RouterGlobalHandler extends GlobalHandler implements IRouterGlobalHandler{
    private scopeId_: string;
    private proxy_ = null;
    
    private mountInfo_: MountInfo;
    private onEvent_: (e: PopStateEvent) => void;

    private origin_: string;
    private url_: string;
    private onLoadHandlers_ = new Array<OnRouterLoadHandlerType>();

    private lastPageId_ = 0;
    private pages_ = new Array<PageInfo>();

    private activePage_: PageInfo = null;
    private currentUrl_: string = null;
    private currentQuery_: Record<string, Array<string> | string> = null;
    
    public constructor(private middlewares_ = new Array<IMiddleware>(), private ajaxPrefix_ = 'ajax', mountElementType = ''){
        super('router', () => this.proxy_, null, null, () => {
            this.mountInfo_ = {
                scopeId: this.scopeId_,
                type: mountElementType,
            };

            Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this));
            Region.GetDirectiveManager().AddHandler(new RegisterDirectiveHandler(this));
            Region.GetDirectiveManager().AddHandler(new LinkDirectiveHandler(this));
            Region.GetDirectiveManager().AddHandler(new BackDirectiveHandler(this));
            Region.GetDirectiveManager().AddHandler(new MountDirectiveHandler(this, this.mountInfo_));

            window.addEventListener('popstate', this.onEvent_);
            Region.AddPostProcessCallback(() => {
                this.Load_(this.BuildPath(this.url_));
            }, true);

            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'page'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return (this.activePage_ ? {...this.activePage_} : null);
                }

                if (prop === 'title'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.page`);
                    return ((this.activePage_ ? this.activePage_.title : null) || 'Untitled');
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
            }, ['page', 'url', 'mount', 'register'], (target, prop, value) => {
                if (typeof prop === 'string' && prop === 'url'){
                    this.Goto(value);
                    return true;
                }
            });
        }, () => {
            this.proxy_ = null;
            window.removeEventListener('popstate', this.onEvent_);
            
            Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.mount`);
            Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.back`);
            Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.link`);
            Region.GetDirectiveManager().RemoveHandlerByKey(`${this.key_}.register`);
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

        url = url.replace(/\/+$/, '');//Truncate '/'
        if (url === this.origin_){//Root
            return (includeAjaxPrefix ? (this.ajaxPrefix_ || '/') : '/');
        }
        
        if (url.startsWith(`${this.origin_}/`)){//Skip origin
            url = url.substr(this.origin_.length);
        }

        if (includeAjaxPrefix && this.ajaxPrefix_){
            url = `${this.ajaxPrefix_}/${url}`;
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
            base: ((queryIndex == -1) ? url : url.substr(0, queryIndex)),
            query: ((queryIndex == -1) ? '' : url.substr(queryIndex + 1)),
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

    private Load_(path: PathInfo, callback?: (url: string, title: string) => void, shouldReload?: boolean | (() => boolean)){
        let page = this.FindPage_(path), processedPath: PathInfo = {
            base: this.ProcessUrl(path.base),
            query: this.ProcessUrl(path.query),
        };
        
        if (!page){//Page not found
            if (callback){
                callback(this.BuildUrl(processedPath, true, false), 'Page Not Found');
            }
            
            if (this.mountInfo_.notFound){
                this.mountInfo_.notFound(processedPath.base);
            }
            
            return;
        }

        for (let i = 0; i < page.middlewares.length; ++i){
            let middleware = page.middlewares[i];
            if (middleware in this.middlewares_ && (this.middlewares_[middleware] as IMiddleware).Handle(path) === false){
                return;//Rejected
            }
        }

        let checkShouldReload = () => {
            if (!shouldReload){
                return false;
            }

            return ((typeof shouldReload === 'boolean') ? shouldReload : shouldReload());
        };

        let url = this.BuildUrl(processedPath, true, false);
        if (url === this.currentUrl_){
            window.dispatchEvent(new CustomEvent(`${this.key_}.reload`));
            if (!checkShouldReload()){
                return;//Reload rejected
            }
        }
        else{//New url
            GlobalHandler.region_.GetChanges().AddComposed('url', this.scopeId_);
            this.currentUrl_ = url;
            this.currentQuery_ = this.BuildQuery(this.BuildPath(url).query);
        }

        let isNewPage = (page !== this.activePage_);
        if (isNewPage){
            GlobalHandler.region_.GetChanges().AddComposed('page', this.scopeId_);
            this.activePage_ = page;
        }

        if (callback){
            callback(url, page.title);
        }
        else if (isNewPage){
            document.title = (page.title || 'Untitled');
        }

        if (this.mountInfo_.fetch){
            this.mountInfo_.fetch((this.ajaxPrefix_ && this.ajaxPrefix_) ? this.BuildUrl(processedPath, true, true, true) : url);
        }

        window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
        if (isNewPage){
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
