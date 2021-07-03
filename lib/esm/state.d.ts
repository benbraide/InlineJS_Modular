import { IState, IRegion, ChangeCallbackType } from './typedefs';
export declare class State implements IState {
    private regionId_;
    private regionFinder_;
    private elementContext_;
    private eventContext_;
    constructor(regionId_: string, regionFinder_: (id: string) => IRegion);
    PushElementContext(element: HTMLElement): void;
    PopElementContext(): HTMLElement;
    GetElementContext(): HTMLElement;
    PushEventContext(Value: Event): void;
    PopEventContext(): Event;
    GetEventContext(): Event;
    TrapGetAccess(callback: ChangeCallbackType, changeCallback: ChangeCallbackType | true, elementContext: HTMLElement | string, staticCallback?: () => void): Record<string, Array<string>>;
    ReportError(value: any, ref?: any): void;
    Warn(value: any, ref?: any): void;
    Log(value: any, ref?: any): void;
}
