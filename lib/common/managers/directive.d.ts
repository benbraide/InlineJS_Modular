import { IDirectiveManager, IDirectiveHandler, IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs';
export declare class DirectiveManager implements IDirectiveManager {
    private isLocal_;
    private handlers_;
    private mountDirectiveNames_;
    constructor(isLocal_?: boolean);
    AddHandler(handler: IDirectiveHandler): void;
    RemoveHandler(handler: IDirectiveHandler): void;
    RemoveHandlerByKey(key: string): void;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    GetMountDirectiveName(): string;
    Expunge(element: HTMLElement): void;
}
