import { DirectiveHandler } from './generic';
import { ControlItemInfo } from './control';
export interface EachCloneInfo {
    key: string | number;
    itemInfo: ControlItemInfo;
}
export interface EachOptions {
    clones: Array<EachCloneInfo> | Record<string, EachCloneInfo>;
    items: Array<any> | Record<string, any> | number;
    itemsTarget: Array<any> | Record<string, any> | number;
    count: number;
    path: string;
    rangeValue: number;
}
export declare class EachDirectiveHandler extends DirectiveHandler {
    constructor();
}
