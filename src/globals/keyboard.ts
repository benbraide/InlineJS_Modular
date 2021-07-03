import { GlobalHandler } from './generic'
import { Region } from '../region'

export class GeneralKeyboardGlobalHandler extends GlobalHandler{
    public constructor(){
        super('$keyboard', (regionId: string) => {
            return (target: HTMLElement, searchOnly = false, bubble = true) => {
                if (searchOnly){
                    return Region.Get(regionId)?.GetLocal(target, '$keyboard', bubble);
                }
                return (target ? Region.GetGlobalManager().GetHandler(regionId, '$keyboard')?.Handle(regionId, target) : null);
            };
        });
    }
}

export class KeyboardGlobalHandler extends GlobalHandler{
    public constructor(){
        super('keyboard', (regionId: string, contextElement: HTMLElement) => {
            if (!contextElement){
                return null;
            }

            let region = Region.Get(regionId);
            if (!region){
                return null;
            }

            let callGlobalkeyboard = (target: HTMLElement) => {
                return (target ? (Region.GetGlobalManager().Handle(regionId, null, '$$keyboard') as (target: HTMLElement) => any)(target) : null);
            };

            let getAncestor = (index: number) => {
                let myRegion = Region.Get(regionId);
                return (myRegion ? myRegion.GetElementAncestor(contextElement, index) : null);
            };
            
            let elementScope = region.AddElement(contextElement, true);
            if (elementScope && '$keyboard' in elementScope.locals){
                return elementScope.locals['$keyboard'];
            }
            
            let listening = { down: false, up: false }, current: Record<string, string> = { down: '', up: '' };
            let scopeId = region.GenerateDirectiveScopeId(null, '_keyboard'), handlers: Record<string, Array<(event?: Event) => void>> = {};

            const events = ['keydown', 'keyup'];
            let bind = (key: string, handler: (event?: Event) => void) => {
                if (!(key in handlers)){
                    handlers[key] = [handler];
                    contextElement.addEventListener(key, (e) => {
                        handlers[key].forEach((callback) => {
                            try{
                                callback(e);
                            }
                            catch{}
                        });
                    });
                }
                else if (!handlers[key].includes(handler)){//Add to exisiting
                    handlers[key].push(handler);
                }
            };

            let proxy = Region.CreateProxy((prop) =>{
                if (prop in listening){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    if (!listening[prop]){
                        listening[prop] = true;
                        bind(`key${prop}`, (event) => {
                            current[prop] = (event as KeyboardEvent).key;
                            region.GetChanges().AddComposed(prop, scopeId);
                        });
                    }

                    return current[prop];
                }

                if (events.includes(prop)){
                    return (callback: (event?: Event) => void, remove = false) => {
                        if (remove){
                            if (prop in handlers){
                                handlers[prop].splice(handlers[prop].indexOf(callback), 1);
                            }
                        }
                        else{
                            bind(prop, callback);
                        }
                    };
                }

                if (prop === 'parent'){
                    return callGlobalkeyboard(getAncestor(0));
                }

                if (prop === 'ancestor'){
                    return (index: number) => {
                        return callGlobalkeyboard(getAncestor(index));
                    };
                }
            }, ['inside', 'parent', 'ancestor', ...events], (target, prop, value) => {
                if (typeof prop === 'string' && events.includes(prop) && typeof value === 'function'){
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
