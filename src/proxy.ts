import { IRegion, IProxy, IChanges, IChange, INoResult, IValue } from './typedefs'

export class NoResult implements INoResult{}

export class Value implements IValue{
    constructor(private callback_: () => any){}
    
    public Get(): any{
        return this.callback_();
    }
}

export class ProxyHelper{
    public static regionFinder: (id: string) => IRegion = null;
    
    static CreateChildProxy(region: IRegion, owner: IProxy, name: string, target: any): IProxy | null{
        if (!owner){
            return null;
        }
        
        let ownerProxies = owner.GetProxies();
        if (name in ownerProxies && name !== 'constructor' && name !== 'proto'){
            return ownerProxies[name];
        }

        if (!Array.isArray(target) && !region.IsObject(target)){
            return null;
        }

        let childProxy = new ChildProxy(owner.GetRegionId(), ProxyHelper.regionFinder, owner.GetPath(), name, target);
        owner.AddChild(childProxy);

        return childProxy;
    }

    static ProxyGetter(target: object, prop: string, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => any): any{
        let path = (parentPath ? `${parentPath}.${name}` : name);
        if (prop === '__InlineJS_RegionId__'){
            return region.GetId();
        }
        
        if (prop === '__InlineJS_Name__'){
            return name;
        }

        if (prop === '__InlineJS_Path__'){
            return path;
        }

        if (prop === '__InlineJS_ParentPath__'){
            return parentPath;
        }

        if (prop === '__InlineJS_Target__'){
            return (('__InlineJS_Target__' in target) ? target['__InlineJS_Target__'] : target);
        }

        let exists = (prop in target);
        if (!exists && callback){
            let result = callback(region);
            if (!(result instanceof NoResult)){
                return result;
            }
        }
        
        let actualValue: any = (exists ? target[prop] : null);
        if (actualValue instanceof Value){
            return actualValue.Get();
        }

        if (region){
            if (prop.substr(0, 1) !== '$'){
                region.GetChanges().AddGetAccess(`${path}.${prop}`);
            }
            
            let value = ProxyHelper.CreateChildProxy(region, region.FindProxy(path), prop, actualValue);
            if (value){
                return ((value instanceof ChildProxy) ? value.GetNativeProxy() : value);
            }
        }

        return actualValue;
    }

    static AddChanges(changes: IChanges, type: 'set' | 'delete', path: string, prop: string) {
        if (!changes){
            return;
        }
        
        let change: IChange = {
            regionId: changes.GetRegionId(),
            type: type,
            path: path,
            prop: prop,
            origin: changes.GetOrigin()
        };
        
        changes.Add(change);
        let parts = path.split('.');

        while (parts.length > 2){//Skip root
            parts.pop();
            changes.Add({
                original: change,
                path: parts.join('.')
            });
        }
    }

    static ProxySetter(target: object, prop: string, value: any, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => boolean): boolean{
        let exists = (prop in target);
        if (!exists && callback && callback(region)){
            return true;
        }

        if (exists && value === target[prop]){
            return true;
        }
        
        let path = (parentPath ? `${parentPath}.${name}` : name);
        if (region){
            let proxy = region.FindProxy(path);
            if (proxy){
                proxy.RemoveChild(prop);
            }

            ProxyHelper.AddChanges(region.GetChanges(), 'set', `${path}.${prop}`, prop);
        }
        
        target[prop] = value;
        return true;
    }
    
    static ProxyDeleter(target: object, prop: string, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => boolean): boolean{
        let exists = (prop in target);
        if (!exists){
            return (callback && callback());
        }
        
        let path = (parentPath ? `${parentPath}.${name}` : name);
        if (region){
            let proxy = region.FindProxy(path);
            if (proxy){
                proxy.RemoveChild(prop);
            }

            ProxyHelper.AddChanges(region.GetChanges(), 'delete', path, prop);
        }

        delete target[prop];
        return true;
    }
}

export class RootProxy implements IProxy{
    private nativeProxy_: object;
    private proxies_: Record<string, IProxy> = {};
    
