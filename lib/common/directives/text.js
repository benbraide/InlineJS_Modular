"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlDirectiveHandler = exports.TextDirectiveHandler = exports.TextHelper = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
const intersection_1 = require("../observers/intersection");
class TextHelper {
    static Bind(key, region, element, directive, isHtml, callback, allowAnimation) {
        let elementScope = region.AddElement(element, true), regionId = region.GetId();
        if (!elementScope) {
            return;
        }
        let bindKey = (callKey) => {
            if (`#${key}` in elementScope.locals) {
                region.GetState().TrapGetAccess(() => {
                    (elementScope.locals[`#${key}`])[callKey](generic_1.DirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value));
                }, true, element);
            }
        };
        if (directive.arg.key === 'prefix') {
            bindKey('setPrefix');
            return;
        }
        if (directive.arg.key === 'suffix') {
            bindKey('setSuffix');
            return;
        }
        let onChange, options = generic_1.DirectiveHandler.GetOptions({
            ancestor: -1,
            nexttick: false,
            lazy: false,
            comma: false,
            float: false,
            dollar: false,
            cent: false,
            pound: false,
            euro: false,
            yen: false,
            naira: false,
            kobo: false,
            fixed: false,
            fixedPoint: 0,
            prefix: '',
            suffix: '',
        }, directive.arg.options, (options, option, index) => {
            if (option === 'ancestor') {
                options.ancestor = ((index < (directive.arg.options.length - 1)) ? (parseInt(directive.arg.options[index + 1]) || 0) : 0);
                return true;
            }
            if (option === 'fixed') {
                options.fixedPoint = ((index < (directive.arg.options.length - 1)) ? (parseInt(directive.arg.options[index + 1]) || 4) : 4);
            }
        }, true);
        let getTextPrefix = () => {
            let prefix = '';
            if (options.dollar) {
                prefix += '$';
            }
            if (options.pound) {
                prefix += '??';
            }
            if (options.euro) {
                prefix += '???';
            }
            if (options.yen) {
                prefix += '??';
            }
            if (options.naira) {
                prefix += '???';
            }
            return (prefix + (options.prefix || ''));
        };
        let getTextSuffix = () => {
            let suffix = '';
            if (options.cent) {
                suffix += '??';
            }
            if (options.kobo) {
                suffix += 'k';
            }
            return (suffix + (options.suffix || ''));
        };
        let getTextValue = (value) => {
            return (getTextPrefix() + generic_1.DirectiveHandler.ToString(value) + getTextSuffix());
        };
        if (isHtml) {
            onChange = (value) => region_1.Region.InsertHtml(element, getTextValue(value));
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
                    element.value = getTextValue(value);
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
                    element.value = getTextValue(value);
                }
            };
        }
        else if (element instanceof HTMLTextAreaElement) {
            onChange = (value) => element.value = getTextValue(value);
        }
        else { //Unknown
            onChange = (value) => element.textContent = getTextValue(value);
        }
        let stepValue = (value, lastValue, fraction) => {
            if (fraction == 1 || value === lastValue) {
                return value;
            }
            if (typeof value === 'number') {
                if (typeof lastValue === 'number') {
                    return (options.float ? ((fraction * (value - lastValue)) + lastValue) : Math.floor((fraction * (value - lastValue)) + lastValue));
                }
                return (options.float ? (fraction * value) : Math.floor(fraction * value));
            }
            if (typeof value === 'string') {
                if (typeof lastValue === 'string') {
                    if (value.startsWith(lastValue)) { //Characters added
                        return (lastValue + ((fraction <= 0) ? '' : value.substr(lastValue.length, Math.floor(fraction * (value.length - lastValue.length)))));
                    }
                    if (lastValue.startsWith(value)) { //Characters removed
                        return (value + ((fraction <= 0) ? '' : lastValue.substr(value.length, Math.floor((1 - fraction) * (lastValue.length - value.length)))));
                    }
                }
                return ((fraction <= 0) ? '' : value.substr(0, Math.floor(fraction * value.length)));
            }
            if (typeof value === 'function') {
                return value(fraction);
            }
            if (Array.isArray(value)) {
                return value.map(item => stepValue(item, null, fraction));
            }
            if (region_1.Region.IsObject(value)) {
                let stepped = {};
                if (region_1.Region.IsObject(lastValue)) {
                    Object.entries(value).forEach(([key, value]) => (stepped[key] = stepValue(value, ((key in lastValue) ? lastValue[key] : null), fraction)));
                }
                else {
                    Object.entries(value).forEach(([key, value]) => (stepped[key] = stepValue(value, null, fraction)));
                }
                return stepped;
            }
            return value;
        };
        let lastValue = null, checkpoint = 0, queued = false, step = (value, fraction) => {
            lastValue = stepValue(value, lastValue, fraction);
            if (typeof lastValue === 'number' && ((options.float && options.fixed) || options.comma)) {
                let computed = ((options.float && options.fixed) ? (Math.round(lastValue * 100) / 100).toFixed(options.fixedPoint) : lastValue.toString());
                if (options.comma) {
                    let pointIndex = computed.indexOf('.'), beforePoint, afterPoint;
                    if (pointIndex == -1) {
                        beforePoint = computed.substring(0, (pointIndex - 1));
                        afterPoint = computed.substring(pointIndex + 1);
                    }
                    else {
                        beforePoint = computed;
                        afterPoint = '';
                    }
                    beforePoint = beforePoint.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    computed = (afterPoint ? `${beforePoint}.${afterPoint}` : beforePoint);
                }
                onChange(computed);
            }
            else {
                onChange(lastValue);
            }
        };
        let doRun = () => {
            queued = false;
            let checked = ++checkpoint, value = generic_1.DirectiveHandler.Evaluate(region_1.Region.Get(regionId), element, directive.value);
            animator.Run(true, (fraction) => {
                if (checked == checkpoint) {
                    step(value, fraction);
                }
            });
        };
        let animator = region.ParseAnimation(directive.arg.options, element, (allowAnimation && directive.arg.key === 'animate')), run = (isFirst = false) => {
            let myRegion = region_1.Region.Get(regionId);
            if (!isFirst && options.nexttick && myRegion) {
                if (!queued) {
                    queued = true;
                    myRegion.AddNextTickCallback(doRun);
                }
            }
            else {
                doRun();
            }
        };
        let isBound = false, bind = () => {
            if (isBound) {
                return;
            }
            isBound = true;
            region.GetState().TrapGetAccess(() => run(true), () => {
                if (!callback || callback()) {
                    run();
                }
            }, element);
        };
        let setOption = (key, value) => {
            if (options[key] === value) {
                return;
            }
            options[key] = value;
            if (isBound && (!callback || callback())) {
                run();
            }
        };
        elementScope.locals[`#${key}`] = region_1.Region.CreateProxy((prop) => {
            if (prop === 'setPrefix') {
                return (value) => setOption('prefix', value);
            }
            if (prop === 'setSuffix') {
                return (value) => setOption('suffix', value);
            }
            return true;
        }, ['setPrefix', 'setSuffix']);
        if (options.lazy && !callback) {
            let intersectionOptions = {
                root: ((options.ancestor == -1) ? null : region.GetElementAncestor(element, options.ancestor)),
            };
            region.GetIntersectionObserverManager().Add(element, intersection_1.IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry, key) => {
                if (!entry.isIntersecting) {
                    return;
                }
                let myRegion = region_1.Region.Get(regionId);
                if (myRegion) {
                    myRegion.GetIntersectionObserverManager().RemoveByKey(key);
                }
                bind();
            });
        }
        else { //Immediate
            bind();
        }
    }
}
exports.TextHelper = TextHelper;
class TextDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('text', (region, element, directive) => {
            TextHelper.Bind(this.key_, region, element, directive, false, null, true);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.TextDirectiveHandler = TextDirectiveHandler;
class HtmlDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('html', (region, element, directive) => {
            TextHelper.Bind(this.key_, region, element, directive, true);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.HtmlDirectiveHandler = HtmlDirectiveHandler;
