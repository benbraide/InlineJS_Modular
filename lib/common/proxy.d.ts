import { IRegion, IProxy, IChanges, INoResult, IValue } from './typedefs';
export declare class NoResult implements INoResult {
}
export declare class Value implements IValue {
    private callback_;
    constructor(callback_: () => any);
    Get(): any;
}
export declare class ProxyHelper {
    static regionFinder: (id: string) => IRegion;
    static CreateChildProxy(region: IRegion, owner: IProxy, name: string, target: any): IProxy | null;
    static ProxyGetter(target: object, prop: string, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => any): any;
    static AddChanges(changes: IChanges, type: 'set' | 'delete', path: string, prop: string): void;
    static ProxySetter(target: object, prop: string, value: any, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => boolean): boolean;
    static ProxyDeleter(target: object, prop: string, region: IRegion, parentPath: string, name: string, callback?: (region?: IRegion) => boolean): boolean;
}
export declare class RootProxy implements IProxy {
    private regionId_;
    private regionFinder_;
    private target_;
    private nativeProxy_;
    private proxies_;
    constructor(regionId_: string, regionFinder_: (id: string) => IRegion, target_: object);
    IsRoot(): boolean;
    GetRegionId(): string;
    GetTarget(): object;
    GetNativeProxy(): object;
    GetName(): string;
    GetPath(): string;
    GetParentPath(): string;
    AddChild(child: IProxy): void;
    RemoveChild(name: string): void;
    GetProxies(): Record<string, IProxy>;
    static Watch(region: IRegion, elementContext: HTMLElement | string, expression: string, callback: (value: any) => boolean, skipFirst: boolean): void;
}
export declare class ChildProxy implements IProxy {
    private regionId_;
    private regionFinder_;
    private parentPath_;
    private name_;
    private target_;
    private nativeProxy_;
    private proxies_;
    constructor(regionId_: string, regionFinder_: (id: string) => IRegion, parentPath_: string, name_: string, target_: object);
    IsRoot(): boolean;
    GetRegionId(): string;
    GetTarget(): object;
    GetNativeProxy(): object;
    GetName(): string;
    GetPath(): string;
    GetParentPath(): string;
    AddChild(child: IProxy): void;
    RemoveChild(name: string): void;
    GetProxies(): Record<string, IProxy>;
}
