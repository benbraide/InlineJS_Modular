import { IEvaluator, IRegion, IStack } from './typedefs';
export declare class Evaluator implements IEvaluator {
    private regionFinder_;
    private elementKeyName_;
    private scopeRegionIds_;
    private cachedProxy_;
    constructor(regionFinder_: (id: string) => IRegion, elementKeyName_: string, scopeRegionIds_: IStack<string>);
    Evaluate(regionId: string, elementContext: HTMLElement | string, expression: string, useWindow?: boolean, ignoreRemoved?: boolean, useBlock?: boolean): any;
    GetContextKey(): string;
    GetProxy(regionId: string, proxy: object): object;
    CreateProxy(proxy: object): {};
    RemoveProxyCache(regionId: string): void;
    GetScopeRegionIds(): IStack<string>;
}
