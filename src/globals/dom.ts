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

export class SiblingsGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('siblings', SiblingsGlobalHandler.GetSiblings);
    }

    public static GetSiblings(regionId: string, contextElement: HTMLElement){
        let parent = Region.Get(regionId)?.GetElementAncestor(true, 0);
        return (parent ? [...parent.children].filter(child => (child !== contextElement)) : []);
    }
}

export class FormGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('form', (regionId: string) => Region.Get(regionId).GetElementWith(true, resolvedTarget => (resolvedTarget instanceof HTMLFormElement)));
    }
}
