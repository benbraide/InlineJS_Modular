import { IDirective, DirectiveHandlerReturn, IRegion } from '../../typedefs';
import { DirectiveHandler } from '../generic';
export declare class ExtendedDirectiveHandler extends DirectiveHandler {
    constructor(key: string, handler: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn);
    protected GenerateScopeId_(region: IRegion): string;
    static CheckEvents(key: string, region: IRegion, element: HTMLElement, directive: IDirective, defaultEvent?: string, events?: Array<string>): DirectiveHandlerReturn;
}
