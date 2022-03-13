import { SimpleGlobalHandler } from './generic';
import { Region } from '../region';
export class ParentGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('parent', (regionId) => Region.Get(regionId).GetElementAncestor(true, 0));
    }
}
export class AncestorGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('ancestor', (regionId) => (index) => Region.Get(regionId).GetElementAncestor(true, index));
    }
}
export class SiblingsGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('siblings', SiblingsGlobalHandler.GetSiblings);
    }
    static GetSiblings(regionId, contextElement) {
        var _a;
        let parent = (_a = Region.Get(regionId)) === null || _a === void 0 ? void 0 : _a.GetElementAncestor(true, 0);
        return (parent ? [...parent.children].filter(child => (child !== contextElement)) : []);
    }
}
export class FormGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('form', (regionId) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
