import { ResizeObserver } from "../../observers/resize";
import { Region } from "../../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "./generic";

export class ChangeDirectiveHandler extends ExtendedDirectiveHandler{
    private observers_: Record<string, ResizeObserver> = {};
    
    public constructor(){
        super('change', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let properties = {
                attribute: true,
                content: true,
                size: true,
            };

            if (directive.arg.key in properties){//Property specified
                Object.keys(properties).forEach(key => (properties[key] = false));
                properties[directive.arg.key] = true;
            }

            let regionId = region.GetId(), elementScope = region.AddElement(element, true), evaluate = (data: Record<string, any>) => {
                ExtendedDirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value, 'changed', data);
            };

            if (properties.attribute){
                elementScope.attributeChangeCallbacks.push((name) => {
                    evaluate({
                        type: 'attribute',
                        name: name,
                        value: element.getAttribute(name),
                    });
                });
            }

            if (properties.size){
                let scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), observer = new ResizeObserver(regionId), key = '';
                elementScope.uninitCallbacks.push(() => {
                    if (scopeId in this.observers_){
                        this.observers_[scopeId].Unbind(key);
                        delete this.observers_[scopeId];
                    }
                });

                this.observers_[scopeId] = observer;
                key = observer.Bind(element, (entry) => {
                    evaluate({
                        type: 'size',
                        contentRect: entry.contentRect,
                        contentBoxSize: entry.contentBoxSize,
                        borderBoxSize: entry.borderBoxSize,
                    });
                });
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}
