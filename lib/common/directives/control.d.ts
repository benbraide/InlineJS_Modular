import { IRegion, IParsedAnimation, IDirective } from '../typedefs';
export interface ControlInfo {
    key: string;
    regionId: string;
    template: HTMLTemplateElement;
    parent: HTMLElement;
    blueprint: HTMLElement;
    animator: IParsedAnimation;
    subscriptions?: Record<string, Array<string>>;
}
export interface ControlOnLoadInfo {
    callback: () => void;
    once: boolean;
}
export interface ControlItemInfo {
    clone: HTMLElement;
    onLoadList: Array<ControlOnLoadInfo>;
}
export declare class ControlHelper {
    static Init(key: string, region: IRegion, element: HTMLElement, directive: IDirective, onUninit: () => void, animate?: boolean): ControlInfo;
    static InsertItem(region: IRegion, info: ControlInfo, callback?: (itemInfo?: ControlItemInfo) => void, offset?: number): ControlItemInfo;
    static RemoveItem(itemInfo: ControlItemInfo, info: ControlInfo): void;
}
