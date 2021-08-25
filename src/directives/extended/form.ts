import { IDirective, DirectiveHandlerReturn, IRegion, IRouterGlobalHandler, IPageGlobalHandler } from '../../typedefs'
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
    
    public constructor(key = 'form'){
        super(key, (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'success', ['error', 'submit', 'save', 'load']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), options = {
                refresh: false,
                reload: false,
                persistent: false,
                redirect: false,
                reset: false,
                success: false,
                error: false,
                nexttick: false,
                novalidate: false,
                form: <HTMLFormElement>null,
            };

            let middlewares = new Array<IFormMiddleware>();
            directive.arg.options.forEach((option) => {
                if (option in options && typeof options[option] === 'boolean'){
                    options[option] = true;
                }
                else if ((option = option.split('-').join('.')) in this.middlewares_){
                    middlewares.push(this.middlewares_[option]);
                }
            });

            let getAction: () => string, getMethod: () => string;
            if (element instanceof HTMLFormElement){
                getAction = () => element.action;
                getMethod = () => (element.method || 'get').toLowerCase();
                options.form = element;
            }
            else if (element instanceof HTMLAnchorElement){
                getAction = () => element.href;
                getMethod = () => (element.getAttribute('data-method') || 'get').toLowerCase();
            }
            else{
                getAction = () => element.getAttribute('data-action');
                getMethod = () => (element.getAttribute('data-method') || 'get').toLowerCase();
            }

            let buildUrl: (info?: RequestInit) => string, save: () => void, eventName: string;
            if (element instanceof HTMLFormElement){
                eventName = 'submit';
                if (getMethod() !== 'post'){
                    buildUrl = () => {
                        let query = '';
                        (new FormData(element)).forEach((value, key) => {
                            query = (query ? `${query}&${key}=${value.toString()}` : `${key}=${value.toString()}`);
                        });

                        let url = getAction();
                        if (!query){
                            return url;
                        }

                        return (url.includes('?') ? `${url}&${query}` : `${url}?${query}`);
                    };
                }
                else{//Post
                    buildUrl = (info) => {
                        info.body = new FormData(element);
                        return getAction();
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

                    Region.GetDatabase().Write(`inlinejs_form_${name}`, fields, () => {
                        element.dispatchEvent(new CustomEvent(`${this.key_}.save`));
                    });
                };

                if (options.persistent){
                    let name = element.getAttribute('name');
                    if (name){
                        Region.GetDatabase().Read(`inlinejs_form_${name}`, (fields) => {
                            if (!Region.IsObject(fields)){
                                return;
                            }
    
                            [...element.elements].forEach((item) => {
                                let key = item.getAttribute('name');
                                if (key && 'value' in item && key in fields){
                                    (item as any).value = fields[key];
                                    if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement){
                                        item.dispatchEvent(new InputEvent('input'));
                                    }
                                    else{
                                        (item as HTMLElement).dispatchEvent(new Event('change'));
                                    }
                                }
                            });
    
                            element.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                        });
                    }

                    
                }
            }
            else{//Not a form
                eventName = 'click';
                buildUrl = getAction;
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

            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
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

            let evaluate = (myRegion: IRegion, ok: boolean, data: any) => {
                try{
                    myRegion.GetState().PushContext('response', {
                        ok: ok,
                        data: data,
                    });
                    ExtendedDirectiveHandler.Evaluate(myRegion, element, directive.value);
                }
                catch{}

                myRegion.GetState().PopContext('response');
            };

            let afterHandledEvent = (myRegion: IRegion, ok: boolean, data: any) => {
                if (ok){
                    element.dispatchEvent(new CustomEvent('form.success', {
                        detail: { data: data },
                    }));
                }
                else{
                    element.dispatchEvent(new CustomEvent('form.error', {
                        detail: { data: data },
                    }));
                }

                if ((!options.success && !options.error) || (options.success && ok) || (options.error && !ok)){
                    if (options.nexttick){
                        myRegion.AddNextTickCallback(() => evaluate(Region.Get(regionId), ok, data));
                    }
                    else{
                        evaluate(myRegion, ok, data);
                    }
                }
            };

            let handleEvent = () => {
                if (active){
                    return;
                }
                
                let info: RequestInit = {
                    method: getMethod(),
                    credentials: 'same-origin',
                };

                setActiveState(true);
                fetch(buildUrl(info), info).then(Fetch.HandleJsonResponse).then((response) => {
                    setActiveState(false);
                    
                    let myRegion = Region.Get(regionId);
                    Object.keys(errors).forEach(key => myRegion.GetChanges().AddComposed(key, `${scopeId}.errors`));
                    
                    errors = {};
                    myRegion.GetChanges().AddComposed('errors', scopeId);

                    element.dispatchEvent(new CustomEvent('form.submit', {
                        detail: { response: response },
                    }));
                    
                    if (!Region.IsObject(response)){
                        afterHandledEvent(myRegion, true, response);

                        if (options.persistent && save){
                            save();
                        }

                        return;
                    }
                    
                    try{
                        if ('failed' in response){
                            let failed = response['failed'];
                            Object.keys(Region.IsObject(failed) ? failed : {}).forEach((key) => {
                                let failedValue = failed[key];
                                
                                errors[key] = failedValue;
                                myRegion.GetChanges().AddComposed(key, `${scopeId}.errors`);

                                if (options.form && !options.novalidate){//Set validation error
                                    let item = options.form.elements.namedItem(key);
                                    if (item && (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement || item instanceof HTMLSelectElement)){
                                        item.setCustomValidity(Array.isArray(failedValue) ? failedValue.join('\n') : Region.ToString(failedValue));
                                        item.dispatchEvent(new CustomEvent(`${this.key_}.validity`));
                                    }
                                }
                            });
                        }

                        if ('report' in response){
                            Region.GetAlertHandler().Alert(response['report']);
                        }
                        else if ('alert' in response){
                            Region.GetAlertHandler().Alert(response['alert']);
                        }

                        afterHandledEvent(myRegion, (response['ok'] !== false), response['data']);
                        if (response['ok'] === false){
                            return;
                        }

                        let router = <IRouterGlobalHandler>(Region.GetGlobalManager().GetHandler(null, '$router') as unknown), after: () => void = null;
                        if (options.redirect){
                            let redirect = (router ? router.GetCurrentQuery('redirect') : null);
                            if (typeof redirect === 'string'){
                                if (options.refresh){
                                    after = () => window.location.href = (redirect as string);
                                }
                                else if (router){
                                    after = () => router.Goto(redirect as string);
                                }
                            }
                        }
                        
                        if (!after && 'redirect' in response){
                            let redirect = response['redirect'];
                            if (Region.IsObject(redirect)){
                                if (options.refresh || redirect['refresh']){
                                    after = () => window.location.href = redirect['page'];
                                }
                                else if (router){//Use router
                                    after = () => router.Goto(redirect['page'], (options.reload || redirect['reload']));
                                }

                                if ('data' in redirect){
                                    let page = ((Region.GetGlobalManager().GetHandler(null, '$page') as unknown) as IPageGlobalHandler);
                                    if (page){//Set next page data
                                        page.SetNextPageData(redirect['data']);
                                    }
                                }
                            }
                            else if (typeof redirect === 'string'){
                                if (options.refresh){
                                    after = () => window.location.href = redirect;
                                }
                                else if (router){//Use router
                                    after = () => router.Goto(redirect, options.reload);
                                }
                            }
                        }
                        else if (!after && options.redirect){
                            if (options.refresh){
                                after = () => window.location.href = '/';
                            }
                            else if (router){
                                after = () => router.Goto('/');
                            }
                        }
                        else if (!after && options.refresh){
                            after = () => window.location.reload();
                        }
                        else if (!after && options.reload && router){
                            after = () => router.Reload();
                        }
                        else if (!after && options.reset && options.form){
                            options.form.reset();
                            myRegion.AddNextTickCallback(() => options.form.dispatchEvent(new CustomEvent(`${this.key_}.reset`)));
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
                e.stopPropagation();
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
