"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnceDirectiveHandler = exports.WhenDirectiveHandler = exports.WatchDirectiveHandler = void 0;
const typedefs_1 = require("../../typedefs");
const region_1 = require("../../region");
const generic_1 = require("./generic");
class WatchDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('watch', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let previousValue;
            region.GetState().TrapGetAccess(() => {
                let value = generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
                if (!region_1.Region.IsEqual(value, previousValue)) {
                    previousValue = region_1.Region.DeepCopy(value);
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`, { detail: value }));
                }
            }, true, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.WatchDirectiveHandler = WatchDirectiveHandler;
class WhenDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('when', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            region.GetState().TrapGetAccess(() => {
                if (!!generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value)) {
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                }
            }, true, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.WhenDirectiveHandler = WhenDirectiveHandler;
class OnceDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('once', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            region.GetState().TrapGetAccess(() => {
                if (!!generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value)) {
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                    return false;
                }
                return true;
            }, true, element);
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.OnceDirectiveHandler = OnceDirectiveHandler;
