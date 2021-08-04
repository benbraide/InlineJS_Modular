import { NoAnimation, Region } from "../../region";
import { DirectiveHandlerReturn, IDirective, IParsedAnimation, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "../extended/generic";

export class AnimateDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('animate', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let options = {
                inner: (directive.arg.key === 'inner'),
                infinite: false,
                concurrent: false,
                overlap: false,
                explicit: false,
            };

            let animator: IParsedAnimation;
            if (options.inner){
                animator = region.ParseAnimation(directive.arg.options.filter(option => (option !== 'infinite')), null, true);
            }
            else{
                animator = region.ParseAnimation(directive.arg.options, element, true);
            }
            
            if (!animator || animator instanceof NoAnimation){//Warn
                region.GetState().Warn('Animation is not supported.', element);
                return DirectiveHandlerReturn.Handled;
            }

            let runner: (checkpoint?: number, reset?: boolean) => void, state = {
                show: (null as boolean),
                index: 0,
                checkpoint: 0,
            };

            if (options.inner){
                let children = ([...element.children] as Array<HTMLElement>);
                if (children.length == 0){
                    region.GetState().Warn('Target has no children to animate.', element);
                    return DirectiveHandlerReturn.Handled;
                }
                
                directive.arg.options.forEach((option) => {
                    if (option in options){
                        options[option] = true;
                    }
                });

                runner = (checkpoint, reset = false) => {
                    if (checkpoint != state.checkpoint || (!options.explicit && !state.show)){
                        return;
                    }
                    
                    if (!options.concurrent){
                        if (reset || children.length <= state.index){
                            state.index = 0;
                        }

                        let child = children[state.index];
                        animator.Run((options.explicit ? state.show : true), child, (isCanceled) => {
                            if (isCanceled || checkpoint != state.checkpoint){
                                return;
                            }

                            if (!options.explicit){
                                if (options.overlap){
                                    animator.Run(false, child);
                                    if (++state.index < children.length || options.infinite){
                                        runner(checkpoint);
                                    }
                                }
                                else{//Wait for 'hide' animation
                                    animator.Run(false, child, (isCanceled) => {
                                        if (!isCanceled && (++state.index < children.length || options.infinite)){
                                            runner(checkpoint);
                                        }
                                    });
                                }
                            }
                            else if (++state.index < children.length || options.infinite){
                                runner(checkpoint);
                            }
                        });
                    }
                    else if (options.explicit){//Animate with state
                        (state.show ? children : children.reverse()).forEach((child) => {
                            animator.Run(state.show, child, (isCanceled) => {
                                if (!isCanceled && options.infinite && children.length <= ++state.index){
                                    runner(checkpoint);
                                }
                            });
                        });
                    }
                    else if (state){//Ignore state
                        children.forEach((child) => {
                            animator.Run(true, child, (isCanceled) => {
                                if (!isCanceled && checkpoint == state.checkpoint){
                                    animator.Run(false, child, (isCanceled) => {
                                        if (!isCanceled && options.infinite && children.length <= ++state.index){
                                            runner(checkpoint);
                                        }
                                    });
                                }
                            });
                        });
                    }
                };
            }
            else{
                runner = () => {
                    animator.Run(state.show);
                };
            }

            let regionId = region.GetId();
            region.GetState().TrapGetAccess(() => {
                let value = !! ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
                if (state.show !== value){
                    state.show = value;
                    runner(++state.checkpoint, true);
                }
            }, true, element);
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
