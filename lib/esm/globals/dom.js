import { GlobalHandler } from './generic';
import { Region } from '../region';
export class ParentGlobalHandler extends GlobalHandler {
    constructor() {
        super('parent', (regionId) => Region.Get(regionId).GetElementAncestor(true, 0));
    }
}
export class AncestorGlobalHandler extends GlobalHandler {
    constructor() {
        super('ancestor', (regionId) => (index) => Region.Get(regionId).GetElementAncestor(true, index));
    }
}
export class SiblingGlobalHandler extends GlobalHandler {
    constructor() {
        super('sibling', (regionId) => (index, how = 'sequential') => Region.Get(regionId).GetElementAncestor(true, index));
    }
}
export class FormGlobalHandler extends GlobalHandler {
    constructor() {
        super('form', (regionId) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
