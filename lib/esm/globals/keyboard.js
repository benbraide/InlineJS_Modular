import { DirectiveHandlerReturn } from "../typedefs";
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { ProxiedGlobalHandler } from './generic';
import { Region } from '../region';
export class KeyboardDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(keyboard) {
        super(keyboard.GetKey(), (region, element, directive) => {
            if (['down', 'up', 'inside'].includes(directive.arg.key)) {
                let regionId = region.GetId(), proxy = keyboard.Handle(regionId, element);
                if (!proxy) {
                    return DirectiveHandlerReturn.Handled;
                }
                region.GetState().TrapGetAccess(() => {
                    ExtendedDirectiveHandler.BlockEvaluate(Region.Get(regionId), element, `(${directive.value}) = ${proxy[directive.arg.key]}`);
                }, true, element);
            }
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class KeyboardGlobalHandler extends ProxiedGlobalHandler {
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
                return (target ? Region.GetGlobalManager().Handle(regionId, null, `\$\$${this.key_}`)(target) : null);
            };
            let getAncestor = (index) => {
                let myRegion = Region.Get(regionId);
                return (myRegion ? myRegion.GetElementAncestor(contextElement, index) : null);
            };
            let proxy = this.GetProxy(contextElement);
            if (proxy) { //Already created
                return proxy;
            }
            let listening = {
                down: false,
                up: false,
                inside: false,
            };
            let current = {
                down: '',
                up: '',
            };
            const events = ['keydown', 'keyup', 'focus', 'blur', 'focusin', 'focusout'];
            let scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), inside = false, handlers = {};
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
            proxy = Region.CreateProxy((prop) => {
                if (prop === 'inside') {
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    if (!listening.inside) {
                        listening.inside = true;
                        bind('focus', () => {
                            if (!inside) {
                                inside = true;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });
                        bind('blur', () => {
                            if (inside) {
                                inside = false;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });
                    }
                    return inside;
                }
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
            }, ['inside', 'parent', 'ancestor', ...events], (prop, value) => {
                if (typeof prop === 'string' && events.includes(prop) && typeof value === 'function') {
                    bind(prop, value);
                }
                return true;
            });
            return this.AddProxy(contextElement, proxy, region);
        }, null, null, () => {
            Region.GetDirectiveManager().AddHandler(new KeyboardDirectiveHandler(this));
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
    }
}
