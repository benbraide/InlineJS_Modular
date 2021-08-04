import { IState, IRegion, ChangeCallbackType } from './typedefs';
export declare class State implements IState {
    private regionId_;
    private regionFinder_;
    private contexts_;
    constructor(regionId_: string, regionFinder_: (id: string) => IRegion);
    PushContext(key: string, value: any): void;
    PopContext(key: string): void;
    GetContext(key: string, noResult?: any): any;
    TrapGetAccess(callback: ChangeCallbackType, changeCallback: ChangeCallbackType | true, elementContext: HTMLElement | string, staticCallback?: () => void): Record<string, Array<string>>;
    ReportError(value: any, ref?: any): void;
    Warn(value: any, ref?: any): void;
    Log(value: any, ref?: any): void;
    ElementContextKey(): string;
    EventContextKey(): string;
    static ElementContextKey(): string;
    static EventContextKey(): string;
}
