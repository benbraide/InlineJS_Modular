import { IDirective, IRegion } from '../typedefs';
import { DirectiveHandler } from './generic';
export declare class TextHelper {
    static Bind(region: IRegion, element: HTMLElement, directive: IDirective, isHtml: boolean, callback?: () => boolean, allowAnimation?: boolean): void;
}
export declare class TextDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class HtmlDirectiveHandler extends DirectiveHandler {
    constructor();
}
