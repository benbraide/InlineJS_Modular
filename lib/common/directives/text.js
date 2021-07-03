"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlDirectiveHandler = exports.TextDirectiveHandler = exports.TextHelper = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class TextHelper {
    static Bind(region, element, directive, isHtml, callback) {
        let onChange, regionId = region.GetId();
        if (isHtml) {
            onChange = (value) => region_1.Region.InsertHtml(element, generic_1.DirectiveHandler.ToString(value));
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
                    element.value = generic_1.DirectiveHandler.ToString(value);
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
                    element.value = generic_1.DirectiveHandler.ToString(value);
                }
            };
        }
        else if (element instanceof HTMLTextAreaElement) {
            onChange = (value) => element.value = generic_1.DirectiveHandler.ToString(value);
        }
        else { //Unknown
            onChange = (value) => element.textContent = generic_1.DirectiveHandler.ToString(value);
        }
        region.GetState().TrapGetAccess(() => {
            if (!callback || callback()) {
                onChange(generic_1.DirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value));
            }
        }, true, element);
    }
}
exports.TextHelper = TextHelper;
class TextDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('text', (region, element, directive) => {
            TextHelper.Bind(region, element, directive, false);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.TextDirectiveHandler = TextDirectiveHandler;
class HtmlDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('html', (region, element, directive) => {
            TextHelper.Bind(region, element, directive, true);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.HtmlDirectiveHandler = HtmlDirectiveHandler;
