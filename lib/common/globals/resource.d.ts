import { GlobalHandler } from "./generic";
export declare type ResourceHandlerType = (data?: any) => void;
interface ResourceOptions {
    type: 'link' | 'script' | 'data';
    attribute: 'href' | 'src' | 'json' | 'text';
    target: 'head' | 'body' | null;
    path: string;
    additionalAttributes?: Record<string, string>;
}
export interface MixedItemInfo {
    type: 'link' | 'script';
    url: string;
}
export declare class ResourceGlobalHandler extends GlobalHandler {
    private origin_;
    private absoluteUrlTest_;
    private loadMap_;
    constructor();
    Get_(info: ResourceOptions | Array<ResourceOptions>, handler: ResourceHandlerType, concurrent?: boolean): void;
    ProcessUrl(url: string): string;
    GetStyle(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    GetScript(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    GetMixed(items: MixedItemInfo | Array<MixedItemInfo>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, json?: boolean): void;
    static BuildOptions(type: 'link' | 'script' | 'data', url: string, attributes?: Record<string, string>, json?: boolean): ResourceOptions;
}
export {};
