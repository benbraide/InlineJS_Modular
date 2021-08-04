import { DirectiveHandlerReturn } from '../../typedefs';
import { DirectiveHandler } from '../generic';
export class ExtendedDirectiveHandler extends DirectiveHandler {
    constructor(key, handler) {
        super(key, handler, false);
    }
    GenerateScopeId_(region) {
        return region.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
    static CheckEvents(key, region, element, directive, defaultEvent, events) {
        var _a;
        const optionsWhitelist = ['outside', 'window', 'document'];
        if (defaultEvent && (directive.arg.key === defaultEvent || ExtendedDirectiveHandler.IsEventRequest((_a = directive.arg) === null || _a === void 0 ? void 0 : _a.key))) {
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${defaultEvent}`);
        }
        if (events && events.includes(directive.arg.key)) {
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${directive.arg.key}`);
        }
        return DirectiveHandlerReturn.Nil;
    }
}
