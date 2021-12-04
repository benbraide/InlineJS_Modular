import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class DataDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('data', (region, element, directive) => {
            let proxy = region.GetRootProxy().GetNativeProxy(), data;
            if (directive.value.trim() === Region.GetConfig().GetDirectiveName(this.key_)) {
                data = {};
            }
            else {
                data = DirectiveHandler.Evaluate(region, element, directive.value, true);
            }
            if (!Region.IsObject(data)) {
                data = {};
            }
            if (data.$locals) { //Add local fields
                for (let field in data.$locals) {
                    region.AddLocal(element, field, data.$locals[field]);
                }
            }
            if ((data.$enableOptimizedBinds === true || data.$enableOptimizedBinds === false) && region.GetRootElement() === element) {
                region.SetOptimizedBindsState(data.$enableOptimizedBinds);
            }
            let target, scope = (Region.Infer(element) || region).AddElement(element);
            let specialKeys = ['$locals', '$component', '$enableOptimizedBinds', '$init'], addedKeys = Object.keys(data).filter(key => !specialKeys.includes(key));
            scope.isRoot = true;
            if (region.GetRootElement() !== element) {
                let key;
                if (data.$component) {
                    key = (region.GetScope(data.$component) ? region.GenerateScopeId() : data.$component);
                }
                else { //Generate key
                    key = region.GenerateScopeId();
                }
                target = {};
                proxy[key] = target;
                let regionId = region.GetId(), scopeProxy = DirectiveHandler.CreateProxy((prop) => {
                    let myRegion = Region.Get(regionId), myProxy = (myRegion ? myRegion.GetRootProxy().GetNativeProxy() : null);
                    if (!myProxy) {
                        return null;
                    }
                    if (prop in target) {
                        return myProxy[key][prop];
                    }
                    if (prop === '$parent') {
                        return myRegion.GetLocal(myRegion.GetElementAncestor(element, 0), '$scope', true);
                    }
                    if (prop === '$key') {
                        return key;
                    }
                    return myProxy[key][prop];
                }, ['$parent', '$key'], (prop, value, target) => {
                    let myRegion = Region.Get(regionId), myProxy = (myRegion ? myRegion.GetRootProxy().GetNativeProxy() : null);
                    if (!myProxy) {
                        return false;
                    }
                    if (prop in target || typeof prop !== 'string') {
                        target[prop] = value;
                        return true;
                    }
                    if ('__InlineJS_Target__' in myProxy && prop in myProxy['__InlineJS_Target__']) {
                        myProxy[key][prop] = value;
                        return true;
                    }
                    if (prop === '$parent' || prop === '$key') {
                        return false;
                    }
                    myProxy[key][prop] = value;
                    return true;
                });
                region.AddScope(key, scopeProxy);
                region.AddLocal(element, '$scope', scopeProxy);
                scope.uninitCallbacks.push(() => {
                    let myRegion = Region.Get(regionId);
                    if (myRegion) {
                        myRegion.RemoveScope(key);
                    }
                });
            }
            else { //Root scope
                target = proxy['__InlineJS_Target__'];
                region.AddLocal(element, '$scope', proxy);
                if (data.$component) {
                    region.AddComponent(element, data.$component);
                }
            }
            addedKeys.forEach((key) => {
                target[key] = data[key];
            });
            if (data.$init) {
                Region.GetEvaluator().GetScopeRegionIds().Push(region.GetId());
                region.GetState().PushContext(region.GetState().ElementContextKey(), element);
                try {
                    data.$init.call(proxy, region);
                }
                catch (_a) { }
                region.GetState().PopContext(region.GetState().ElementContextKey());
                Region.GetEvaluator().GetScopeRegionIds().Pop();
            }
            return DirectiveHandlerReturn.Handled;
        }, true);
    }
}
export class LocalsDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('locals', (region, element, directive) => {
            let data = DirectiveHandler.Evaluate(region, element, directive.value);
            if (Region.IsObject(data)) {
                for (let field in data) {
                    region.AddLocal(element, field, data[field]);
                }
            }
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class ComponentDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('component', (region, element, directive) => {
            return (region.AddComponent(element, directive.value) ? DirectiveHandlerReturn.Handled : DirectiveHandlerReturn.Nil);
        }, false);
    }
}
export class RefDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('ref', (region, element, directive) => {
            region.AddRef(directive.value, element);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
