import { DirectiveHandlerReturn } from '../typedefs';
import { DirectiveManager } from '../managers/directive';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class OnDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('on', (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return DirectiveHandlerReturn.Nil;
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
                    let debounceValue = DirectiveHandler.ExtractDuration(option, null);
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
                    let key = Region.GetProcessor().GetCamelCaseDirectiveName(option, true);
                    keyOptions.list.push(Region.GetConfig().MapKeyEvent(key) || key);
                }
            });
            let regionId = region.GetId();
            let doEvaluation = (myRegion, e) => {
                try {
                    if (myRegion) {
                        myRegion.GetState().PushEventContext(e);
                    }
                    DirectiveHandler.BlockEvaluate(myRegion, element, directive.value, false, e);
                }
                finally {
                    if (myRegion) {
                        myRegion.GetState().PopEventContext();
                    }
                }
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
                let myRegion = Region.Get(regionId);
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
                        doEvaluation(Region.Get(regionId), e);
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
            if (!options.outside) {
                if (options.window || options.document) {
                    let target = (options.window ? window : document);
                    target.addEventListener(event, onEvent);
                    if (mappedEvent) {
                        target.addEventListener(mappedEvent, onEvent);
                    }
                    region.AddElement(element).uninitCallbacks.push(() => {
                        target.removeEventListener(event, onEvent);
                        if (mappedEvent) {
                            target.removeEventListener(mappedEvent, onEvent);
                        }
                    });
                }
                else {
                    element.addEventListener(event, onEvent);
                    if (mappedEvent) {
                        element.addEventListener(mappedEvent, onEvent);
                    }
                }
            }
            else { //Outside
                region.GetOutsideEventManager().AddListener(element, event, onEvent);
                if (mappedEvent) {
                    region.GetOutsideEventManager().AddListener(element, mappedEvent, onEvent);
                }
                let scope = region.AddElement(element, true);
                if (scope) { //Add local directive
                    scope.directiveManager = (scope.directiveManager || new DirectiveManager(true));
                    scope.directiveManager.AddHandler(new DirectiveHandler('outsideEventExcept', (innerRegion, innerElement, innerDirective) => {
                        innerRegion.GetOutsideEventManager().AddExcept(innerElement, DirectiveHandler.Evaluate(innerRegion, innerElement, innerDirective.value), onEvent);
                        return DirectiveHandlerReturn.Handled;
                    }, false));
                }
            }
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
