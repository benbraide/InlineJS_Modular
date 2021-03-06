"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class ShowDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('show', (region, element, directive) => {
            let response = generic_1.DirectiveHandler.CheckEvents(this.key_, region, element, directive, 'after', ['before']);
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let showValue = window.getComputedStyle(element).getPropertyValue('display');
            if (showValue === 'none') {
                showValue = 'block';
            }
            let regionId = region.GetId(), animator = region.ParseAnimation(directive.arg.options, element, (directive.arg.key === 'animate')), lastValue = null;
            region.GetState().TrapGetAccess(() => {
                lastValue = !!generic_1.DirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value);
                element.style.display = (lastValue ? showValue : 'none');
            }, () => {
                if (lastValue != (!!generic_1.DirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value))) {
                    animator.Run((lastValue = !lastValue), element, (isCanceled, show) => {
                        if (!show && !isCanceled) {
                            element.style.display = 'none'; //Hide element after animation
                        }
                        if (!isCanceled) {
                            element.dispatchEvent(new CustomEvent(`${this.key_}.after`, {
                                detail: { show: show },
                            }));
                        }
                    }, (show) => {
                        element.dispatchEvent(new CustomEvent(`${this.key_}.before`, {
                            detail: { show: show },
                        }));
                        if (show) {
                            element.style.display = showValue; //Show element before animation
                        }
                    });
                }
            }, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.ShowDirectiveHandler = ShowDirectiveHandler;
