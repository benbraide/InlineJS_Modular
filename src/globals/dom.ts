import { SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class ParentGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('parent', (regionId: string) => Region.Get(regionId).GetElementAncestor(true, 0));
    }
}

export class AncestorGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('ancestor', (regionId: string) => (index: number) => Region.Get(regionId).GetElementAncestor(true, index));
    }
}

export class SiblingGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('sibling', (regionId: string) => (index: number, how = 'sequential') => Region.Get(regionId).GetElementAncestor(true, index));
    }
}

export class FormGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('form', (regionId: string) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
