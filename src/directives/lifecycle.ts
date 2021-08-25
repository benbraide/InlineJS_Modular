import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export class InitDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('init', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (directive.arg.options.includes('nexttick')){
                let regionId = region.GetId();
                region.AddNextTickCallback(() => DirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value));
            }
            else{
                DirectiveHandler.BlockEvaluate(region, element, directive.value);
            }
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class UninitDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('uninit', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let regionId = region.GetId();
            region.AddElement(element, true).uninitCallbacks.push(() => DirectiveHandler.BlockEvaluateAlways(Region.Get(regionId), element, directive.value));
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class PostDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('post', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let regionId = region.GetId(), isNextTick = directive.arg.options.includes('nexttick');
            region.AddElement(element, true).postProcessCallbacks.push(() => {
                if (isNextTick){
                    Region.Get(regionId).AddNextTickCallback(() => DirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value));
                }
                else{
                    DirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value);
                }
            });
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class BindDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('bind', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            region.GetState().TrapGetAccess(() => {
                DirectiveHandler.BlockEvaluate(region, element, directive.value);
                return true;
            }, true, element);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class StaticDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('static', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Nil;
            }

            let getTargetDirective = () => {
                if (directive.arg.options.length == 0){
                    return Region.GetConfig().GetDirectiveName(directive.arg.key);
                }

                return `${Region.GetConfig().GetDirectiveName(directive.arg.key)}.${directive.arg.options.join('.')}`;
            };
            
            region.GetChanges().PushGetAccessHook(() => false);//Disable get access log
            let result = Region.GetDirectiveManager().Handle(region, element, Region.GetProcessor().GetDirectiveWith(getTargetDirective(), directive.value));
            region.GetChanges().PopGetAccessHook();

            return result;
        }, false);
    }
}
