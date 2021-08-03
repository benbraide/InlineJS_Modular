import { ProxiedGlobalHandler } from './generic'
import { Region } from '../region'

export class MouseGlobalHandler extends ProxiedGlobalHandler{
    public constructor(){
        super('mouse', (regionId: string, contextElement: HTMLElement) => {
            if (!contextElement){
                return null;
            }

            let region = Region.Get(regionId);
            if (!region){
                return null;
            }

            let callGlobalMouse = (target: HTMLElement) => {
                return (target ? (Region.GetGlobalManager().Handle(regionId, null, `\$\$${this.key_}`) as (target: HTMLElement) => any)(target) : null);
            };

            let getAncestor = (index: number) => {
                let myRegion = Region.Get(regionId);
                return (myRegion ? myRegion.GetElementAncestor(contextElement, index) : null);
            };
            
            let proxy = this.GetProxy(contextElement);
            if (proxy){//Already created
                return proxy;
            }
            
            let listeningInside = false;
            let scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), inside = false, handlers: Record<string, Array<(event?: Event) => void>> = {};

            const events = ['click', 'dblclick', 'contextmenu', 'mousemove', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mouseup'];
            const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
            
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

            proxy = Region.CreateProxy((prop) =>{
                if (prop === 'inside'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    if (!listeningInside){
                        listeningInside = true;
                        bind('mouseenter', () => {
                            if (!inside){
                                inside = true;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });

                        bind('mouseleave', () => {
                            if (inside){
                                inside = false;
                                region.GetChanges().AddComposed('inside', scopeId);
                            }
                        });
                    }

                    return inside;
                }

                if (events.includes(prop) || touchEvents.includes(prop)){
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
                    return callGlobalMouse(getAncestor(0));
                }

                if (prop === 'ancestor'){
                    return (index: number) => {
                        return callGlobalMouse(getAncestor(index));
                    };
                }
            }, ['inside', 'parent', 'ancestor', ...events, ...touchEvents], (prop, value) => {
                if (typeof prop === 'string' && events.includes(prop) && typeof value === 'function'){
                    bind(prop, value);
                }

                return true;
            });

            return this.AddProxy(contextElement, proxy, region);
        });
    }
}
