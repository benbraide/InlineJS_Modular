import { IConfig } from './typedefs';
export declare class Config implements IConfig {
    private enableOptimizedBinds_;
    private directivePrefix_;
    private directiveRegex_;
    private keyMap_;
    private booleanAttributes_;
    constructor();
    SetDirectivePrefix(value: string): void;
    GetDirectivePrefix(): string;
    GetDirectiveRegex(): RegExp;
    GetDirectiveName(value: string, addDataPrefix?: boolean): string;
    AddKeyEventMap(key: string, target: string): void;
    RemoveKeyEventMap(key: string): void;
    MapKeyEvent(key: string): string;
    AddBooleanAttribute(name: string): void;
    RemoveBooleanAttribute(name: string): void;
    IsBooleanAttribute(name: string): boolean;
    SetOptimizedBindsState(enabled: boolean): void;
    IsOptimizedBinds(): boolean;
}
