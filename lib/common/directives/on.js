"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const directive_1 = require("../managers/directive");
const region_1 = require("../region");
const generic_1 = require("./generic");
class OnDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('on', (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return typedefs_1.DirectiveHandlerReturn.Nil;
            }
            const mobileMap = {
                click: 'touchend',
                mouseup: 'touchend',
                mousedown: 'touchstart',
                mousemove: 'touchmove',
            };
            let options = {
                outside: false,
                prevent: false,
                stop: false,
                immediate: false,
                once: false,
                document: false,
                window: false,
                self: false,
                nexttick: false,
            };
            let keyOptions = {
                meta: false,
                alt: false,
                ctrl: false,
                shift: false,
                list: null,
            };
            let isKey = (directive.arg.key === 'keydown' || directive.arg.key === 'keyup'), debounce, debounceIsNext = false, isDebounced = false;
            if (isKey) {
                keyOptions.list = new Array();
            }
            directive.arg.options.forEach((option) => {
                if (debounceIsNext) {
                    debounceIsNext = false;
                    let debounceValue = generic_1.DirectiveHandler.ExtractDuration(option, null);
                    if (debounceValue !== null) {
                        debounce = debounceValue;
                        return;
                    }
                }
                if (option in options) {
                    options[option] = true;
                }
                else if (option === 'away') {
                    options.outside = true;
                }
                else if (option === 'debounce') {
                    debounce = (debounce || 250);
                    debounceIsNext = true;
                }
                else if (isKey && option in keyOptions) {
                    keyOptions[option] = true;
                }
                else if (isKey) {
                    let key = region_1.Region.GetProcessor().GetCamelCaseDirectiveName(option, true);
                    keyOptions.list.push(region_1.Region.GetConfig().MapKeyEvent(key) || key);
                }
            });
            let regionId = region.GetId();
            let doEvaluation = (myRegion, e) => {
                var _a;
                generic_1.DirectiveHandler.BlockEvaluate(myRegion, element, directive.value, (_a = myRegion === null || myRegion === void 0 ? void 0 : myRegion.GetState()) === null || _a === void 0 ? void 0 : _a.EventContextKey(), e);
            };
            let onEvent = (e) => {
                if (isDebounced) {
                    return;
                }
                if (options.self && !options.outside && e.target !== element) {
                    return;
                }
                if (isKey) {
                    if ((keyOptions.meta && !e.metaKey) || (keyOptions.alt && !e.altKey) || (keyOptions.ctrl && !e.ctrlKey) || (keyOptions.shift && !e.shiftKey)) {
                        return; //Key modifier absent
                    }
                    if (keyOptions.list && 0 < keyOptions.list.length && keyOptions.list.indexOf(e.key) == -1) {
                        return; //Keys don't match
                    }
                }
                if (debounce && !isDebounced) {
                    isDebounced = true;
                    setTimeout(() => { isDebounced = false; }, debounce);
                }
                let myRegion = region_1.Region.Get(regionId);
                if (!myRegion) {
                    (options.window ? window : element).removeEventListener(e.type, onEvent);
                    return;
                }
                if (options.once && options.outside) {
                    myRegion.GetOutsideEventManager().RemoveListener(element, e.type, onEvent);
                }
                else if (options.once) {
                    (options.window ? window : element).removeEventListener(e.type, onEvent);
                }
                if (options.prevent && !options.outside) {
                    e.preventDefault();
                }
                if (options.stop && !options.outside) {
                    if (options.immediate) {
                        e.stopImmediatePropagation();
                    }
                    else {
                        e.stopPropagation();
                    }
                }
                if (options.nexttick) {
                    myRegion.AddNextTickCallback(() => {
                        doEvaluation(region_1.Region.Get(regionId), e);
                    });
                }
                else {
                    doEvaluation(myRegion, e);
                }
            };
            let event = region.ExpandEvent(directive.arg.key, element), mappedEvent = null;
            if (directive.arg.options.includes('mobile') && (event in mobileMap)) {
                mappedEvent = mobileMap[event];
            }
            let getTarget = () => {
                if (options.window) {
                    return window;
                }
                return (options.document ? document : element);
            };
            let unbindEvent = (target) => {
                target.removeEventListener(event, onEvent);
                if (mappedEvent) {
                    target.removeEventListener(mappedEvent, onEvent);
                }
            };
            if (options.outside && !options.window && !options.document) {
                region.GetOutsideEventManager().AddListener(element, event, onEvent);
                if (mappedEvent) {
                    region.GetOutsideEventManager().AddListener(element, mappedEvent, onEvent);
                }
                let scope = region.AddElement(element, true);
                if (scope) { //Add local directive
                    scope.directiveManager = (scope.directiveManager || new directive_1.DirectiveManager(true));
                    scope.directiveManager.AddHandler(new generic_1.DirectiveHandler('outside.event.except', (innerRegion, innerElement, innerDirective) => {
                        let data = generic_1.DirectiveHandler.Evaluate(innerRegion, innerElement, innerDirective.value), map = {};
                        map[event] = data;
                        if (mappedEvent) {
                            map[mappedEvent] = data;
                        }
                        innerRegion.GetOutsideEventManager().AddExcept(innerElement, map, onEvent);
                        return typedefs_1.DirectiveHandlerReturn.Handled;
                    }, false));
                    scope.directiveManager.AddHandler(new generic_1.DirectiveHandler('outside.event.except.map', (innerRegion, innerElement, innerDirective) => {
                        innerRegion.GetOutsideEventManager().AddExcept(innerElement, generic_1.DirectiveHandler.Evaluate(innerRegion, innerElement, innerDirective.value), onEvent);
                        return typedefs_1.DirectiveHandlerReturn.Handled;
                    }, false));
                }
            }
            else { //Event on target
                let target = getTarget();
                target.addEventListener(event, onEvent);
                if (mappedEvent) {
                    target.addEventListener(mappedEvent, onEvent);
                }
                if (target !== element) { //Unbind on destruction
                    region.AddElement(element).uninitCallbacks.push(() => unbindEvent(target));
                }
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.OnDirectiveHandler = OnDirectiveHandler;
