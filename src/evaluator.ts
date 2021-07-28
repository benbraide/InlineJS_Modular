import { IEvaluator, IRegion, IStack } from './typedefs'

export class Evaluator implements IEvaluator{
    private cachedProxy_: Record<string, object> = {};
    
    public constructor (private regionFinder_: (id: string) => IRegion, private elementKeyName_: string, private scopeRegionIds_: IStack<string>){}
    
    public Evaluate(regionId: string, elementContext: HTMLElement | string, expression: string, useWindow = false, ignoreRemoved = true, useBlock = false): any{
        if (!(expression = expression.trim())){
            return null;
        }
        
        let region = this.regionFinder_(regionId);
        if (!region){
            return null;
        }

        if (ignoreRemoved && !region.ElementExists(elementContext)){
            return null;
        }
        
        let result: any;
        let state = region.GetState(), elementContextKey = state.ElementContextKey();

        this.scopeRegionIds_.Push(regionId);
        state.PushContext(elementContextKey, region.GetElement(elementContext));

        try{
            if (useBlock){
                result = (new Function(this.GetContextKey(), `
                    with (${this.GetContextKey()}){
                        ${expression};
                    };
                `)).bind(elementContext)(this.GetProxy(regionId, region.GetRootProxy().GetNativeProxy()));
            }
            else{
                result = (new Function(this.GetContextKey(), `
                    with (${this.GetContextKey()}){
                        return (${expression});
                    };
                `)).bind(elementContext)(this.GetProxy(regionId, region.GetRootProxy().GetNativeProxy()));
            }
        }
        catch (err){
            let elementId = (elementContext as HTMLElement).getAttribute(this.elementKeyName_);
            state.ReportError(err, `InlineJs.Region<${regionId}>.Evaluator.Evaluate(${(elementContext as HTMLElement).tagName}#${elementId}, ${expression})`);
            result = null;
        }

        state.PopContext(elementContextKey);
        this.scopeRegionIds_.Pop();
        
        return result;
    }

    public GetContextKey(){
        return '__InlineJS_Context__';
    }

    public GetProxy(regionId: string, proxy: object){
        if (regionId in this.cachedProxy_){
            return this.cachedProxy_[regionId];
        }

        return (this.cachedProxy_[regionId] = this.CreateProxy(proxy));
    }
    
    public CreateProxy(proxy: object){
        return new window.Proxy({}, {
            get(target: object, prop: string | number | symbol): any{
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)){
                    return window[prop];//Use window
                }

                return proxy[prop];
            },
            set(target: object, prop: string | number | symbol, value: any){
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)){
                    window[prop] = value;//Use window
                    return true;
                }

                try{
                    proxy[prop] = value;
                }
                catch (err){
                    return false;
                }

                return true;
            },
            deleteProperty(target: object, prop: string | number | symbol){
                if ((!(prop in proxy) || ('__InlineJS_Target__' in proxy) && !(prop in proxy['__InlineJS_Target__'])) && (prop in window)){
                    delete window[prop];//Use window
                    return true;
                }

                try{
                    delete proxy[prop];
                }
                catch (err){
                    return false;
                }

                return true;
            },
            has(target: object, prop: string | number | symbol){
                return (Reflect.has(target, prop) || (prop in proxy));
            }
        });
    }

    public RemoveProxyCache(regionId: string){
        if (regionId in this.cachedProxy_){
            delete this.cachedProxy_[regionId];
        }
    }

    public GetScopeRegionIds(): IStack<string>{
        return this.scopeRegionIds_;
    }
}
