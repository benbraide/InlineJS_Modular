import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class InitDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('init', (region, element, directive) => {
            DirectiveHandler.BlockEvaluate(region, element, directive.value);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class UninitDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('uninit', (region, element, directive) => {
            let regionId = region.GetId();
            region.AddElement(element, true).uninitCallbacks.push(() => DirectiveHandler.BlockEvaluateAlways(Region.Get(regionId), element, directive.value));
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class PostDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('post', (region, element, directive) => {
            let regionId = region.GetId();
            region.AddElement(element, true).postProcessCallbacks.push(() => DirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value));
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class BindDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('bind', (region, element, directive) => {
            region.GetState().TrapGetAccess(() => {
                DirectiveHandler.BlockEvaluate(region, element, directive.value);
                return true;
            }, true, element);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
export class StaticDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('static', (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return DirectiveHandlerReturn.Nil;
            }
            let getTargetDirective = () => {
                if (directive.arg.options.length == 0) {
                    return Region.GetConfig().GetDirectiveName(directive.arg.key);
                }
                return `${Region.GetConfig().GetDirectiveName(directive.arg.key)}.${directive.arg.options.join('.')}`;
            };
            region.GetChanges().PushGetAccessHook(() => false); //Disable get access log
            let result = Region.GetDirectiveManager().Handle(region, element, Region.GetProcessor().GetDirectiveWith(getTargetDirective(), directive.value));
            region.GetChanges().PopGetAccessHook();
            return result;
        }, false);
    }
}
