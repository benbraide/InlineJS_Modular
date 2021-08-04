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
export class SiblingGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('sibling', (regionId) => (index, how = 'sequential') => Region.Get(regionId).GetElementAncestor(true, index));
    }
}
export class FormGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('form', (regionId) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
