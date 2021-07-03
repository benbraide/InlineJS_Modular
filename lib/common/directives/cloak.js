"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloakDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const generic_1 = require("./generic");
class CloakDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('cloak', (region, element, directive) => {
            return typedefs_1.DirectiveHandlerReturn.Handled; //Do nothing
        }, false);
    }
}
exports.CloakDirectiveHandler = CloakDirectiveHandler;
