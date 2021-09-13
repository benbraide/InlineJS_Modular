import { Region } from "../region";
import { GlobalHandler } from "./generic";
import { Resource, ResourceOptions, ResourceHandlerType, ResourceMixedItemInfo } from "../utilities/resource";

export class ResourceGlobalHandler extends GlobalHandler{
    private resource_ = new Resource();
    
    public constructor(){
        super('resource', null, null, () => {
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
        });
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

    public GetMixed(items: ResourceMixedItemInfo | Array<ResourceMixedItemInfo>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.resource_.GetMixed(items, handler, concurrent, attributes);
    }

    public GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, json = true){
        this.resource_.GetData(url, handler, concurrent, json);
    }

    public static BuildOptions(type: 'link' | 'script' | 'data', url: string, attributes?: Record<string, string>, json = true): ResourceOptions{
        return Resource.BuildOptions(type, url, attributes);
    }
}
