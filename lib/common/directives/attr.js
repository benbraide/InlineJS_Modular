"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassDirectiveHandler = exports.StyleDirectiveHandler = exports.AttrDirectiveHandler = exports.AttrHelper = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class AttrHelper {
    static Bind(region, element, directive, handler, arrayHandler) {
        let regionId = region.GetId();
        if (directive.arg && directive.arg.key) {
            region.GetState().TrapGetAccess(() => {
                let value = region_1.Region.GetEvaluator().Evaluate(regionId, element, directive.value);
                handler(directive.arg.key, value);
            }, true, element);
        }
        else { //Collection
            region.GetState().TrapGetAccess(() => {
                let value = region_1.Region.GetEvaluator().Evaluate(regionId, element, directive.value);
                if (region_1.Region.IsObject(value)) {
                    Object.entries(value).forEach(([key, value]) => {
                        handler(key, value);
                    });
                }
                else if (Array.isArray(value) && arrayHandler) {
                    arrayHandler(value);
                }
                else if (typeof value === 'string') {
                    arrayHandler(value.trim().replace(/\s\s+/g, ' ').split(' '));
                }
            }, true, element);
        }
    }
}
exports.AttrHelper = AttrHelper;
class AttrDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('attr', (region, element, directive) => {
            AttrHelper.Bind(region, element, directive, (key, value) => {
                if (region_1.Region.GetConfig().IsBooleanAttribute(key)) {
                    if (value) {
                        element.setAttribute(key, key);
                    }
                    else { //Remove attribute
                        element.removeAttribute(key);
                    }
                }
                else if (value === null || value === undefined || value === false) {
                    element.removeAttribute(key);
                }
                else { //Set evaluated value
                    element.setAttribute(key, generic_1.DirectiveHandler.ToString(value));
                }
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.AttrDirectiveHandler = AttrDirectiveHandler;
class StyleDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('style', (region, element, directive) => {
            AttrHelper.Bind(region, element, directive, (key, value) => {
                key = region_1.Region.GetProcessor().GetCamelCaseDirectiveName(key);
                if (key in element.style) {
                    element.style[key] = generic_1.DirectiveHandler.ToString(value);
                }
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.StyleDirectiveHandler = StyleDirectiveHandler;
class ClassDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('class', (region, element, directive) => {
            let previousList = null;
            AttrHelper.Bind(region, element, directive, (key, value) => {
                key.trim().replace(/\s\s+/g, ' ').split(' ').forEach((item) => {
                    if (value) {
                        element.classList.add(item);
                    }
                    else if (element.classList.contains(item)) {
                        element.classList.remove(item);
                    }
                });
            }, (list) => {
                if (previousList) {
                    previousList.forEach((item) => {
                        if (element.classList.contains(item)) {
                            element.classList.remove(item);
                        }
                    });
                }
                (previousList = list.map(item => generic_1.DirectiveHandler.ToString(item).trim())).forEach((item) => {
                    if (item) {
                        element.classList.add(item);
                    }
                });
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.ClassDirectiveHandler = ClassDirectiveHandler;
