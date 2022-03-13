"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormGlobalHandler = exports.SiblingsGlobalHandler = exports.AncestorGlobalHandler = exports.ParentGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class ParentGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('parent', (regionId) => region_1.Region.Get(regionId).GetElementAncestor(true, 0));
    }
}
exports.ParentGlobalHandler = ParentGlobalHandler;
class AncestorGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('ancestor', (regionId) => (index) => region_1.Region.Get(regionId).GetElementAncestor(true, index));
    }
}
exports.AncestorGlobalHandler = AncestorGlobalHandler;
class SiblingsGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('siblings', SiblingsGlobalHandler.GetSiblings);
    }
    static GetSiblings(regionId, contextElement) {
        var _a;
        let parent = (_a = region_1.Region.Get(regionId)) === null || _a === void 0 ? void 0 : _a.GetElementAncestor(true, 0);
        return (parent ? [...parent.children].filter(child => (child !== contextElement)) : []);
    }
}
exports.SiblingsGlobalHandler = SiblingsGlobalHandler;
class FormGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('form', (regionId) => region_1.Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
exports.FormGlobalHandler = FormGlobalHandler;
