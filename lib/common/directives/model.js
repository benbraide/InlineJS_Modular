"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
const text_1 = require("./text");
class ModelDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('model', (region, element, directive) => {
            let regionId = region.GetId(), doneInput = false, options = {
                oneway: false,
                lazy: false,
                number: false,
                forced: false,
                trim: false,
                array: false,
            };
            directive.arg.options.forEach((option) => {
                if (option in options) {
                    options[option] = true;
                }
            });
            if (!options.oneway) {
                text_1.TextHelper.Bind(this.key_, region, element, directive, false, () => !doneInput);
            }
            let isCheckable = false, isSelect = false, isMultiple = false, isTextArea = false;
            if (element instanceof HTMLInputElement) {
                if (element.type === 'submit') { //Not supported
                    return typedefs_1.DirectiveHandlerReturn.Nil;
                }
                isCheckable = (element.type === 'checkbox' || element.type === 'radio');
            }
            else if (element instanceof HTMLSelectElement) {
                isSelect = true;
                isMultiple = element.multiple;
            }
            else if (element instanceof HTMLTextAreaElement) {
                isTextArea = true;
            }
            else { //Not supported
                return typedefs_1.DirectiveHandlerReturn.Nil;
            }
            let parseValue = (value, addQuotes = true, enforceNumber = false) => {
                if (!options.number) {
                    return (addQuotes ? `'${value}'` : value);
                }
                let parsedValue = parseFloat(value);
                if (options.forced) {
                    return (enforceNumber ? (parsedValue || 0) : (parsedValue || 0).toString());
                }
                if (addQuotes) {
                    return ((!parsedValue && parsedValue !== 0) ? (value ? `'${value}'` : 'null') : parsedValue.toString());
                }
                return ((!parsedValue && parsedValue !== 0) ? (value ? value : null) : (enforceNumber ? parsedValue : parsedValue.toString()));
            };
            let convertValue = (value, target) => {
                if (typeof value !== 'string') {
                    let joined = value.reduce((cummulative, item) => (cummulative ? (`${cummulative},${parseValue(item)}`) : `${parseValue(item)}`), '');
                    return `[${joined}]`;
                }
                if (options.trim) {
                    value = value.trim();
                }
                if (isCheckable) {
                    if (!target.checked) {
                        return 'false';
                    }
                    if (value && value !== 'on' && value !== 'true' && value !== 'checked') {
                        return `'${value}'`;
                    }
                    return 'true';
                }
                return parseValue(value);
            };
            let getValue = (target) => {
                if (!isSelect || !isMultiple) {
                    return null;
                }
                return Array.from(target.options).filter(option => option.selected).map(option => (option.value || option.text));
            };
            let setValue = (value, target) => {
                if (options.array && isCheckable) {
                    let evaluatedValue = generic_1.DirectiveHandler.Evaluate(region, element, directive.value);
                    if (evaluatedValue && Array.isArray(evaluatedValue) && value) {
                        let index = evaluatedValue.findIndex(item => (item == value));
                        if (index == -1 && target.checked) {
                            evaluatedValue.push(parseValue(value, false, true));
                        }
                        else if (index != -1 && !target.checked) { //Remove value from array
                            evaluatedValue.splice(index, 1);
                        }
                    }
                }
                else { //Assign
                    generic_1.DirectiveHandler.Evaluate(region, element, `(${directive.value})=(${convertValue((getValue(target) || value), target)})`);
                }
            };
            let onEvent = (e) => {
                doneInput = true;
                setValue(e.target.value, element);
                region_1.Region.Get(regionId).AddNextTickCallback(() => {
                    doneInput = false;
                });
            };
            if (options.oneway) { //Initial assignment
                setValue(element.value, element);
            }
            if (!options.lazy && !isSelect && !isCheckable) {
                element.addEventListener('input', onEvent);
            }
            else { //Listen on change
                element.addEventListener('change', onEvent);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.ModelDirectiveHandler = ModelDirectiveHandler;
