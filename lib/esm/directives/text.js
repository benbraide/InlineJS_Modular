import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class TextHelper {
    static Bind(region, element, directive, isHtml, callback) {
        let onChange, regionId = region.GetId();
        if (isHtml) {
            onChange = (value) => Region.InsertHtml(element, DirectiveHandler.ToString(value));
        }
        else if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                onChange = (value) => {
                    let valueAttr = element.getAttribute('value');
                    if (valueAttr) {
                        if (value && Array.isArray(value)) {
                            element.checked = (value.findIndex(item => (item == valueAttr)) != -1);
                        }
                        else {
                            element.checked = (value == valueAttr);
                        }
                    }
                    else {
                        element.checked = !!value;
                    }
                };
            }
            else { //Input with value
                onChange = (value) => {
                    element.value = DirectiveHandler.ToString(value);
                };
            }
        }
        else if (element instanceof HTMLSelectElement) {
            onChange = (value) => {
                if (element.multiple && Array.isArray(value)) {
                    Array.from(element.options).forEach((option) => {
                        option.selected = (value.includes(option.value || option.text));
                    });
                }
                else { //Single selection
                    element.value = DirectiveHandler.ToString(value);
                }
            };
        }
        else if (element instanceof HTMLTextAreaElement) {
            onChange = (value) => element.value = DirectiveHandler.ToString(value);
        }
        else { //Unknown
            onChange = (value) => element.textContent = DirectiveHandler.ToString(value);
        }
        region.GetState().TrapGetAccess(() => {
            if (!callback || callback()) {
                onChange(DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value));
            }
        }, true, element);
    }
}
export class TextDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('text', (region, element, directive) => {
            TextHelper.Bind(region, element, directive, false);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class HtmlDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('html', (region, element, directive) => {
            TextHelper.Bind(region, element, directive, true);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
