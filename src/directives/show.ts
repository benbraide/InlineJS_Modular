import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export class ShowDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('show', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = DirectiveHandler.CheckEvents(this.key_, region, element, directive, 'after', ['before']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            let showValue = window.getComputedStyle(element).getPropertyValue('display');
            if (showValue === 'none'){
                showValue = 'block';
            }

            let regionId = region.GetId(), animator = region.ParseAnimation(directive.arg.options, element, (directive.arg.key === 'animate')), lastValue: boolean = null;
            region.GetState().TrapGetAccess(() => {
                lastValue = !! DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                element.style.display = (lastValue ? showValue : 'none');
            }, () => {
                if (lastValue != (!! DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value))){
                    animator.Run((lastValue = !lastValue), element, (isCanceled, show) => {//Called after animation
                        if (!show && !isCanceled){
                            element.style.display = 'none';//Hide element after animation
                        }

                        if (!isCanceled){
                            element.dispatchEvent(new CustomEvent(`${this.key_}.after`, {
                                detail: { show: show },
                            }));
                        }
                    }, (show) => {//Called before animation runs
                        element.dispatchEvent(new CustomEvent(`${this.key_}.before`, {
                            detail: { show: show },
                        }));
                        
                        if (show){
                            element.style.display = showValue;//Show element before animation
                        }
                    });
                }
            }, element);
            
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}