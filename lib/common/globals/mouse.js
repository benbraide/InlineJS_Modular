"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class MouseGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('mouse', (regionId, contextElement) => {
            if (!contextElement) {
                return null;
            }
            let region = region_1.Region.Get(regionId);
            if (!region) {
                return null;
            }
            let callGlobalMouse = (target) => {
                return (target ? region_1.Region.GetGlobalManager().Handle(regionId, null, '$$mouse')(target) : null);
            };
            let getAncestor = (index) => {
                let myRegion = region_1.Region.Get(regionId);
                return (myRegion ? myRegion.GetElementAncestor(contextElement, index) : null);
            };
            let elementScope = region.AddElement(contextElement, true);
            if (elementScope && '$mouse' in elementScope.locals) {
                return elementScope.locals['$mouse'];
            }
            let listeningInside = false;
            let scopeId = region.GenerateDirectiveScopeId(null, '_mouse'), inside = false, handlers = {};
            const events = ['click', 'mousemove', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove'];
            let bind = (key, handler) => {
                if (!(key in handlers)) {
                    handlers[key] = [handler];
                    contextElement.addEventListener(key, (e) => {
                        handlers[key].forEach((callback) => {
                            try {
                                callback(e);
                            }
                            catch (_a) { }
                        });
                    });
                }
                else if (!handlers[key].includes(handler)) { //Add to exisiting
                    handlers[key].push(handler);
                }
            };
            let proxy = region_1.Region.CreateProxy((prop) => {
                if (prop === 'inside') {
                    region_1.Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    if (!listeningInside) {
                        listeningInside = true;
                        bind('mouseenter', () => {
                            if (!inside) {
                                inside = true;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });
                        bind('mouseleave', () => {
                            if (inside) {
                                inside = false;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });
                    }
                    return inside;
                }
                if (events.includes(prop)) {
                    return (callback, remove = false) => {
                        if (remove) {
                            if (prop in handlers) {
                                handlers[prop].splice(handlers[prop].indexOf(callback), 1);
                            }
                        }
                        else {
                            bind(prop, callback);
                        }
                    };
                }
                if (prop === 'parent') {
                    return callGlobalMouse(getAncestor(0));
                }
                if (prop === 'ancestor') {
                    return (index) => {
                        return callGlobalMouse(getAncestor(index));
                    };
                }
            }, ['inside', 'parent', 'ancestor', ...events], (target, prop, value) => {
                if (typeof prop === 'string' && events.includes(prop) && typeof value === 'function') {
                    bind(prop, value);
                }
                return true;
            });
            elementScope.locals['$mouse'] = proxy;
            return proxy;
        });
    }
}
exports.MouseGlobalHandler = MouseGlobalHandler;