    public constructor (private regionId_: string, private regionFinder_: (id: string) => IRegion, private target_: object){
        if (!ProxyHelper.regionFinder){
            ProxyHelper.regionFinder = this.regionFinder_;
        }
        
        let regionId = this.regionId_, name = this.GetPath(), regionFinder = this.regionFinder_;
        let handler = {
            get(target: object, prop: string | number | symbol): any{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return null;
                }

                let stringProp = prop.toString();
                return ProxyHelper.ProxyGetter(target, stringProp, region, null, name, (region): any => {
                    let state = region.GetState();
                    if (stringProp.startsWith('$')){
                        let context = state.GetContext(stringProp.substr(1), new NoResult());
                        if (!(context instanceof NoResult)){//Context found
                            return ((context instanceof Value) ? context.Get() : context);
                        }
                    }
                    
                    let contextElement = region.GetState().GetContext(state.ElementContextKey());
                    let local = region.GetLocal((contextElement || region.GetRootElement()), stringProp);
                    
                    if (!(local instanceof NoResult)){//Local found
                        return ((local instanceof Value) ? local.Get() : local);
                    }

                    let result = region.GetGlobalManager().Handle(regionId, contextElement, stringProp, () => new NoResult());
                    return ((result instanceof Value) ? result.Get() : result);
                });
            },
            set(target: object, prop: string | number | symbol, value: any): boolean{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.set(target, prop, value);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return false;
                }

                return ProxyHelper.ProxySetter(target, prop.toString(), value, region, null, name, () => {
                    return false;
                });
            },
            deleteProperty(target: object, prop: string | number | symbol): boolean{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return false;
                }

                return ProxyHelper.ProxyDeleter(target, prop.toString(), region, null, name, () => {
                    return false;
                });
            },
            has(target: object, prop: string | number | symbol): boolean{
                return (typeof prop !== 'symbol' || Reflect.has(target, prop));
            },
        };

        this.nativeProxy_ = new window.Proxy(this.target_, handler);
    }

    public IsRoot(){
        return true;
    }

    public GetRegionId(){
        return this.regionId_;
    }

    public GetTarget(){
        return this.target_;
    }

    public GetNativeProxy(){
        return this.nativeProxy_;
    }

    public GetName(){
        return `Proxy<${this.regionId_}>`;
    }

    public GetPath(){
        return this.GetName();
    }

    public GetParentPath(){
        return '';
    }

    public AddChild(child: IProxy){
        this.proxies_[child.GetName()] = child;
        let region = this.regionFinder_(this.regionId_);
        if (region){
            region.AddProxy(child);
        }
    }

    public RemoveChild(name: string){
        delete this.proxies_[name];
        let region = this.regionFinder_(this.regionId_);
        if (region){
            region.RemoveProxy(`${this.GetPath()}.${name}`);
        }
    }

    public GetProxies(){
        return this.proxies_;
    }

    public static Watch(region: IRegion, elementContext: HTMLElement | string, expression: string, callback: (value: any) => boolean, skipFirst: boolean){
        if (!region){
            return;
        }
        
        let previousValue: any;
        let onChange = () => {
            let value = region.GetEvaluator().Evaluate(region.GetId(), elementContext, expression);
            if (region.IsEqual(value, previousValue)){
                return true;
            }

            previousValue = region.DeepCopy(value);
            return callback(value);
        };

        region.GetState().TrapGetAccess(() => {
            let value = region.GetEvaluator().Evaluate(region.GetId(), elementContext, `$use(${expression})`);
            previousValue = region.DeepCopy(value);
            return (skipFirst || callback(value));
        }, onChange, elementContext);
    }
}

export class ChildProxy implements IProxy{
    private nativeProxy_: object;
    private proxies_: Record<string, IProxy> = {};
    
