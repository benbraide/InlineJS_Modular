import { IDirective, DirectiveHandlerReturn, IRegion } from '../../typedefs'
import { IntersectionObserver } from '../../observers/intersection'
import { Fetch, FetchMode } from '../../utilities/fetch'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from './generic'

export interface XHRState{
    active: boolean;
    loaded: boolean;
    loads: number;
    progress: number;
    data: any;
}

export interface XHROptions{
    region: IRegion;
    key: string;
    expression?: string;
    element?: HTMLElement;
    expressionElement?: HTMLElement;
    publicProps?: Array<string>;
    lazy?: boolean;
    ancestor?: number;
    fetchMode?: FetchMode;
    onLoad?: (region?: IRegion, data?: any) => void;
    onError?: (err: any) => void;
    formatData?: (data: any, mode: FetchMode) => any;
    setData?: (state: XHRState, value: any, mode: FetchMode, regionId?: string, scopeId?: string) => boolean | void;
}

export class XHRHelper{
    public static BindFetch(options: XHROptions){
        options.publicProps = (options.publicProps || ['url', 'mode']);
        
        let regionId = options.region.GetId(), scopeId = options.region.GenerateDirectiveScopeId(null, `_${options.key}`), state: XHRState = {
            active: false,
            loaded: false,
            loads: 0,
            progress: 0,
            data: (options.formatData ? options.formatData(null, options.fetchMode) : null),
        };

        let methods = {
            reload: () => {
                if (fetch){
                    fetch.Reload();
                }
            },
        };

        let setState = (key: string, value: any) => {
            if (key in state && !Region.IsEqual(state[key], value)){
                state[key] = value;
                Region.Get(regionId).GetChanges().AddComposed(key, scopeId);
            }
        };
        
        let target = (options.expressionElement || options.element);
        let fetch = new Fetch(null, options.element, {
            onBeforeRequest: () => {
                setState('active', true);
                setState('progress', 0);
            },
            onLoad: (data: any) => {
                setState('active', false);
                setState('loaded', true);

                setState('loads', (state.loads + 1));
                setState('progress', 100);

                if (options.formatData){
                    data = options.formatData(data, options.fetchMode);
                }

                if (!options.element){
                    if (options.setData){
                        let response = options.setData(state, data, options.fetchMode, regionId, scopeId);
                        if (response === true){
                            Region.Get(regionId).GetChanges().AddComposed('data', scopeId);
                        }
                        else if (response !== false){
                            setState('data', data);
                        }
                    }
                    else{
                        setState('data', data);
                    }
                }

                if (target){
                    target.dispatchEvent(new CustomEvent(`${options.key}.load`, {
                        detail: { data: (options.element ? null : data) },
                    }));
                }
                
                if (options.onLoad){
                    let myRegion = Region.Get(regionId);
                    if (myRegion){
                        options.onLoad(myRegion, data);
                    }
                }
            },
            onError: (err) => {
                setState('active', false);
                setState('progress', 100);
                
                if (target){
                    target.dispatchEvent(new CustomEvent(`${options.key}.error`, {
                        detail: { error: err },
                    }));
                }

                if (options.onError){
                    options.onError(err);
                }
            },
            onProgress: (value) => {
                setState('progress', value);
            },
            onEmptyMount: () => {
                if (target){
                    target.dispatchEvent(new CustomEvent(`${options.key}.unload`));
                }
            },
            onBeforePropGet: (prop) => {
                return (!options.publicProps || options.publicProps.includes(prop) || prop in state || prop in methods);
            },
            onBeforePropSet: (prop) => {
                return (!options.publicProps || options.publicProps.includes(prop));
            },
            onPropGet: (prop) => {
                if (prop in methods){
                    return methods[prop];
                }
                
                Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                if (prop in state){
                    return state[prop];
                }
            },
            onPropSet: (prop) => {
                Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
            },
        }, (options.fetchMode || FetchMode.Replace));

        if (options.expression && target){//Bind expression
            let elementScope = options.region.AddElement(target, true), lazyUrl: string = null;
            
            fetch.Watch(options.region);
            elementScope.locals[`\$${options.key}`] = fetch.props;
            
            elementScope.uninitCallbacks.push(() => {
                fetch.EndWatch();
            });
            
            if (options.lazy){
                if (options.element){
                    let intersectionOptions = {
                        root: ((options.ancestor == -1) ? null : options.region.GetElementAncestor(options.element, options.ancestor)),
                    };
                    
                    options.region.GetIntersectionObserverManager().Add(options.element, IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry) => {
                        if (entry.isIntersecting && fetch){
                            fetch.props.url = lazyUrl;
                            options.lazy = false;
                        }
                    });
                }
                else{//Element is required
                    options.lazy = false;
                }
            }
            
            options.region.GetState().TrapGetAccess(() => {
                if (!fetch){
                    return false;
                }
                
                let myRegion = Region.Get(regionId);
                if (!myRegion){
                    return false;
                }
                
                let url = ExtendedDirectiveHandler.Evaluate(myRegion, target, options.expression);
                if (typeof url === 'string' || url === null){
                    if (options.lazy){
                        lazyUrl = url;
                    }
                    else{//Update fetch
                        fetch.props.url = url;
                    }
                }
            }, true, target);
        }
    }

    public static ExtractFetchMode(options: Array<string>){
        if (options.includes('append')){
            return FetchMode.Append;
        }

        return (options.includes('prepend') ? FetchMode.Prepend : FetchMode.Replace);
    }
}

