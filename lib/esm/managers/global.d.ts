import { IGlobalManager, IGlobalHandler, INoResult, IRegion } from '../typedefs';
export declare class GlobalManager implements IGlobalManager {
    private getRegion_;
    private inferRegion_;
    private handlers_;
    constructor(getRegion_: (id: string) => IRegion, inferRegion_: (element: HTMLElement | string) => IRegion);
    AddHandler(handler: IGlobalHandler): void;
    RemoveHandler(handler: IGlobalHandler): void;
    RemoveHandlerByKey(key: string): void;
    GetHandler(regionId: string, key: string): IGlobalHandler;
    Handle(regionId: string, contextElement: HTMLElement, key: string, noResultCreator?: () => INoResult): any;
}
