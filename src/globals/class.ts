import { ProxiedGlobalHandler } from './generic'
import { Region } from '../region'

export class ClassGlobalHandler extends ProxiedGlobalHandler{
    public constructor(){
        super('class', (regionId: string, contextElement: HTMLElement) => {
            if (!contextElement){
                return null;
            }

            let proxy = this.GetProxy(contextElement);
            if (proxy){//Already created
                return proxy;
            }

            proxy = Region.CreateProxy((prop) =>{
                if (prop === 'add'){
                    return (...values: string[]) => {
                        contextElement.classList.add(...values);
                    };
                }

                if (prop === 'remove'){
                    return (...values: string[]) => {
                        values.forEach((value) => {
                            if (contextElement.classList.contains(value)){
                                contextElement.classList.remove(value);
                            }
                        });
                    };
                }

                if (prop === 'toggle'){
                    return (value: string) => {
                        return contextElement.classList.toggle(value);
                    };
                }

                if (prop === 'set'){
                    return (...values: string[]) => {
                        contextElement.className = '';
                        contextElement.classList.add(...values);
                    };
                }

                if (prop === 'contains'){
                    return (value: string) => {
                        return contextElement.classList.contains(value);
                    };
                }
            }, ['add', 'remove', 'toggle', 'set', 'contains']);

            return this.AddProxy(contextElement, proxy, Region.Get(regionId));
        });
    }
}
