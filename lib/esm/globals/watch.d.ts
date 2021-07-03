import { GlobalHandler } from './generic';
export declare class WatchHelper {
    static Watch(regionId: string, elementContext: HTMLElement | string, expression: string, callback: (value: any) => boolean, skipFirst: boolean): void;
}
export declare class WatchGlobalHandler extends GlobalHandler {
    constructor();
}
export declare class WhenGlobalHandler extends GlobalHandler {
    constructor();
}
export declare class OnceGlobalHandler extends GlobalHandler {
    constructor();
}
