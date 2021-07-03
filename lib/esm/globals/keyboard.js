import { GlobalHandler } from './generic';
import { Region } from '../region';
export class GeneralKeyboardGlobalHandler extends GlobalHandler {
    constructor() {
        super('$keyboard', (regionId) => {
            return (target, searchOnly = false, bubble = true) => {
                var _a, _b;
                if (searchOnly) {
                    return (_a = Region.Get(regionId)) === null || _a === void 0 ? void 0 : _a.GetLocal(target, '$keyboard', bubble);
                }
                return (target ? (_b = Region.GetGlobalManager().GetHandler(regionId, '$keyboard')) === null || _b === void 0 ? void 0 : _b.Handle(regionId, target) : null);
            };
        });
    }
}
export class KeyboardGlobalHandler extends GlobalHandler {
    constructor() {
        super('keyboard', (regionId, contextElement) => {
            if (!contextElement) {
                return null;
            }
            let region = Region.Get(regionId);
            if (!region) {
                return null;
            }
            let callGlobalkeyboard = (target) => {
                return (target ? Region.GetGlobalManager().Handle(regionId, null, '$$keyboard')(target) : null);
            };
            let getAncestor = (index) => {
                let myRegion = Region.Get(regionId);
                return (myRegion ? myRegion.GetElementAncestor(contextElement, index) : null);
            };
            let elementScope = region.AddElement(contextElement, true);
            if (elementScope && '$keyboard' in elementScope.locals) {
                return elementScope.locals['$keyboard'];
            }
            let listening = { down: false, up: false }, current = { down: '', up: '' };
            let scopeId = region.GenerateDirectiveScopeId(null, '_keyboard'), handlers = {};
            const events = ['keydown', 'keyup'];
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
            let proxy = Region.CreateProxy((prop) => {
                if (prop in listening) {
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    if (!listening[prop]) {
                        listening[prop] = true;
                        bind(`key${prop}`, (event) => {
                            current[prop] = event.key;
                            region.GetChanges().AddComposed(prop, scopeId);
                        });
                    }
                    return current[prop];
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
                    return callGlobalkeyboard(getAncestor(0));
                }
                if (prop === 'ancestor') {
                    return (index) => {
                        return callGlobalkeyboard(getAncestor(index));
                    };
                }
            }, ['inside', 'parent', 'ancestor', ...events], (target, prop, value) => {
                if (typeof prop === 'string' && events.includes(prop) && typeof value === 'function') {
                    bind(prop, value);
                }
                return true;
            });
            elementScope.locals['$keyboard'] = proxy;
            return proxy;
        }, null, null, (manager) => {
            manager.AddHandler(new GeneralKeyboardGlobalHandler());
        }, (manager) => {
            manager.RemoveHandlerByKey('$keyboard');
        });
    }
}
