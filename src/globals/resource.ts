import { Region } from "../region";
import { GlobalHandler } from "./generic";

export type ResourceHandlerType = (data?: any) => void;

interface ResourceOptions{
    type: 'link' | 'script' | 'data';
    attribute: 'href' | 'src' | 'json' | 'text';
    target: 'head' | 'body' | null;
    path: string;
    additionalAttributes?: Record<string, string>;
}

interface ResourceInfo{
    callbacks: Array<() => void>;
    data: any;
}

export interface MixedItemInfo{
    type: 'link' | 'script';
    url: string;
}

export class ResourceGlobalHandler extends GlobalHandler{
    private origin_: string;

    private absoluteUrlTest_ = new RegExp('^(?:[a-z]+:)?//', 'i');
    private loadMap_: Record<string, ResourceInfo> = {};
    
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
                    return (items: MixedItemInfo | Array<MixedItemInfo>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>) => {
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

        this.origin_ = window.location.origin;
    }

    public Get_(info: ResourceOptions | Array<ResourceOptions>, handler: ResourceHandlerType, concurrent = true){
        let getOne = (info: ResourceOptions) => {
            let url = this.ProcessUrl(info.path);
            if (!url){
                return null;
            }

            if (url in this.loadMap_){
                return new Promise<any>((resolve) => {
                    if (this.loadMap_[url].callbacks){//Still loading
                        this.loadMap_[url].callbacks.push(() => resolve(this.loadMap_[url].data));
                    }
                    else{//Loaded
                        resolve(this.loadMap_[url].data);
                    }
                });
            }

            this.loadMap_[url] = {
                callbacks: new Array<() => void>(),
                data: null,
            };
            
            let setData = (data: any) => {
                this.loadMap_[url].data = data;
                this.loadMap_[url].callbacks.forEach (callback => callback());
                this.loadMap_[url].callbacks = null;
            };
            
            return new Promise<any>((resolve) => {
                if (info.type === 'data'){
                    fetch(url, {
                        method: 'GET',
                        credentials: 'same-origin',
                    }).then(response => ((info.attribute === 'json') ? response.json() : response.text())).then((response) => {
                        resolve(response);
                        setData(response);
                    });
                }
                else{//DOM resource
                    let resource = document.createElement(info.type);
                    resource.addEventListener('load', () => {
                        resolve(true);
                        setData(false);
                    });

                    Object.keys(info.additionalAttributes || {}).forEach(key => resource.setAttribute(key, info.additionalAttributes[key]));
                    resource.setAttribute(info.attribute, url);
                    
                    (document.querySelector(info.target) || document.body).append(resource);
                }
            });
        };

        let getAll = async (info: Array<ResourceOptions>) => {
            let values = new Array<any>();
            for (let entry of info){
                values.push(await getOne(entry));
            }

            handler(values);
        };
        
        if (!Array.isArray(info)){
            getOne(info).then(handler);
        }
        else if (concurrent){//Load resources side by side
            Promise.all(info.map(entry => getOne(entry))).then(handler);
        }
        else{//Load resources one by one
            getAll(info);
        }
    }

    public ProcessUrl(url: string){
        if (!url || this.absoluteUrlTest_.test(url)){
            return url;
        }

        return (url.startsWith('/') ? (this.origin_ + url) : `${this.origin_}/${url}`);
    }

    public GetStyle(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.Get_((Array.isArray(url) ? url : [url]).map(item => ResourceGlobalHandler.BuildOptions('link', item, attributes)), handler, concurrent);
    }

    public GetScript(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.Get_((Array.isArray(url) ? url : [url]).map(item => ResourceGlobalHandler.BuildOptions('script', item, attributes)), handler, concurrent);
    }

    public GetMixed(items: MixedItemInfo | Array<MixedItemInfo>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.Get_((Array.isArray(items) ? items : [items]).map(item => ResourceGlobalHandler.BuildOptions(item.type, item.url, attributes)), handler, concurrent);
    }

    public GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, json = true){
        this.Get_((Array.isArray(url) ? url : [url]).map(item => ResourceGlobalHandler.BuildOptions('data', item, null, json)), handler, concurrent);
    }

    public static BuildOptions(type: 'link' | 'script' | 'data', url: string, attributes?: Record<string, string>, json = true): ResourceOptions{
        return {
            type: type,
            attribute: ((type === 'data') ? (json ? 'json' : 'text') : ((type === 'link') ? 'href' : 'src')),
            target: ((type === 'data') ? null : ((type === 'link') ? 'head' : 'body')),
            path: url,
            additionalAttributes: attributes,
        };
    }
}
