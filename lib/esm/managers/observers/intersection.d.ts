import { IIntersectionObserverManager, IIntersectionObserver } from '../../typedefs';
export declare class IntersectionObserverManager implements IIntersectionObserverManager {
    private regionId_;
    private list_;
    private lastKeyCount_;
    constructor(regionId_: string);
    Add(target: HTMLElement, options: IntersectionObserverInit): IIntersectionObserver;
    Remove(observer: IIntersectionObserver): void;
    RemoveByKey(key: string, stop?: boolean): void;
    RemoveAll(target: HTMLElement, stop?: boolean): void;
}
