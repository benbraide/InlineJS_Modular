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

                ++state.steps;
                if (canRun()){
                    myRegion.GetChanges().AddComposed('steps', scopeId);
                    setTimeout(step, options.delay, checkpoint);
                }
                else{//Stopped
                    state.running = false;
                    myRegion.GetChanges().AddComposed('running', scopeId);
                }

                ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
            };

            let stepAndEvaluate = (myRegion: IRegion) => {
                setTimeout(step, options.delay, ++state.checkpoint);
                ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
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
                            let myRegion = Region.Get(regionId);
                            
                            state.running = true;
                            myRegion?.GetChanges()?.AddComposed('running', scopeId);
                            
                            stepAndEvaluate(myRegion);
                        }
                    };
                }

                if (prop === 'pause'){
                    return () => {
                        if (state.running){
                            let myRegion = Region.Get(regionId);
                            
                            state.running = false;
                            myRegion?.GetChanges()?.AddComposed('running', scopeId);
                            ++state.checkpoint;

                            ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                        }
                    };
                }

                if (prop === 'stop'){
                    return () => {
                        if (!state.running){
                            return;
                        }
                        
                        let myRegion = Region.Get(regionId);
                        
                        state.running = false;
                        myRegion?.GetChanges()?.AddComposed('running', scopeId);

                        ++state.checkpoint;
                        if (state.steps != 0){
                            state.steps = 0;
                            myRegion?.GetChanges()?.AddComposed('steps', scopeId);
                        }

                        ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                    };
                }

                if (prop === 'reset'){
                    return () => {
                        let myRegion = Region.Get(regionId);
                        if (!myRegion){
                            return;
                        }

                        if (state.steps != 0){
                            state.steps = 0;
                            myRegion.GetChanges().AddComposed('steps', scopeId);
                        }
                        
                        if (!state.running){
                            state.running = true;
                            myRegion.GetChanges().AddComposed('running', scopeId);
                        }

                        stepAndEvaluate(myRegion);
                    };
                }
            }, ['steps', 'running', 'run', 'pause', 'stop', 'reset']);

            stepAndEvaluate(region);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
