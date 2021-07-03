import { IRegion, IParsedAnimation } from '../typedefs';
export interface ControlInfo {
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
    static Init(region: IRegion, element: HTMLElement, options: Array<string>, animate: boolean, onUninit: () => void, directiveName?: string): ControlInfo;
    static InsertItem(region: IRegion, info: ControlInfo, callback?: (itemInfo?: ControlItemInfo) => void, offset?: number): ControlItemInfo;
    static RemoveItem(itemInfo: ControlItemInfo, info: ControlInfo): void;
}
