import { IGlobalHandler, IGlobalManager, IRegion } from '../typedefs'
import { Region } from '../region'

export class GlobalHandler implements IGlobalHandler{
    protected static region_ = new Region(document.createElement('template'));

    protected proxy_ = null;
    
    public constructor(protected key_: string, private canHandle_?: (regionId?: string) => boolean, private beforeAdd_?: (manager?: IGlobalManager) => boolean,
        private afterAdd_?: (manager?: IGlobalManager) => void, private afterRemove_?: (manager?: IGlobalManager) => void, private value_: any = undefined){}
    
    public GetKey(): string{
        return this.key_;
    }

    public BeforeAdd(manager: IGlobalManager): boolean{
        return (!this.beforeAdd_ || this.beforeAdd_(manager));
    }
    
    public AfterAdd(manager: IGlobalManager): void{
        if (this.afterAdd_){
            this.afterAdd_(manager);
        }
    }
    
    public AfterRemove(manager: IGlobalManager): void{
        if (this.afterRemove_){
            this.afterRemove_(manager);
        }
    }

    public CanHandle(regionId: string): boolean{
        return (!this.canHandle_ || this.canHandle_(regionId));
    }

    public Handle(regionId: string, contextElement: HTMLElement): any{
        if (typeof this.value_ === 'function'){
            return (this.value_ as (regionId?: string, contextElement?: HTMLElement) => any)(regionId, contextElement);
        }
        
        return ((this.value_ === undefined) ? this.proxy_ : this.value_);
    }
}

export class SimpleGlobalHandler extends GlobalHandler{
    public constructor(key: string, value: any, canHandle?: (regionId?: string) => boolean){
        super(key, canHandle, null, null, null, value);
    }
}

interface ProxyInfo{
    element: HTMLElement;
    proxy: any;
}

export class ProxiedGlobalHandler extends GlobalHandler{
    protected proxies_ = new Array<ProxyInfo>();
    
    public constructor(key: string, value: any, canHandle?: (regionId?: string) => boolean, beforeAdd?: (manager?: IGlobalManager) => boolean,
        afterAdd?: (manager?: IGlobalManager) => void, afterRemove?: (manager?: IGlobalManager) => void){
        super(key, canHandle, beforeAdd, afterAdd, afterRemove, value);
    }

    protected AddProxy(element: HTMLElement, proxy: any, region?: IRegion){
        this.proxies_.push({
            element: element,
            proxy: proxy,
        });

        if (region){
            let elementScope = region.GetElementScope(element);
            if (elementScope){
                elementScope.uninitCallbacks.push(() => {
                    this.RemoveProxy(element);
                });
            }
        }

        return proxy;
    }

    protected RemoveProxy(element: HTMLElement){
        this.proxies_.splice(this.proxies_.findIndex(proxy => (proxy.element === element)), 1);
    }

    protected GetProxy(element: HTMLElement){
        let index = this.proxies_.findIndex(proxy => (proxy.element === element));
        return ((index == -1) ? null : this.proxies_[index].proxy);
    }
}
