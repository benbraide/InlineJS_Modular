import { Region } from "../../region";
import { State } from "../../state";
import { DirectiveHandlerReturn, IDirective, IDirectiveHandler, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "./generic";

interface StateInfo{
    valid: boolean;
    dirty: boolean;
    typing: boolean;
    same: boolean;
    message: string;
}

interface StateTargetInfo{
    state: StateInfo;
    childStates: Array<StateTargetInfo>;
    updateState(key: string, value: any, requireAll: boolean): void;
    reset(): void;
}

interface StateObserverInfo{
    target: HTMLElement;
    handler: (node?: HTMLElement) => void;
}

export class StateDirectiveHandler extends ExtendedDirectiveHandler{
    private observer_: MutationObserver = null;
    private observerHandlers_ = new Array<StateObserverInfo>();
    
    public constructor(private form_: IDirectiveHandler){
        super('state', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change', ['valid', 'dirty', 'typing', 'same']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let getDefaultState = (): StateInfo => {
                return {
                    valid: true,
                    dirty: false,
                    typing: false,
                    same: true,
                    message: '',
                };
            };
            
            let options = ExtendedDirectiveHandler.GetOptions({
                delay: 750,
                lazy: false,
                submit: false,
                extended: false,
                form: (null as HTMLFormElement),
            }, directive.arg.options, (options, option, index) => {
                if (option === 'delay'){
                    let delay = (index < (directive.arg.options.length - 1) ? ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], null) : 0);
                    if (delay && delay > 0){
                        options.delay = delay;
                    }

                    return true;
                }
            }, true);
            
            const textInputList = ['text', 'password', 'email', 'search', 'number', 'tel', 'url'];
            let mount = (target: HTMLElement, targetInfo?: StateTargetInfo) => {
                let myOptions = {
                    canType: false,
                    isUnknown: false,
                    value: '',
                };

                if (target instanceof HTMLInputElement){
                    myOptions.canType = textInputList.includes(target.type.toLowerCase());
                }
                else if (target instanceof HTMLTextAreaElement){
                    myOptions.canType = true;
                }
                else if (!(target instanceof HTMLSelectElement)){//Unknown
                    myOptions.isUnknown = true;
                }

                let elementScope = region.AddElement(target, true), setStateValue = (state: StateInfo, key: string, value: boolean) => {
                    if (value == state[key]){//No change
                        return false;
                    }

                    let myRegion = Region.Get(regionId);
                    if (!myRegion){
                        return;
                    }

                    state[key] = value;
                    myRegion.GetChanges().AddComposed(key, scopeId);

                    target.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, { detail: value }));
                    target.dispatchEvent(new CustomEvent(`${this.key_}.change`, {
                        detail: {
                            target: key,
                            value: value,
                        }
                    }));

                    if (!targetInfo){//Root
                        ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value, 'changed', {
                            type: key,
                            value: value,
                        });
                    }

                    return true;
                };
                
                if (`#${this.key_}` in elementScope.locals){
                    if (myOptions.isUnknown){
                        let myTargetInfo = (elementScope.locals[`#${this.key_}_target_info`] as StateTargetInfo);
                        
                        [...target.children].forEach(child => mount((child as HTMLElement), myTargetInfo));
                        for (let state of myTargetInfo.childStates){
                            if (!state.state.valid){
                                setStateValue(myTargetInfo.state, 'valid', false);
                                break;
                            }
                        }
                    }
                    
                    return myOptions;
                }

                let stoppedTyping = (submit = true) => {
                    if (options.lazy){//Update validity
                        (target as HTMLInputElement).setCustomValidity('');
                        if (options.extended){
                            myTargetInfo.updateState('message', (target as HTMLInputElement).validationMessage, null);
                        }
                        myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                    }
                    
                    if (!myTargetInfo.state.typing){
                        return;
                    }
                    
                    myTargetInfo.updateState('typing', false, false);
                    if (submit && options.submit && options.form && options.form.checkValidity()){
                        options.form.submit();
                    }
                };

                let checkValidity = () => {
                    myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                    if (options.extended){
                        myTargetInfo.updateState('message', (target as HTMLInputElement).validationMessage, null);
                    }
                };
                
                let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), myTargetInfo: StateTargetInfo = {
                    state: getDefaultState(),
                    childStates: new Array<StateTargetInfo>(),
                    updateState(key: string, value: any, requireAll: boolean){
                        let result: boolean;
                        if (myOptions.isUnknown){
                            let truthCount = this.childStates.reduce((count, state) => (count + (state[key] ? 1 : 0)), 0);
                            result = setStateValue(this.state, key, ((truthCount == 0) ? false : (truthCount == this.childStates.length || !requireAll)));
                        }
                        else{//Set value
                            result = setStateValue(myTargetInfo.state, key, value);
                        }

                        if (result && targetInfo && requireAll !== null){//Update ancestors
                            targetInfo.updateState(key, value, requireAll);
                        }
                    },
                    reset(){
                        if (!myOptions.isUnknown){
                            checkValidity();
                            stoppedTyping(false);
                            
                            myTargetInfo.updateState('dirty', false, false);
                            if (options.extended){
                                myOptions.value = '';
                                myTargetInfo.updateState('same', ((target as HTMLInputElement).value === myOptions.value), true);
                            }
                        }
                        else{
                            myTargetInfo.childStates.forEach(child => child.reset());
                        }
                    },
                };

                let checkpoint = 0;
                if (!myOptions.isUnknown){
                    let onEvent = () => {
                        if (myOptions.canType){
                            let myCheckpoint = ++checkpoint;
                            setTimeout(() => {//Stopped typing delay
                                if (myCheckpoint == checkpoint){
                                    stoppedTyping();
                                }
                            }, options.delay);
        
                            myTargetInfo.updateState('typing', true, false);
                        }
        
                        myTargetInfo.updateState('dirty', true, false);
                        if (!myOptions.canType || !options.lazy){
                            (target as HTMLInputElement).setCustomValidity('');
                            myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                        }
                        
                        if (options.extended){
                            myTargetInfo.updateState('same', ((target as HTMLInputElement).value === myOptions.value), true);
                            myTargetInfo.updateState('message', (target as HTMLInputElement).validationMessage, null);
                        }
                    };
                    
                    if (myOptions.canType){
                        target.addEventListener('input', onEvent);
                        target.addEventListener('blur', () => stoppedTyping());
                    }
                    else{
                        target.addEventListener('change', onEvent);
                    }

                    target.addEventListener(`${this.form_.GetKey()}.validity`, checkValidity);

                    myTargetInfo.state.valid = (target as HTMLInputElement).validity.valid;
                    myTargetInfo.state.message = (target as HTMLInputElement).validationMessage;
                    myOptions.value = (target as HTMLInputElement).value;
                }
                else{//Unknown
                    [...target.children].forEach(child => mount((child as HTMLElement), myTargetInfo));
                    if (myTargetInfo.childStates.length == 0){
                        return myOptions;
                    }

                    for (let state of myTargetInfo.childStates){
                        if (!state.state.valid){
                            myTargetInfo.state.valid = false;
                            break;
                        }
                    }
                }

                if (targetInfo){
                    targetInfo.childStates.push(myTargetInfo);
                }
                
                let proxyGetter = (prop: string) => {
                    if (prop in myTargetInfo.state){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                        return myTargetInfo.state[prop];
                    }

                    if (prop in options){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                        return options[prop];
                    }
                };

                let proxySetter = (prop: string | number | symbol, value: any) => {
                    if (typeof prop !== 'string'){
                        return true;
                    }

                    if (prop === 'delay'){
                        if (typeof value === 'string'){
                            let delay = ExtendedDirectiveHandler.ExtractDuration(value, null);
                            if (delay && delay > 0 && delay != options.delay){
                                Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                                options.delay = delay;
                            }
                        }
                        else if (typeof value === 'number' && value > 0 && value != options.delay){
                            Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                            options.delay = value;
                        }
                    }
                    else if (!myOptions.isUnknown && prop === 'message'){
                        myTargetInfo.updateState('message', ExtendedDirectiveHandler.ToString(value), null);
                        myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                    }
                    else if (prop in options && typeof options[prop] === 'boolean' && options[prop] != !! value){
                        let myRegion = Region.Get(regionId);

                        myRegion.GetChanges().AddComposed(prop, scopeId);
                        options[prop] = !options[prop];

                        if (prop === 'submit' && options.submit){//Find form
                            options.form = (region.GetElementWith(element, target => (target instanceof HTMLFormElement)) as HTMLFormElement);
                        }
                    }
                    
                    return true;
                };

                const proxyKeys = [...Object.keys(myTargetInfo.state), ...Object.keys(options)];
                elementScope.locals[`#${this.key_}`] = ExtendedDirectiveHandler.CreateProxy(proxyGetter, proxyKeys);
                elementScope.locals[`#${this.key_}_target_info`] = myTargetInfo;

                if (!targetInfo){//Root
                    elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) => {
                        if (prop === 'self'){
                            let myRegion = Region.Get(regionId);
                            return myRegion.GetLocal(myRegion.GetState().GetContext(State.ElementContextKey()), `#${this.key_}`, false, true);
                        }
                        
                        return proxyGetter(prop);
                    }, [...proxyKeys, 'self'], proxySetter);

                    if (myOptions.isUnknown){//Observe
                        this.AddObserverHandler_(element, () => mount(element));
                        region.AddElement(element, true).uninitCallbacks.push(() => this.RemoveObserverHandler_(element));
                    }
                }
                
                return myTargetInfo;
            };

            if (options.form = (region.GetElementWith(element, target => (target instanceof HTMLFormElement)) as HTMLFormElement)){
                options.form.addEventListener('reset', () => {});
            }

            mount(element);
            
            return DirectiveHandlerReturn.Handled;
        });

        if (window.MutationObserver){
            this.observer_ = new window.MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type !== 'childList'){
                        return;
                    }
                    
                    let handlers = this.observerHandlers_.filter(item => (item.target === mutation.target || item.target.contains(mutation.target))).map(item => item.handler);
                    if (handlers.length == 0){
                        return;
                    }
                    
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement){
                            handlers.forEach(handler => handler(node));
                        }
                    });
                });
    
                Region.ExecutePostProcessCallbacks();
            });
        }
    }

    protected AddObserverHandler_(target: HTMLElement, handler: (node?: HTMLElement) => void){
        if (!this.observer_){
            return;
        }
        
        if (this.observerHandlers_.findIndex(item => (item.target === target)) == -1){
            this.observer_.observe(target, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false,
            });
        }
        
        this.observerHandlers_.push({
            target: target,
            handler: handler,
        });
    }

    protected RemoveObserverHandler_(target: HTMLElement | ((node?: HTMLElement) => void)){
        if (!this.observer_){
            return;
        }
        
        let isHandler = (typeof target === 'function');
        this.observerHandlers_ = this.observerHandlers_.filter(item => (isHandler ? (target !== item.handler) : (target !== item.target)));
    }
}
