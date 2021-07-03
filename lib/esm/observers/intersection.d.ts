import { IIntersectionObserver, IntersectionObserverHandlerType } from '../typedefs';
export declare class IntersectionObserver implements IIntersectionObserver {
    private key_;
    private target_;
    private options_;
    private observer_;
    private handlers_;
    private isObserving_;
    constructor(key_: string, target_: HTMLElement, options_: IntersectionObserverInit);
    GetKey(): string;
    GetObserver(): globalThis.IntersectionObserver;
    GetTarget(): HTMLElement;
    GetOptions(): IntersectionObserverInit;
    AddHandler(handler: IntersectionObserverHandlerType): void;
    RemoveHandler(handler: IntersectionObserverHandlerType): void;
    Start(handler?: IntersectionObserverHandlerType): void;
    Stop(): void;
    static BuildOptions(value: any): IntersectionObserverInit;
}
