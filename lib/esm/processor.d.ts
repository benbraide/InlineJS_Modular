import { IProcessor, IProcessorOptions, IRegion, IDirective, DirectiveHandlerReturn, IDirectiveManager, IConfig } from './typedefs';
export declare class Processor implements IProcessor {
    private config_;
    private directiveManager_;
    constructor(config_: IConfig, directiveManager_: IDirectiveManager);
    All(region: IRegion, element: HTMLElement, options?: IProcessorOptions): void;
    One(region: IRegion, element: HTMLElement, options?: IProcessorOptions): DirectiveHandlerReturn;
    Pre(region: IRegion, element: HTMLElement): void;
    Post(region: IRegion, element: HTMLElement): void;
    PreOrPost(region: IRegion, element: HTMLElement, scopeKey: string, name: string): void;
    DispatchDirective(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    Check(element: HTMLElement, options: IProcessorOptions): boolean;
    TraverseDirectives(element: HTMLElement, callback: (directive: IDirective) => DirectiveHandlerReturn): DirectiveHandlerReturn;
    GetDirective(attribute: Attr): IDirective;
    GetDirectiveWith(name: string, value: string): IDirective;
    GetCamelCaseDirectiveName(name: string, ucfirst?: boolean): string;
}
