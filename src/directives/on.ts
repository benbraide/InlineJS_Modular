import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { DirectiveManager } from '../managers/directive'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export class OnDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('on', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Nil;
            }

            const mobileMap = {
                click: 'touchend',
                mouseup: 'touchend',
                mousedown: 'touchstart',
                mousemove: 'touchmove',
            };

            let keyOptions = {
                meta: false,
                alt: false,
                ctrl: false,
                shift: false,
                list: null,
            };
            
            let isKey = (directive.arg.key === 'keydown' || directive.arg.key === 'keyup'), debounce: number, isDebounced = false;
            if (isKey){
                keyOptions.list = new Array<string>();
            }

            let options = DirectiveHandler.GetOptions({
                outside: false,
                prevent: false,
                stop: false,
                immediate: false,
                once: false,
                document: false,
                window: false,
                self: false,
                nexttick: false,
            }, directive.arg.options, (options, option, index) => {
                if (option in options && typeof options[option] === 'boolean'){
                    return false;
                }

                if (option === 'debounce'){
                    debounce = (((index < (directive.arg.options.length - 1)) ? DirectiveHandler.ExtractDuration(directive.arg.options[index + 1], null) : null) || debounce || 250);
                }
                else if (isKey && option in keyOptions){
                    keyOptions[option] = true;
                }
                else if (isKey){
                    let key = Region.GetProcessor().GetCamelCaseDirectiveName(option, true);
                    keyOptions.list.push(Region.GetConfig().MapKeyEvent(key) || key);
                }

                return true;
            }, true);

            let regionId = region.GetId();
            let doEvaluation = (myRegion: IRegion, e: Event) => {
                DirectiveHandler.BlockEvaluate(myRegion, element, directive.value, myRegion?.GetState()?.EventContextKey(), e);
            };

            let onEvent = (e: Event) => {
                if (isDebounced){
                    return;
                }

                if (options.self && !options.outside && e.target !== element){
                    return;
                }

                if (isKey){
                    if ((keyOptions.meta && !(e as KeyboardEvent).metaKey) || (keyOptions.alt && !(e as KeyboardEvent).altKey) || (keyOptions.ctrl && !(e as KeyboardEvent).ctrlKey) || (keyOptions.shift && !(e as KeyboardEvent).shiftKey)){
                        return;//Key modifier absent
                    }

                    if (keyOptions.list && 0 < keyOptions.list.length && keyOptions.list.indexOf((e as KeyboardEvent).key) == -1){
                        return;//Keys don't match
                    }
                }
                
                if (debounce && !isDebounced){
                    isDebounced = true;
                    setTimeout(() => { isDebounced = false }, debounce);
                }
                
                let myRegion = Region.Get(regionId);
                if (!myRegion){
                    (options.window ? window : element).removeEventListener(e.type, onEvent);
                    return;
                }
                
                if (options.once && options.outside){
                    myRegion.GetOutsideEventManager().RemoveListener(element, e.type, onEvent);
                }
                else if (options.once){
                    (options.window ? window : element).removeEventListener(e.type, onEvent);
                }
                
                if (options.prevent && !options.outside){
                    e.preventDefault();
                }

                if (options.stop && !options.outside){
                    if (options.immediate){
                        e.stopImmediatePropagation();
                    }
                    else{
                        e.stopPropagation();
                    }
                }
                
                if (options.nexttick){
                    myRegion.AddNextTickCallback(() => {
                        doEvaluation(Region.Get(regionId), e);
                    });
                }
                else{
                    doEvaluation(myRegion, e);
                }
            };

            let event = region.ExpandEvent(directive.arg.key, element), mappedEvent: string = null;
            if (directive.arg.options.includes('mobile') && (event in mobileMap)){
                mappedEvent = mobileMap[event];
            }

            let getTarget = () => {
                if (options.window){
                    return window;
                }

                return (options.document ? document : element);
            };

            let unbindEvent = (target: (Window & typeof globalThis) | Document | HTMLElement) => {
                target.removeEventListener(event, onEvent);
                if (mappedEvent){
                    target.removeEventListener(mappedEvent, onEvent);
                }
            }

            if (options.outside && !options.window && !options.document){
                region.GetOutsideEventManager().AddListener(element, event, onEvent);
                if (mappedEvent){
                    region.GetOutsideEventManager().AddListener(element, mappedEvent, onEvent);
                }

                let scope = region.AddElement(element, true);
                if (scope){//Add local directive
                    scope.directiveManager = (scope.directiveManager || new DirectiveManager(true));
                    scope.directiveManager.AddHandler(new DirectiveHandler('outside.event.except', (innerRegion: IRegion, innerElement: HTMLElement, innerDirective: IDirective) => {
                        let data = DirectiveHandler.Evaluate(innerRegion, innerElement, innerDirective.value), map = {};
                        
                        map[event] = data;
                        if (mappedEvent){
                            map[mappedEvent] = data;
                        }
                        
                        innerRegion.GetOutsideEventManager().AddExcept(innerElement, map, onEvent);
                        return DirectiveHandlerReturn.Handled;
                    }, false));

                    scope.directiveManager.AddHandler(new DirectiveHandler('outside.event.except.map', (innerRegion: IRegion, innerElement: HTMLElement, innerDirective: IDirective) => {
                        innerRegion.GetOutsideEventManager().AddExcept(innerElement, DirectiveHandler.Evaluate(innerRegion, innerElement, innerDirective.value), onEvent);
                        return DirectiveHandlerReturn.Handled;
                    }, false));
                }
            }
            else{//Event on target
                let target = getTarget();

                target.addEventListener(event, onEvent);
                if (mappedEvent){
                    target.addEventListener(mappedEvent, onEvent);
                }

                if (target !== element){//Unbind on destruction
                    region.AddElement(element).uninitCallbacks.push(() => unbindEvent(target));
                }
            }

            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
