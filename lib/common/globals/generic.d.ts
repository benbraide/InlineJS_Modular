import { IGlobalHandler, IGlobalManager, IRegion } from '../typedefs';
import { Region } from '../region';
export declare class GlobalHandler implements IGlobalHandler {
    protected key_: string;
    private value_;
    private canHandle_?;
    private beforeAdd_?;
    private afterAdd_?;
    private afterRemove_?;
    protected static region_: Region;
    constructor(key_: string, value_: any, canHandle_?: (regionId?: string) => boolean, beforeAdd_?: (manager?: IGlobalManager) => boolean, afterAdd_?: (manager?: IGlobalManager) => void, afterRemove_?: (manager?: IGlobalManager) => void);
    GetKey(): string;
    BeforeAdd(manager: IGlobalManager): boolean;
    AfterAdd(manager: IGlobalManager): void;
    AfterRemove(manager: IGlobalManager): void;
    CanHandle(regionId: string): boolean;
    Handle(regionId: string, contextElement: HTMLElement): any;
}
interface ProxyInfo {
    element: HTMLElement;
    proxy: any;
}
export declare class ProxiedGlobalHandler extends GlobalHandler {
    protected proxies_: ProxyInfo[];
    constructor(key: string, value: any, canHandle?: (regionId?: string) => boolean, beforeAdd?: (manager?: IGlobalManager) => boolean, afterAdd?: (manager?: IGlobalManager) => void, afterRemove?: (manager?: IGlobalManager) => void);
    protected AddProxy(element: HTMLElement, proxy: any, region?: IRegion): any;
    protected RemoveProxy(element: HTMLElement): void;
    protected GetProxy(element: HTMLElement): any;
}
export {};