    public constructor (private regionId_: string, private regionFinder_: (id: string) => IRegion, private parentPath_: string, private name_: string, private target_: object){
        let regionId = this.regionId_, parentPath = this.parentPath_, name = this.name_, isArray = Array.isArray(this.target_), regionFinder = this.regionFinder_;
        let tempProxy = new window.Proxy(this.target_, {
            get(target: object, prop: string | number | symbol): any{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }
                
                let region = regionFinder(regionId);
                if (!region){
                    return null;
                }
                
                return ProxyHelper.ProxyGetter(target, prop.toString(), region, parentPath, name);
            },
            set(target: object, prop: string | number | symbol, value: any): boolean{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.set(target, prop, value);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return false;
                }

                return ProxyHelper.ProxySetter(target, prop.toString(), value, region, parentPath, name);
            },
        });

        let handler = {
            get(target: object, prop: string | number | symbol): any{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }

                if ('__InlineJS_Target__' in target){
                    return target[prop];
                }

                let region = regionFinder(regionId);
                if (!region){
                    return null;
                }

                if (isArray && typeof prop === 'string'){
                    if (prop === 'unshift'){
                        return (...items: any[]) => {
                            let path = (parentPath ? `${parentPath}.${name}.unshift` : `${name}.unshift`);
                            ProxyHelper.AddChanges(region.GetChanges(), 'set', `${path}.${items.length}`, `${items.length}`);
                            return tempProxy['unshift'](...items);
                        };
                    }
                    else if (prop === 'shift'){
                        return () => {
                            let path = (parentPath ? `${parentPath}.${name}.shift` : `${name}.shift`);
                            ProxyHelper.AddChanges(region.GetChanges(), 'set', `${path}.1`, '1');
                            return tempProxy['shift']();
                        };
                    }
                    else if (prop === 'splice'){
                        return (start: number, deleteCount?: number, ...items: any[]) => {
                            if ((target as Array<any>).length <= start){
                                return tempProxy['splice'](start, deleteCount, ...items);
                            }

                            let path = (parentPath ? `${parentPath}.${name}.splice` : `${name}.splice`);
                            ProxyHelper.AddChanges(region.GetChanges(), 'set', `${path}.${start}.${deleteCount}.${items.length}`, `${start}.${deleteCount}.${items.length}`);

                            return tempProxy['splice'](start, deleteCount, ...items);
                        };
                    }
                }

                return ProxyHelper.ProxyGetter(target, prop.toString(), region, parentPath, name);
            },
            set(target: object, prop: string | number | symbol, value: any): boolean{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.set(target, prop, value);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return false;
                }

                return ProxyHelper.ProxySetter(target, prop.toString(), value, region, parentPath, name);
            },
            deleteProperty(target: object, prop: string | number | symbol): boolean{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }

                let region = regionFinder(regionId);
                if (!region){
                    return false;
                }

                return ProxyHelper.ProxyDeleter(target, prop.toString(), region, parentPath, name);
            },
            has(target: object, prop: string | number | symbol): boolean{
                return (typeof prop !== 'symbol' || Reflect.has(target, prop));
            },
        };

        this.nativeProxy_ = new window.Proxy(this.target_, handler);
        regionFinder(this.regionId_).AddProxy(this);
    }

    public IsRoot(){
        return false;
    }

    public GetRegionId(){
        return this.regionId_;
    }

    public GetTarget(){
        return this.target_;
    }

    public GetNativeProxy(){
        return this.nativeProxy_;
    }

    public GetName(){
        return this.name_;
    }

    public GetPath(){
        return `${this.parentPath_}.${this.name_}`;
    }

    public GetParentPath(){
        return this.parentPath_;
    }

    public AddChild(child: IProxy){
        this.proxies_[child.GetName()] = child;
        let region = this.regionFinder_(this.regionId_);
        if (region){
            region.AddProxy(child);
        }
    }

    public RemoveChild(name: string){
        delete this.proxies_[name];
        let region = this.regionFinder_(this.regionId_);
        if (region){
            region.RemoveProxy(`${this.GetPath()}.${name}`);
        }
    }

    public GetProxies(){
        return this.proxies_;
    }
}
