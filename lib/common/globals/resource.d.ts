import { IResource, ResourceOptions, ResourceHandlerType, ResourceMixedItemInfo } from "../typedefs";
import { GlobalHandler } from "./generic";
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { Resource } from "../utilities/resource";
export declare class ResourceDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(resource: ResourceGlobalHandler);
}
export declare class ResourceGlobalHandler extends GlobalHandler implements IResource {
    private resource_;
    constructor();
    GetHandle(): Resource;
    ProcessUrl(url: string): string;
    GetStyle(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    GetScript(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    GetData(url: string | Array<string>, handler: ResourceHandlerType, concurrent?: boolean, json?: boolean): void;
    GetMixed(items: ResourceMixedItemInfo | string | Array<ResourceMixedItemInfo | string>, handler: ResourceHandlerType, concurrent?: boolean, attributes?: Record<string, string>): void;
    static BuildOptions(type: 'link' | 'script' | 'data', url: string, attributes?: Record<string, string>, json?: boolean): ResourceOptions;
}
