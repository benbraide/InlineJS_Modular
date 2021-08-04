"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefDirectiveHandler = exports.ComponentDirectiveHandler = exports.LocalsDirectiveHandler = exports.DataDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class DataDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('data', (region, element, directive) => {
            let proxy = region.GetRootProxy().GetNativeProxy(), data = generic_1.DirectiveHandler.Evaluate(region, element, directive.value, true);
            if (!region_1.Region.IsObject(data)) {
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
            let target, scope = (region_1.Region.Infer(element) || region).AddElement(element);
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
                let regionId = region.GetId(), scopeProxy = generic_1.DirectiveHandler.CreateProxy((prop) => {
                    let myRegion = region_1.Region.Get(regionId), myProxy = (myRegion ? myRegion.GetRootProxy().GetNativeProxy() : null);
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
                    let myRegion = region_1.Region.Get(regionId), myProxy = (myRegion ? myRegion.GetRootProxy().GetNativeProxy() : null);
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
                    let myRegion = region_1.Region.Get(regionId);
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
                region_1.Region.GetEvaluator().GetScopeRegionIds().Push(region.GetId());
                region.GetState().PushContext(region.GetState().ElementContextKey(), element);
                try {
                    data.$init.call(proxy, region);
                }
                catch (_a) { }
                region.GetState().PopContext(region.GetState().ElementContextKey());
                region_1.Region.GetEvaluator().GetScopeRegionIds().Pop();
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, true);
    }
}
exports.DataDirectiveHandler = DataDirectiveHandler;
class LocalsDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('locals', (region, element, directive) => {
            let data = generic_1.DirectiveHandler.Evaluate(region, element, directive.value);
            if (region_1.Region.IsObject(data)) {
                for (let field in data) {
                    region.AddLocal(element, field, data[field]);
                }
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.LocalsDirectiveHandler = LocalsDirectiveHandler;
class ComponentDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('component', (region, element, directive) => {
            return (region.AddComponent(element, directive.value) ? typedefs_1.DirectiveHandlerReturn.Handled : typedefs_1.DirectiveHandlerReturn.Nil);
        }, false);
    }
}
exports.ComponentDirectiveHandler = ComponentDirectiveHandler;
class RefDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('ref', (region, element, directive) => {
            region.AddRef(directive.value, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.RefDirectiveHandler = RefDirectiveHandler;
