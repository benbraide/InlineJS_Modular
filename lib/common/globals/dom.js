"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormGlobalHandler = exports.SiblingGlobalHandler = exports.AncestorGlobalHandler = exports.ParentGlobalHandler = void 0;
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
class SiblingGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('sibling', (regionId) => (index, how = 'sequential') => region_1.Region.Get(regionId).GetElementAncestor(true, index));
    }
}
exports.SiblingGlobalHandler = SiblingGlobalHandler;
class FormGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('form', (regionId) => region_1.Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
exports.FormGlobalHandler = FormGlobalHandler;
