import { IDirective, IRegion } from '../typedefs';
import { DirectiveHandler } from './generic';
export declare class AttrHelper {
    static Bind(region: IRegion, element: HTMLElement, directive: IDirective, handler: (key: string, value: any) => void, arrayHandler?: (list: Array<any>) => void): void;
}
export declare class AttrDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class StyleDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class ClassDirectiveHandler extends DirectiveHandler {
    constructor();
}
