import { IOutsideEventManager } from '../typedefs';
export declare class OutsideEventManager implements IOutsideEventManager {
    private targetScopes_;
    private eventCallbacks_;
    AddListener(target: HTMLElement, events: string | Array<string>, handler: (event?: Event) => void): void;
    RemoveListener(target: HTMLElement, events: string | Array<string>, handler?: (event?: Event) => void): void;
    AddExcept(target: HTMLElement, list: Record<string, Array<HTMLElement> | HTMLElement>, handler?: (event?: Event) => void): void;
    Unbind(target: HTMLElement): void;
}
