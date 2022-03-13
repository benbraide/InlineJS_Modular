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

            let intersectionOptions = ExtendedDirectiveHandler.Evaluate(region, element, directive.value), state = {
                intersect: false,
                visible: false,
                ratio: 0,
            };

            let options = ExtendedDirectiveHandler.GetOptions({
                once: false,
                in: false,
                out: false,
                visible: false,
                hidden: false,
            }, directive.arg.options);

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

                    if ((options.in && !value) || (options.out && value)){
                        return;
                    }
                    
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${value ? 'in' : 'out'}`));
                    if (options.once){
                        Region.Get(regionId).GetIntersectionObserverManager().RemoveByKey(intersectionKey);
                    }
                }
                else if (key === 'visible'){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.visibility`, {
                        detail: detail,
                    }));

                    if ((options.visible && !value) || (options.hidden && value)){
                        return;
                    }

                    element.dispatchEvent(new CustomEvent(`${this.key_}.${value ? 'visible' : 'hidden'}`));
                    if (options.once){
                        Region.Get(regionId).GetIntersectionObserverManager().RemoveByKey(intersectionKey);
                    }
                }
                else{//Not a visibility change
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, {
                        detail: detail,
                    }));
                }
            };

            let intersection = region.GetIntersectionObserverManager().Add(element, IntersectionObserver.BuildOptions(intersectionOptions));
            intersection.Start((entry) => {
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

            let intersectionKey = intersection.GetKey(), elementScope = region.AddElement(element, true);
            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop in state){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return state[prop];
                }
            }, Object.keys(state));

            elementScope.uninitCallbacks.push(() => Region.Get(regionId).GetIntersectionObserverManager().RemoveByKey(intersectionKey));
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
