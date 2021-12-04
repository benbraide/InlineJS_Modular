import { IDirectiveHandler, IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs';
export declare class DirectiveHandler implements IDirectiveHandler {
    protected key_: string;
    private handler_;
    private isMount_;
    private dataStorage_;
    private dataStorageCounter_;
    constructor(key_: string, handler_: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn, isMount_?: boolean);
    GetKey(): string;
    IsMount(): boolean;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    Expunge(element: HTMLElement): void;
    protected AddStorage_(data: any, element?: HTMLElement): string;
    protected RemoveStorage_(key: string): void;
    static CreateProxy(getter: (prop: string) => any, contains: Array<string> | ((prop: string) => boolean), setter?: (prop: string | number | symbol, value: any, target?: object) => boolean, target?: any): any;
    static Evaluate(region: IRegion, element: HTMLElement, expression: string, useWindow?: boolean, ...args: any): any;
    static EvaluateAlways(region: IRegion, element: HTMLElement, expression: string, useWindow?: boolean, ...args: any): any;
    static BlockEvaluate(region: IRegion, element: HTMLElement, expression: string, useWindow?: boolean, ...args: any): any;
    static BlockEvaluateAlways(region: IRegion, element: HTMLElement, expression: string, useWindow?: boolean, ...args: any): any;
    static DoEvaluation(region: IRegion, element: HTMLElement, expression: string, useWindow: boolean, ignoreRemoved: boolean, useBlock: boolean, ...args: any): any;
    static Call(region: IRegion, callback: (...args: any) => any, ...args: any): any;
    static ExtractDuration(value: string, defaultValue: number): number;
    static ToString(value: any): string;
    static GetChildElementIndex(element: HTMLElement): number;
    static GetChildElementAt(region: IRegion, parent: HTMLElement, index: number, after?: HTMLElement): HTMLElement;
    static InsertOrAppendChildElement(region: IRegion, parent: HTMLElement, element: HTMLElement, index: number, after?: HTMLElement): void;
    static IsEventRequest(key: string): boolean;
    static CheckEvents(key: string, region: IRegion, element: HTMLElement, directive: IDirective, defaultEvent?: string, events?: Array<string>): DirectiveHandlerReturn;
}
