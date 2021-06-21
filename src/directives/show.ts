import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export class ShowDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('show', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let showValue = window.getComputedStyle(element).getPropertyValue('display');
            if (showValue === 'none'){
                showValue = 'block';
            }

            let regionId = region.GetId(), animator: (...args: Array<any>) => void = null/*CoreDirectiveHandlers.GetAnimator(region, (directive.arg.key === 'animate'), element, directive.arg.options, false)*/;
            if (animator){
                let lastValue: boolean = null, showOnly = directive.arg.options.includes('show'), hideOnly = (!showOnly && directive.arg.options.includes('hide'));
                region.GetState().TrapGetAccess(() => {
                    lastValue = !! DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                    element.style.display = (lastValue ? showValue : 'none');
                }, () => {
                    if (lastValue != (!! DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value))){
                        lastValue = !lastValue;
                        if ((lastValue ? !hideOnly : !showOnly)){
                            animator(lastValue, (show: boolean) => {//Animation is starting
                                if (show){
                                    element.style.display = showValue;
                                }
                            }, (show: boolean) => {//Animation is done
                                if (!show){
                                    element.style.display = 'none';
                                }
                            });
                        }
                        else{//No animation
                            element.style.display = (lastValue ? showValue : 'none');
                        }
                    }
                }, element);
            }
            else{
                region.GetState().TrapGetAccess(() => {
                    element.style.display = (DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value) ? showValue : 'none');
                }, true, element);
            }
            
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}