import { IRouterGlobalHandler, OnRouterLoadHandlerType, PathInfo, IBackPath, IModalGlobalHandler } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
export interface PageOptions {
    path: string | RegExp;
    name?: string;
    title?: string;
    middleware?: string | Array<string>;
    onLoad?: (reloaded?: boolean) => void;
}
export interface PageInfo {
    id: number;
    path: string | RegExp;
    name: string;
    title: string;
    middlewares: Array<string>;
    onLoad: (reloaded?: boolean) => void;
}
export declare class BackPath implements IBackPath {
}
export interface IMiddleware {
    Handle(path?: PathInfo): void | boolean;
}
interface MountInfo {
    scopeId: string;
    type?: string;
    element?: HTMLElement;
    proxy?: any;
    fetch?: (url: string, callback: (state?: boolean) => void) => void;
}
export declare class RouterDirectiveHandler extends ExtendedDirectiveHandler {
    private fetch_;
    constructor(router: RouterGlobalHandler, mountInfo: MountInfo, modal?: IModalGlobalHandler);
}
export declare class RouterGlobalHandler extends GlobalHandler implements IRouterGlobalHandler {
    private middlewares_;
    private ajaxPrefix_;
    private scopeId_;
    private mountInfo_;
    private onEvent_;
    private origin_;
    private url_;
    private onLoadHandlers_;
    private active_;
    private entryCallbacks_;
    private lastPageId_;
    private pages_;
    private activePage_;
    private currentUrl_;
    private currentQuery_;
    private currentTitle_;
    constructor(middlewares_?: IMiddleware[], modal?: IModalGlobalHandler, ajaxPrefix_?: string, mountElementType?: string);
    Mount(): void;
    Register(page: PageOptions): number;
    Unregister(id: number): void;
    Goto(target: string | PathInfo | BackPath, shouldReload?: boolean | (() => boolean)): void;
    Reload(): void;
    BindOnLoad(handler: OnRouterLoadHandlerType): void;
    UnbindOnLoad(handler: OnRouterLoadHandlerType): void;
    GetCurrentUrl(): string;
    GetCurrentQuery(key?: string): Record<string, Array<string> | string> | Array<string> | string;
    GetActivePage(): PathInfo;
    ProcessUrl(url: string, includeAjaxPrefix?: boolean): string;
    ProcessQuery(query: string): string;
    BuildUrl(path: PathInfo, absolute?: boolean, process?: boolean, includeAjaxPrefix?: boolean): string;
    BuildPath(url: string): PathInfo;
    BuildQuery(query: string, shouldDecode?: boolean): Record<string, Array<string> | string>;
    private SetActiveState_;
    private Load_;
    private FindPage_;
}
export {};
