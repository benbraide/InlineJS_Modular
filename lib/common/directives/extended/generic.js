"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedDirectiveHandler = void 0;
const typedefs_1 = require("../../typedefs");
const generic_1 = require("../generic");
class ExtendedDirectiveHandler extends generic_1.DirectiveHandler {
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
        return typedefs_1.DirectiveHandlerReturn.Nil;
    }
}
exports.ExtendedDirectiveHandler = ExtendedDirectiveHandler;
