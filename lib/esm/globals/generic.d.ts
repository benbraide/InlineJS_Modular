import { IGlobalHandler, IGlobalManager } from '../typedefs';
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
