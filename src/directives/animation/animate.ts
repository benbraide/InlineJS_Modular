import { NoAnimation, Region } from "../../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "../extended/generic";

export class AnimateDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('animate', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            let animator = region.ParseAnimation(directive.arg.options, element, true);
            if (!animator || animator instanceof NoAnimation){//Warn
                return DirectiveHandlerReturn.Handled;
            }

            let regionId = region.GetId(), lastValue: boolean = null;
            region.GetState().TrapGetAccess(() => {
                let value = !! ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                if (lastValue !== value){
                    animator.Run((lastValue = value));
                }
            }, true, element);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
