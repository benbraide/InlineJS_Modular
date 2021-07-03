import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class AttrHelper {
    static Bind(region, element, directive, handler, arrayHandler) {
        let regionId = region.GetId();
        if (directive.arg && directive.arg.key) {
            region.GetState().TrapGetAccess(() => {
                let value = Region.GetEvaluator().Evaluate(regionId, element, directive.value);
                handler(directive.arg.key, value);
            }, true, element);
        }
        else { //Collection
            region.GetState().TrapGetAccess(() => {
                let value = Region.GetEvaluator().Evaluate(regionId, element, directive.value);
                if (Region.IsObject(value)) {
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
export class AttrDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('attr', (region, element, directive) => {
            AttrHelper.Bind(region, element, directive, (key, value) => {
                if (Region.GetConfig().IsBooleanAttribute(key)) {
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
                    element.setAttribute(key, DirectiveHandler.ToString(value));
                }
            });
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class StyleDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('style', (region, element, directive) => {
            AttrHelper.Bind(region, element, directive, (key, value) => {
                key = Region.GetProcessor().GetCamelCaseDirectiveName(key);
                if (key in element.style) {
                    element.style[key] = DirectiveHandler.ToString(value);
                }
            });
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class ClassDirectiveHandler extends DirectiveHandler {
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
                (previousList = list.map(item => DirectiveHandler.ToString(item).trim())).forEach((item) => {
                    if (item) {
                        element.classList.add(item);
                    }
                });
            });
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
