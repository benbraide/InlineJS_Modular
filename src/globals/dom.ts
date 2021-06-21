import { GlobalHandler } from './generic'
import { Region } from '../region'

export class ParentGlobalHandler extends GlobalHandler{
    public constructor(){
        super('parent', (regionId: string) => Region.Get(regionId).GetElementAncestor(true, 0));
    }
}

export class AncestorGlobalHandler extends GlobalHandler{
    public constructor(){
        super('ancestor', (regionId: string) => (index: number) => Region.Get(regionId).GetElementAncestor(true, index));
    }
}

export class SiblingGlobalHandler extends GlobalHandler{
    public constructor(){
        super('sibling', (regionId: string) => (index: number, how = 'sequential') => Region.Get(regionId).GetElementAncestor(true, index));
    }
}

export class FormGlobalHandler extends GlobalHandler{
    public constructor(){
        super('form', (regionId: string) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
