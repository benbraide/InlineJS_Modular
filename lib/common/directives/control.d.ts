import { IRegion, IParsedAnimation, IDirective, IElementScope } from '../typedefs';
export interface ControlInfo {
    key: string;
    regionId: string;
    template: HTMLTemplateElement;
    parent: HTMLElement;
    blueprint: HTMLElement;
    animator: IParsedAnimation;
    subscriptions?: Record<string, Array<string>>;
    insertItem?: (myRegion?: IRegion, callback?: (scope?: IElementScope, itemInfo?: ControlItemInfo) => void) => ControlItemInfo;
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
    static GetConditionChange(scope: IElementScope, callback?: (alertChange?: (value: boolean) => void, list?: Array<(isTrue: boolean) => void>) => void): ((isTrue: boolean) => void)[];
}
