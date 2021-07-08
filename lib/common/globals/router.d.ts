import { IRouterGlobalHandler, OnRouterLoadHandlerType, IBackPath } from '../typedefs';
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
export interface PathInfo {
    base: string;
    query: string;
}
export declare class BackPath implements IBackPath {
}
export interface IMiddleware {
    Handle(path?: PathInfo): void | boolean;
}
export declare class RouterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(router: RouterGlobalHandler);
}
export declare class RegisterDirectiveHandler extends ExtendedDirectiveHandler {
    private router_;
    constructor(router_: RouterGlobalHandler);
}
export declare class LinkDirectiveHandler extends ExtendedDirectiveHandler {
    private router_;
    constructor(router_: RouterGlobalHandler);
}
export declare class BackDirectiveHandler extends ExtendedDirectiveHandler {
    private router_;
    constructor(router_: RouterGlobalHandler);
}
interface MountInfo {
    scopeId: string;
    type?: string;
    element?: HTMLElement;
    proxy?: any;
    fetch?: (url: string) => void;
    notFound?: (url: string) => void;
}
export declare class MountDirectiveHandler extends ExtendedDirectiveHandler {
    private router_;
    private info_;
    private fetch_;
    constructor(router_: RouterGlobalHandler, info_: MountInfo);
}
export declare class RouterGlobalHandler extends GlobalHandler implements IRouterGlobalHandler {
    private middlewares_;
    private ajaxPrefix_;
    private scopeId_;
    private proxy_;
    private mountInfo_;
    private onEvent_;
    private origin_;
    private url_;
    private onLoadHandlers_;
    private lastPageId_;
    private pages_;
    private activePage_;
    private currentUrl_;
    private currentQuery_;
    constructor(middlewares_?: IMiddleware[], ajaxPrefix_?: string, mountElementType?: string);
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
    private Load_;
    private FindPage_;
}
export {};
