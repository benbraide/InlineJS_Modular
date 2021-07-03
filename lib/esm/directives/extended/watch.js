import { DirectiveHandlerReturn } from '../../typedefs';
import { Region } from '../../region';
import { ExtendedDirectiveHandler } from './generic';
export class WatchDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('watch', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            let previousValue;
            region.GetState().TrapGetAccess(() => {
                let value = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
                if (!Region.IsEqual(value, previousValue)) {
                    previousValue = Region.DeepCopy(value);
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`, { detail: value }));
                }
            }, true, element);
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class WhenDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('when', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            region.GetState().TrapGetAccess(() => {
                if (!!ExtendedDirectiveHandler.Evaluate(region, element, directive.value)) {
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                }
            }, true, element);
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class OnceDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('once', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            region.GetState().TrapGetAccess(() => {
                if (!!ExtendedDirectiveHandler.Evaluate(region, element, directive.value)) {
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                    return false;
                }
                return true;
            }, true, element);
            return DirectiveHandlerReturn.Handled;
        });
    }
}
