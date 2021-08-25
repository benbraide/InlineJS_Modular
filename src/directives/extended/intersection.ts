import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
import { IntersectionObserver } from '../../observers/intersection'
import { ExtendedDirectiveHandler } from "./generic";
import { Region } from "../../region";

export class IntersectionDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('intersection', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'intersect', ['in', 'out', 'visible', 'hidden', 'visibility']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let options = ExtendedDirectiveHandler.Evaluate(region, element, directive.value), state = {
                intersect: false,
                visible: false,
                ratio: 0,
            };

            let regionId = region.GetId(), scopeId = this.GenerateScopeId_(region), setState = (key: string, value: boolean | number) => {
                if (value == state[key]){
                    return;
                }

                state[key] = value;
                Region.Get(regionId).GetChanges().AddComposed(key, scopeId);

                let detail = {};
                detail[key] = value;

                if (key === 'intersect'){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, {
                        detail: detail,
                    }));
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${value ? 'in' : 'out'}`));
                }
                else if (key === 'visible'){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${value ? 'visible' : 'hidden'}`));
                    element.dispatchEvent(new CustomEvent(`${this.key_}.visibility`, {
                        detail: detail,
                    }));
                }
                else{//Not a visibility change
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, {
                        detail: detail,
                    }));
                }
            };

            let isOnce = (directive.arg.options.includes('once') || (Region.IsObject(options) && options['once']));
            region.GetIntersectionObserverManager().Add(element, IntersectionObserver.BuildOptions(options)).Start((entry, key) => {
                if (isOnce){
                    let myRegion = Region.Get(regionId);
                    if (myRegion){
                        myRegion.GetIntersectionObserverManager().RemoveByKey(key);
                    }
                }

                if (entry.isIntersecting){
                    setState('intersect', true);
                    setState('ratio', entry.intersectionRatio);
                    setState('visible', (entry.intersectionRatio >= 1));
                }
                else{//No intersection
                    setState('visible', false);
                    setState('ratio', 0);
                    setState('intersect', false);
                }
            });

            region.AddElement(element, true).locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop in state){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return state[prop];
                }
            }, Object.keys(state));
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
