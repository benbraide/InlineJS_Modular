import { IPageGlobalHandler, IRouterGlobalHandler } from '../typedefs';
import { GlobalHandler } from './generic';
export declare class PageGlobalHandler extends GlobalHandler implements IPageGlobalHandler {
    private router_;
    private scopeId_;
    private proxy_;
    private observer_;
    private path_;
    private persistent_;
    private title_;
    private titleDOM_;
    private data_;
    private nextData_;
    private onLoad_;
    constructor(router_: IRouterGlobalHandler);
    SetNextPageData(data: Record<string, any>): void;
}
