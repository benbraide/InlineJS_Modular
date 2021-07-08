import { IResizeObserver, ResizeObserverHandlerType } from "../typedefs";
export declare class ResizeObserver implements IResizeObserver {
    private regionId_;
    private observer_;
    private observes_;
    private binds_;
    private lastKeyCount_;
    constructor(regionId_: string);
    Bind(element: HTMLElement, handler: ResizeObserverHandlerType): string;
    Unbind(target: string | HTMLElement): void;
    GetObserver(): globalThis.ResizeObserver;
    private Observe_;
    private Unobserve_;
}
