import { DirectiveHandlerReturn, IDirective, IRegion } from "../typedefs";
import { Region } from "../region";
import { GlobalHandler } from "./generic";
import { DirectiveHandler } from "../directives/generic";
import { ControlHelper, ControlItemInfo } from '../directives/control'
import { ExtendedDirectiveHandler } from '../directives/extended/generic'
import { Resource, ResourceOptions, ResourceHandlerType, ResourceMixedItemInfo } from "../utilities/resource";

export class ResourceDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(resource: ResourceGlobalHandler){
        super(resource.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let itemInfo: ControlItemInfo = null, info = ControlHelper.Init(this.key_, region, element, directive, () => {
                if (itemInfo){
                    ControlHelper.RemoveItem(itemInfo, info);
                }
            });

            if (!info){
                return DirectiveHandlerReturn.Handled;
            }

            let scope = region.GetElementScope(info.template);
            if (!scope){
                region.GetState().ReportError(`Failed to bind '${Region.GetConfig().GetDirectiveName(this.key_)}' to element`);
                return DirectiveHandlerReturn.Handled;
            }

            let options = {
                style: false,
                script: false,
                mixed: false,
                data: false,
                json: false,
                text: false,
                concurrent: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });

            let ifConditionChange: Array<(isTrue: boolean) => void>, listen = () => {
                let myRegion = Region.Get(info.regionId);
                if (!myRegion){
                    return;
                }
                
                let onLoad = (data: any) => {
                    let myRegion = Region.Get(info.regionId);
                    if (!myRegion){
                        return;
                    }
                    
                    ifConditionChange.forEach((callback) => {
                        try{
                            callback(true);
                        }
                        catch{}
                    });

                    itemInfo = ControlHelper.InsertItem(myRegion, info, (myItemInfo) => {
                        let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(myItemInfo.clone);
                        Object.entries(scope.locals).forEach(([key, item]) => {//Forward locals
                            cloneScope.locals[key] = item;
                        });

                        cloneScope.locals['data'] = data;
                    });
                };

                if (options.style){
                    resource.GetStyle(DirectiveHandler.Evaluate(myRegion, element, directive.value), onLoad, options.concurrent);
                }
                else if (options.script){
                    resource.GetScript(DirectiveHandler.Evaluate(myRegion, element, directive.value), onLoad, options.concurrent);
                }
                else if (options.data || options.json || options.text){
                    resource.GetData(DirectiveHandler.Evaluate(myRegion, element, directive.value), onLoad, options.concurrent, options.json);
                }
                else{//Mixed
                    resource.GetMixed(DirectiveHandler.Evaluate(myRegion, element, directive.value), onLoad, options.concurrent);
                }
            };

            if (scope.ifConditionChange && scope.ifConditionChange.length > 0){
                ifConditionChange = scope.ifConditionChange;
                listen();
            }
            else{//Initialize if condition change list
                ifConditionChange = (scope.ifConditionChange = new Array<(isTrue: boolean) => void>());
                scope.postProcessCallbacks.push(listen);
            }
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class ResourceGlobalHandler extends GlobalHandler{
    private resource_ = new Resource();
    
    public constructor(){
        super('resource', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new ResourceDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'style'){
                    return (url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>) => {
                        this.GetStyle(url, handler, concurrent, attributes);
                    };
                }

                if (prop === 'script'){
                    return (url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>) => {
                        this.GetScript(url, handler, concurrent, attributes);
                    };
                }

                if (prop === 'mixed'){
                    return (items: ResourceMixedItemInfo | Array<ResourceMixedItemInfo>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>) => {
                        this.GetMixed(items, handler, concurrent, attributes);
                    };
                }

                if (prop === 'data'){
                    return (url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, json = true) => {
                        this.GetData(url, handler, concurrent, json);
                    };
                }
            }, ['style', 'script', 'mixed', 'data']);
        }, () => {
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
    }

    public GetHandle(){
        return this.resource_;
    }

    public ProcessUrl(url: string){
        return this.resource_.ProcessUrl(url);
    }

    public GetStyle(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.resource_.GetStyle(url, handler, concurrent, attributes);
    }

    public GetScript(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.resource_.GetScript(url, handler, concurrent, attributes);
    }

    public GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, json = true){
        this.resource_.GetData(url, handler, concurrent, json);
    }

    public GetMixed(items: ResourceMixedItemInfo | string | Array<ResourceMixedItemInfo | string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.resource_.GetMixed(items, handler, concurrent, attributes);
    }

    public static BuildOptions(type: 'link' | 'script' | 'data', url: string, attributes?: Record<string, string>, json = true): ResourceOptions{
        return Resource.BuildOptions(type, url, attributes);
    }
}
