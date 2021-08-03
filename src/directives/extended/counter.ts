import { Region } from "../../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "./generic";

export class CounterDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('counter', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let options = {
                delay: 1000,
                duration: 0,
                steps: -1,
            };

            directive.arg.options.forEach((option, index) => {
                if (option in options && index < (directive.arg.options.length - 1)){
                    let value: number;
                    if (option === 'steps'){
                        value = parseInt(directive.arg.options[index + 1]);
                    }
                    else{
                        value = ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], null);
                    }

                    if (value && value > 0){
                        options[option] = value;
                    }
                }
            });

            if (options.duration > 0){
                options.steps = Math.ceil(options.duration / options.delay);
            }

            let state = {
                steps: 0,
                running: true,
                checkpoint: 0,
            };

            let canRun = () => (state.steps < options.steps || options.steps == -1);
            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), step = (checkpoint: number) => {
                if (checkpoint != state.checkpoint){
                    return;
                }
                
                let myRegion = Region.Get(regionId);
                if (!myRegion){
                    return;
                }
                
                try{
                    myRegion.GetState().PushContext('counter', {
                        steps: state.steps,
                    });
                    ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                }
                catch{}

                myRegion.GetState().PopContext('counter');
                ++state.steps;
                
                if (canRun()){
                    Region.Get(regionId).GetChanges().AddComposed('steps', scopeId);
                    setTimeout(step, options.delay, checkpoint);
                }
                else{//Stopped
                    state.running = false;
                    Region.Get(regionId).GetChanges().AddComposed('running', scopeId);
                }
            };

            let elementScope = region.AddElement(element, true);
            elementScope.uninitCallbacks.push(() => {
                ++state.checkpoint;
                options.steps = 0;
            });

            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop === 'steps' || prop === 'running'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return state[prop];
                }

                if (prop === 'run'){
                    return () => {
                        if (!state.running && canRun()){
                            state.running = true;
                            Region.Get(regionId).GetChanges().AddComposed('running', scopeId);
                            setTimeout(step, options.delay, state.checkpoint);
                        }
                    };
                }

                if (prop === 'pause'){
                    return () => {
                        if (state.running){
                            state.running = false;
                            Region.Get(regionId).GetChanges().AddComposed('running', scopeId);
                            ++state.checkpoint;
                        }
                    };
                }

                if (prop === 'stop'){
                    return () => {
                        if (state.running){
                            state.running = false;
                            Region.Get(regionId).GetChanges().AddComposed('running', scopeId);
                            ++state.checkpoint;
                        }

                        if (state.steps != 0){
                            state.steps = 0;
                            Region.Get(regionId).GetChanges().AddComposed('steps', scopeId);
                        }
                    };
                }

                if (prop === 'reset'){
                    return () => {
                        if (state.steps != 0){
                            state.steps = 0;
                            Region.Get(regionId).GetChanges().AddComposed('steps', scopeId);
                        }
                        
                        if (!state.running){
                            state.running = true;
                            Region.Get(regionId).GetChanges().AddComposed('running', scopeId);
                            setTimeout(step, options.delay, state.checkpoint);
                        }
                        else{//Replace current run
                            setTimeout(step, options.delay, ++state.checkpoint);
                        }
                    };
                }
            }, ['steps', 'running', 'run', 'pause', 'stop', 'reset']);

            setTimeout(step, options.delay, ++state.checkpoint);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
