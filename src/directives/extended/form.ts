import { IDirective, DirectiveHandlerReturn, IRegion, IRouterGlobalHandler, IPageGlobalHandler } from '../../typedefs'
import { IntersectionObserver } from '../../observers/intersection'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from '../extended/generic'
import { Fetch } from '../../utilities/fetch';

export interface IFormMiddleware{
    GetKey(): string;
    Handle(region?: IRegion, element?: HTMLElement): void | boolean | Promise<boolean>;
}

export class ConfirmFormMiddleware implements IFormMiddleware{
    public GetKey(): string{
        return 'confirm';
    }

    Handle(): void | boolean | Promise<boolean>{
        return new Promise((resolve) => {
            Region.GetAlertHandler().Confirm({}, () => resolve(true), () => resolve(false));
        });
    }
}

export class FormDirectiveHandler extends ExtendedDirectiveHandler{
    private middlewares_: Record<string, IFormMiddleware> = {};
    
    public constructor(private redirectKey_ = '__redirect', key = 'form'){
        super(key, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), options = {
                refresh: false,
                reload: false,
                persistent: false,
                redirect: false,
            };

            let middlewares = new Array<IFormMiddleware>();
            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
                else if ((option = option.split('-').join('.')) in this.middlewares_){
                    middlewares.push(this.middlewares_[option]);
                }
            });

            let getAction: () => string, getMethod: () => string;
            if (element instanceof HTMLFormElement){
                getAction = () => element.action;
                getMethod = () => element.method.toLowerCase();
            }
            else if (element instanceof HTMLAnchorElement){
                getAction = () => element.href;
                getMethod = () => 'get';
            }
            else{
                getAction = () => '';
                getMethod = () => 'get';
            }

            let action = '';
            region.GetState().TrapGetAccess(() => {
                let myRegion = Region.Get(regionId);
                if (!myRegion){
                    return false;
                }
                
                action = ExtendedDirectiveHandler.Evaluate(myRegion, element, directive.value);
                if (typeof action === 'string'){
                    action = action.trim();
                }
                else{//Empty
                    action = '';
                }
            }, true, element);

            let buildUrl: (info?: RequestInit) => string, save: () => void, load: () => void, eventName: string;
            if (element instanceof HTMLFormElement){
                eventName = 'submit';
                if (getMethod() !== 'post'){
                    buildUrl = () => {
                        let query = '';
                        (new FormData(element)).forEach((value, key) => {
                            query = (query ? `${query}&${key}=${value.toString()}` : `${key}=${value.toString()}`);
                        });

                        let url = (action || getAction());
                        if (!query){
                            return url;
                        }

                        return (url.includes('?') ? `${url}&${query}` : `${url}?${query}`);
                    };
                }
                else{//Post
                    buildUrl = (info) => {
                        info.body = new FormData(element);
                        return (action || getAction());
                    };
                }

                save = () => {
                    let name = element.getAttribute('name');
                    if (!name){
                        return;
                    }
                    
                    let fields: Record<string, any> = {};
                    [...element.elements].forEach((item) => {
                        let key = item.getAttribute('name');
                        if (key && 'value' in item && !key.startsWith('_')){
                            fields[key] = (item as any).value;
                        }
                    });

                    Region.GetDatabase().Write(`inlinejs_form_${name}`, fields);
                };

                load = () => {
                    let name = element.getAttribute('name');
                    if (!name){
                        return;
                    }

                    Region.GetDatabase().Read(`inlinejs_form_${name}`, (fields) => {
                        if (!Region.IsObject(fields)){
                            return;
                        }

                        [...element.elements].forEach((item) => {
                            let key = item.getAttribute('name');
                            if (key && 'value' in item && key in fields){
                                (item as any).value = fields[key];
                            }
                        });
                    });
                };
            }
            else{//Not a form
                eventName = 'click';
                buildUrl = () => (action || getAction());
                save = null;
            }

            let active = false, errors = {}, setActiveState = (state: boolean) => {
                if (active != state){
                    active = state;
                    Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
                }
            };

            let elementScope = region.AddElement(element, true), errorsProxy = ExtendedDirectiveHandler.CreateProxy((prop) => {
                if (prop === '__InlineJS_Target__'){
                    return errors;
                }

                if (prop === '__InlineJS_Path__'){
                    return `${scopeId}.errors`;
                }

                Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.errors.${prop}`);
                return (errors[prop] || []);
            }, ['__InlineJS_Target__', '__InlineJS_Path__'], null, errors);

            elementScope.locals['$form'] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop === 'active'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return active;
                }

                if (prop === 'errors'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return errorsProxy;
                }
                
                if (prop === 'element'){
                    return element;
                }

                if (prop === 'submit'){
                    return (runMiddlewares = true) => {
                        if (runMiddlewares){
                            runMiddleware(handleEvent);
                        }
                        else{//Skip middlewares
                            handleEvent();
                        }
                    };
                }
            }, ['active', 'errors', 'element', 'submit']);

            let handleEvent = () => {
                if (active){
                    return;
                }
                
                let info: RequestInit = {
                    method: getMethod(),
                    credentials: 'same-origin',
                };

                setActiveState(true);
                fetch(buildUrl(info), info).then(Fetch.HandleJsonResponse).then((data) => {
                    setActiveState(false);
                    
                    let myRegion = Region.Get(regionId);
                    Object.keys(errors).forEach(key => myRegion.GetChanges().AddComposed(key, `${scopeId}.errors`));
                    
                    errors = {};
                    myRegion.GetChanges().AddComposed('errors', scopeId);

                    if (!Region.IsObject(data)){
                        if (options.persistent && save){
                            save();
                        }
                        return;
                    }
                    
                    try{
                        if ('__failed' in data){
                            Object.keys(Region.IsObject(data['__failed']) ? data['__failed'] : {}).forEach((key) => {
                                errors[key] = data['__failed'][key];
                                myRegion.GetChanges().AddComposed(key, `${scopeId}.errors`);
                            });

                            if ('__report' in data){
                                Region.GetAlertHandler().Alert(data['__report']);
                            }
                            
                            return;
                        }

                        if ('__report' in data && Region.IsObject(data['__report'])){
                            Region.GetAlertHandler().Alert(data['__report']);
                            if (data['__report']['error']){//Error reported
                                return;
                            }
                        }

                        element.dispatchEvent(new CustomEvent('form.success', {
                            detail: { data: data },
                        }));

                        let router = ((Region.GetGlobalManager().GetHandler(null, '$router') as unknown) as IRouterGlobalHandler), after: () => void = null;
                        if ('__redirect' in data){
                            if (Region.IsObject(data['__redirect'])){
                                if (options.refresh || data['__redirect']['refresh']){
                                    after = () => window.location.href = data['__redirect']['page'];
                                }
                                else if (router){//Use router
                                    after = () => router.Goto(data['__redirect']['page'], (options.reload || data['__redirect']['reload']));
                                }
                            }
                            else if (typeof data['__redirect'] === 'string'){
                                if (options.refresh){
                                    after = () => window.location.href = data['__redirect'];
                                }
                                else if (router){//Use router
                                    after = () => router.Goto(data['__redirect'], options.reload);
                                }
                            }
                        }
                        else if (options.redirect){
                            let redirect = (router ? router.GetCurrentQuery(this.redirectKey_) : null);
                            if (typeof redirect === 'string'){
                                if (options.refresh){
                                    after = () => window.location.href = (redirect as string);
                                }
                                else if (router){
                                    after = () => router.Goto(redirect as string);
                                }
                            }
                            else if (options.refresh){
                                after = () => window.location.href = '/';
                            }
                            else if (router){
                                after = () => router.Goto('/');
                            }
                        }
                        else if (options.refresh){
                            after = () => window.location.reload();
                        }
                        else if (options.reload && router){
                            after = () => router.Reload();
                        }

                        if ('__data' in data && Region.IsObject(data['__data'])){
                            let page = ((Region.GetGlobalManager().GetHandler(null, '$page') as unknown) as IPageGlobalHandler);
                            if (page){//Set next page data
                                page.SetNextPageData(data['__data']);
                            }
                        }

                        if (options.persistent && save){
                            save();
                        }

                        if (after){
                            after();
                        }
                    }
                    catch (err){
                        myRegion.GetState().ReportError(err, `InlineJs.Region<${regionId}>.ExtendedDirectiveHandlers.BindForm(Element@${element.nodeName}, x-form)`);
                    }
                }).catch((err) => {
                    setActiveState(false);
                    Region.GetAlertHandler().ServerError(err);
                });
            };

            let runMiddleware = (callback: () => void, index = 0) => {
                if (index < middlewares.length){
                    let result = middlewares[index].Handle(Region.Get(regionId), element);
                    if (result instanceof Promise){
                        result.then((value) => {
                            if (value){//Accepted
                                runMiddleware(callback, (index + 1));
                            }
                        });
                    }
                    else if (result !== false){
                        runMiddleware(callback, (index + 1));
                    }
                }
                else{//Done running middlewares
                    callback();
                }
            };

            let onEvent = (e: Event) => {
                e.preventDefault();
                runMiddleware(handleEvent);
            };

            element.addEventListener(eventName, onEvent);

            return DirectiveHandlerReturn.Handled;
        });
    }

    public AddMiddleware(middleware: IFormMiddleware){
        let key = middleware.GetKey();
        this.RemoveMiddleware(key);
        this.middlewares_[key] = middleware;
    }

    public RemoveMiddleware(key: string){
        if (key in this.middlewares_){
            delete this.middlewares_[key];
        }
    }
}
