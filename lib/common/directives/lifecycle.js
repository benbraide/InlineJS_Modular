"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticDirectiveHandler = exports.BindDirectiveHandler = exports.PostDirectiveHandler = exports.UninitDirectiveHandler = exports.InitDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class InitDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('init', (region, element, directive) => {
            if (directive.arg.options.includes('nexttick')) {
                let regionId = region.GetId();
                region.AddNextTickCallback(() => generic_1.DirectiveHandler.BlockEvaluate(region_1.Region.Get(regionId), element, directive.value));
            }
            else {
                generic_1.DirectiveHandler.BlockEvaluate(region, element, directive.value);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.InitDirectiveHandler = InitDirectiveHandler;
class UninitDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('uninit', (region, element, directive) => {
            let regionId = region.GetId();
            region.AddElement(element, true).uninitCallbacks.push(() => generic_1.DirectiveHandler.BlockEvaluateAlways(region_1.Region.Get(regionId), element, directive.value));
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.UninitDirectiveHandler = UninitDirectiveHandler;
class PostDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('post', (region, element, directive) => {
            let regionId = region.GetId(), isNextTick = directive.arg.options.includes('nexttick');
            region.AddElement(element, true).postProcessCallbacks.push(() => {
                if (isNextTick) {
                    region_1.Region.Get(regionId).AddNextTickCallback(() => generic_1.DirectiveHandler.BlockEvaluate(region_1.Region.Get(regionId), element, directive.value));
                }
                else {
                    generic_1.DirectiveHandler.BlockEvaluate(region_1.Region.Get(regionId), element, directive.value);
                }
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.PostDirectiveHandler = PostDirectiveHandler;
class BindDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('bind', (region, element, directive) => {
            region.GetState().TrapGetAccess(() => {
                generic_1.DirectiveHandler.BlockEvaluate(region, element, directive.value);
                return true;
            }, true, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.BindDirectiveHandler = BindDirectiveHandler;
class StaticDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('static', (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return typedefs_1.DirectiveHandlerReturn.Nil;
            }
            let getTargetDirective = () => {
                if (directive.arg.options.length == 0) {
                    return region_1.Region.GetConfig().GetDirectiveName(directive.arg.key);
                }
                return `${region_1.Region.GetConfig().GetDirectiveName(directive.arg.key)}.${directive.arg.options.join('.')}`;
            };
            region.GetChanges().PushGetAccessHook(() => false); //Disable get access log
            let result = region_1.Region.GetDirectiveManager().Handle(region, element, region_1.Region.GetProcessor().GetDirectiveWith(getTargetDirective(), directive.value));
            region.GetChanges().PopGetAccessHook();
            return result;
        }, false);
    }
}
exports.StaticDirectiveHandler = StaticDirectiveHandler;
