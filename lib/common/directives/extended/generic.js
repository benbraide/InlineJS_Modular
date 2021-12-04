"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedDirectiveHandler = void 0;
const generic_1 = require("../generic");
class ExtendedDirectiveHandler extends generic_1.DirectiveHandler {
    constructor(key, handler) {
        super(key, handler, false);
    }
    GenerateScopeId_(region) {
        return region.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
}
exports.ExtendedDirectiveHandler = ExtendedDirectiveHandler;
