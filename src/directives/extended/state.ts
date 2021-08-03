import { Region } from "../../region";
import { State } from "../../state";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
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
    childStates: Array<StateInfo>;
    updateState(key: string, value: any, requireAll: boolean): void;
}

export class StateDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
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

            let options = {
                delay: 750,
                lazy: false,
                submit: false,
                extended: false,
                form: (null as HTMLFormElement),
            };

            directive.arg.options.forEach((option, index) => {
                if (option === 'delay' && index < (directive.arg.options.length - 1)){
                    let delay = ExtendedDirectiveHandler.ExtractDuration(options[index + 1], null);
                    if (delay && delay > 0){
                        options.delay = delay;
                    }
                }
                else if (option in options && typeof options[option] === 'boolean'){
                    options[option] = true;
                }
            });
            
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

                let setStateValue = (state: StateInfo, key: string, value: boolean) => {
                    if (value == state[key]){//No change
                        return false;
                    }

                    state[key] = value;
                    Region.Get(regionId).GetChanges().AddComposed(key, scopeId);

                    target.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, { detail: value }));
                    target.dispatchEvent(new CustomEvent(`${this.key_}.change`, {
                        detail: {
                            target: key,
                            value: value,
                        }
                    }));

                    if (!targetInfo){//Root
                        let myRegion = Region.Get(regionId);
                        if (!myRegion){
                            return;
                        }
                        
                        try{
                            myRegion.GetState().PushContext('changed', {
                                type: key,
                                value: value,
                            });
                            ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                        }
                        catch{}

                        myRegion.GetState().PopContext('changed');
                    }

                    return true;
                };
                
                let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), myTargetInfo: StateTargetInfo = {
                    state: getDefaultState(),
                    childStates: new Array<StateInfo>(),
                    updateState(key: string, value: any, requireAll: boolean){
                        let result: boolean;
                        if (myOptions.isUnknown){
                            let truthCount = myTargetInfo.childStates.reduce((count, state) => (count + (state[key] ? 1 : 0)), 0);
                            result = setStateValue(myTargetInfo.state, key, ((truthCount == 0) ? false : (truthCount == myTargetInfo.childStates.length || !requireAll)));
                        }
                        else{//Set value
                            result = setStateValue(myTargetInfo.state, key, value);
                        }

                        if (result && targetInfo && requireAll !== null){//Update ancestors
                            targetInfo.updateState(key, value, requireAll);
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
                        if (options.extended){
                            myTargetInfo.updateState('same', ((target as HTMLInputElement).value === myOptions.value), true);
                            myTargetInfo.updateState('message', (target as HTMLInputElement).validationMessage, null);
                        }
        
                        if (!myOptions.canType || !options.lazy){
                            myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                        }
                    };

                    let stoppedTyping = () => {
                        if (!myTargetInfo.state.typing){
                            return;
                        }
                        
                        myTargetInfo.updateState('typing', false, false);
                        if (options.lazy){//Update validity
                            myTargetInfo.updateState('valid', (target as HTMLInputElement).validity.valid, true);
                        }

                        if (options.submit && options.form && options.form.checkValidity()){
                            options.form.submit();
                        }
                    };
                    
                    if (myOptions.canType){
                        target.addEventListener('input', onEvent);
                        target.addEventListener('blur', stoppedTyping);
                    }
                    else{
                        target.addEventListener('change', onEvent);
                    }

                    myTargetInfo.state.valid = (target as HTMLInputElement).validity.valid;
                    myTargetInfo.state.message = (target as HTMLInputElement).validationMessage;
                    myOptions.value = (target as HTMLInputElement).value;
                }
                else{//Unknown
                    [...target.children].forEach(child => mount((child as HTMLElement), myTargetInfo));
                    if (myTargetInfo.childStates.length == 0){
                        return;
                    }

                    myTargetInfo.childStates.forEach((state) => {
                        if (!state.valid){
                            myTargetInfo.state.valid = false;
                        }
                    });
                }

                if (targetInfo){
                    targetInfo.childStates.push(myTargetInfo.state);
                }
                
                let elementScope = region.AddElement(target, true), proxyGetter = (prop: string) => {
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

                if (!targetInfo){//Root
                    elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) => {
                        if (prop === 'self'){
                            let myRegion = Region.Get(regionId);
                            return myRegion.GetLocal(myRegion.GetState().GetContext(State.ElementContextKey()), `#${this.key_}`, false, true);
                        }
                        
                        return proxyGetter(prop);
                    }, [...proxyKeys, 'self'], proxySetter);
                }
            };

            mount(element);
            if (options.submit){//Find form
                options.form = (region.GetElementWith(element, target => (target instanceof HTMLFormElement)) as HTMLFormElement);
            }
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
