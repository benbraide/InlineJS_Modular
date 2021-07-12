import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class ShowDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('show', (region, element, directive) => {
            let showValue = window.getComputedStyle(element).getPropertyValue('display');
            if (showValue === 'none') {
                showValue = 'block';
            }
            let regionId = region.GetId(), animator = Region.ParseAnimation(directive.arg.options, element, (directive.arg.key === 'animate')), lastValue = null;
            region.GetState().TrapGetAccess(() => {
                lastValue = !!DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                element.style.display = (lastValue ? showValue : 'none');
            }, () => {
                if (lastValue != (!!DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value))) {
                    animator.Cancel(lastValue);
                    animator.Run((lastValue = !lastValue), element, (isCanceled, show) => {
                        if (!show && !isCanceled) {
                            element.style.display = 'none'; //Hide element after animation
                        }
                    }, (show) => {
                        if (show) {
                            element.style.display = showValue; //Show element before animation
                        }
                    });
                }
            }, element);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}