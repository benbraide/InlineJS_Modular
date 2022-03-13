import { SimpleGlobalHandler } from './generic';
export declare class ParentGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class AncestorGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class SiblingsGlobalHandler extends SimpleGlobalHandler {
    constructor();
    static GetSiblings(regionId: string, contextElement: HTMLElement): Element[];
}
export declare class FormGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