export class XHRDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('xhr', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let lazy = false, ancestor = -1;
            if (directive.arg.options.includes('lazy')){
                let ancestorIndex = directive.arg.options.indexOf('ancestor');
                if (ancestorIndex != -1){//Resolve ancestor
                    ancestor = (((ancestorIndex + 1) < directive.arg.options.length) ? (parseInt(directive.arg.options[ancestorIndex + 1]) || 0) : 0);
                }

                lazy = true;
            }
            
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                element: element,
                lazy: lazy,
                ancestor: ancestor,
                fetchMode: XHRHelper.ExtractFetchMode(directive.arg.options),
            });

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class JSONDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('json', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let options = {
                array: false,
                number: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });
            
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                expressionElement: element,
                fetchMode: XHRHelper.ExtractFetchMode(directive.arg.options),
                formatData: (data, mode) => {
                    if (!data){
                        if (options.array){
                            return [];
                        }

                        if (options.number){
                            return 0;
                        }

                        return ((mode === FetchMode.Replace) ? {} : []);
                    }

                    if (options.number){
                        return (parseFloat(data) || 0);
                    }
                    
                    try{
                        return JSON.parse(data);
                    }
                    catch{}

                    return ((mode === FetchMode.Replace) ? {} : []);
                },
                setData: (state, value, mode, regionId, scopeId) => {
                    if (mode !== FetchMode.Replace){//Add to array
                        if (Array.isArray(value)){
                            if (mode === FetchMode.Append){
                                Region.Get(regionId).GetChanges().AddComposed(`${value.length}`, `${scopeId}.data.push`, `${scopeId}.items`);
                                (state.data as Array<any>).push(...value);
                            }
                            else{//Prepend
                                Region.Get(regionId).GetChanges().AddComposed(`${value.length}`, `${scopeId}.data.unshift`, `${scopeId}.items`);
                                (state.data as Array<any>).unshift(...value);
                            }
                        }
                        else if (mode === FetchMode.Append){
                            Region.Get(regionId).GetChanges().AddComposed('1', `${scopeId}.data.push`, `${scopeId}.items`);
                            (state.data as Array<any>).push(value);
                        }
                        else{//Prepend
                            Region.Get(regionId).GetChanges().AddComposed('1', `${scopeId}.data.unshift`, `${scopeId}.items`);
                            (state.data as Array<any>).unshift(value);
                        }
                    }
                    else{//Replace
                        state.data = value;
                    }

                    return true;
                },
            });

            return DirectiveHandlerReturn.Handled;
        });
    }
}
