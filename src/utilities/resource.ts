export type ResourceHandlerType = (data?: any) => void;

export interface ResourceOptions{
    type: 'link' | 'script' | 'data';
    attribute: 'href' | 'src' | 'json' | 'text';
    target: 'head' | 'body' | null;
    path: string;
    additionalAttributes?: Record<string, string>;
}

export interface ResourceInfo{
    callbacks: Array<() => void>;
    data: any;
}

export interface ResourceMixedItemInfo{
    type: 'link' | 'script' | 'data';
    url: string;
}

export class Resource{
    private origin_: string;

    private absoluteUrlTest_ = new RegExp('^(?:[a-z]+:)?//', 'i');
    private loadMap_: Record<string, ResourceInfo> = {};
    
    public constructor(){
        this.origin_ = window.location.origin;
    }

    public Get_(info: ResourceOptions | Array<ResourceOptions>, handler: ResourceHandlerType, concurrent = true){
        let getOne = (info: ResourceOptions) => {
            if (info.type === 'link'){
                info.additionalAttributes = (info.additionalAttributes || {});
                info.additionalAttributes['rel'] = 'stylesheet';
            }
            
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
        this.Get_((Array.isArray(url) ? url : [url]).map(item => Resource.BuildOptions('link', item, attributes)), handler, concurrent);
    }

    public GetScript(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.Get_((Array.isArray(url) ? url : [url]).map(item => Resource.BuildOptions('script', item, attributes)), handler, concurrent);
    }

    public GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent = true, json = true){
        this.Get_((Array.isArray(url) ? url : [url]).map(item => Resource.BuildOptions('data', item, null, json)), handler, concurrent);
    }

    public GetMixed(items: ResourceMixedItemInfo | string | Array<ResourceMixedItemInfo | string>, handler: ResourceHandlerType, concurrent = true, attributes?: Record<string, string>){
        this.Get_((Array.isArray(items) ? items : [items]).map((item) => {
            if (typeof item === 'string'){
                if (item.endsWith('.css')){
                    return Resource.BuildOptions('link', item, attributes);
                }

                if (item.endsWith('.js')){
                    return Resource.BuildOptions('script', item, attributes);
                }

                return Resource.BuildOptions('data', item, attributes);
            }

            return Resource.BuildOptions(item.type, item.url, attributes);
        }), handler, concurrent);
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