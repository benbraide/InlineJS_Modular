import { IRegion, IElementScope, IState, IProxy, IChanges, IChangeRefInfo, IEvaluator, IProcessor, IConfig, IDatabase, IDirectiveManager, IGlobalManager, IOutsideEventManager, IIntersectionObserverManager, IAlertHandler, IRootElement, IParsedAnimation, IAnimationParser, AnimationTargetType, IResizeObserver } from './typedefs';
export declare class Region implements IRegion {
    private rootElement_;
    private static components_;
    private static postProcessCallbacks_;
    private static forcedPostProcessCallbacks_;
    private static lastId_;
    private static lastSubId_;
    private static entries_;
    private static scopeRegionIds_;
    private static hooks_;
    private static evaluator_;
    private static config_;
    private static database_;
    private static directiveManager_;
    private static globalManager_;
    private static outsideEventManager_;
    private static alertHandler_;
    private static processor_;
    private static animationParser_;
    private static noAnimation_;
    private id_;
    private componentKey_;
    private doneInit_;
    private scopes_;
    private elementScopes_;
    private lastElementId_;
    private state_;
    private changes_;
    private rootProxy_;
    private proxies_;
    private refs_;
    private observer_;
    private intersectionObserverManager_;
    private resizeObserver_;
    private localHandlers_;
    private nextTickCallbacks_;
    private tempCallbacks_;
    private scopeId_;
    private directiveScopeId_;
    private tempCallbacksId_;
    private enableOptimizedBinds_;
    constructor(rootElement_: HTMLElement);
    SetOptimizedBindsState(value: boolean): void;
    IsOptimizedBinds(): boolean;
    SetDoneInit(): void;
    GetDoneInit(): boolean;
    GenerateScopeId(): string;
    GenerateDirectiveScopeId(prefix?: string, suffix?: string): string;
    GetId(): string;
    GetComponentKey(): string;
    AddScope(key: string, value: object): void;
    RemoveScope(key: string): void;
    GetScope(key: string): object;
    GetRootElement(): HTMLElement;
    GetElementWith(target: HTMLElement | true, callback: (resolvedTarget: HTMLElement) => boolean): HTMLElement;
    GetElementAncestor(target: HTMLElement | true, index: number): HTMLElement;
    GetElementScope(element: HTMLElement | string | true | IRootElement): IElementScope;
    GetElement(element: HTMLElement | string): HTMLElement;
    GetState(): IState;
    GetChanges(): IChanges;
    GetEvaluator(): IEvaluator;
    GetProcessor(): IProcessor;
    GetConfig(): IConfig;
    GetDatabase(createIfNotExists?: boolean): IDatabase;
    GetDirectiveManager(): IDirectiveManager;
    GetGlobalManager(): IGlobalManager;
    GetOutsideEventManager(): IOutsideEventManager;
    GetIntersectionObserverManager(): IIntersectionObserverManager;
    GetResizeObserver(): IResizeObserver;
    SetAlertHandler(handler: IAlertHandler): IAlertHandler;
    GetAlertHandler(): IAlertHandler;
    Alert(data: any): boolean | void;
    ParseAnimation(options: Array<string>, target?: AnimationTargetType, parse?: boolean): IParsedAnimation;
    GetRootProxy(): IProxy;
    FindProxy(path: string): IProxy;
    AddProxy(proxy: IProxy): void;
    RemoveProxy(path: string): void;
    AddRef(key: string, element: HTMLElement): void;
    GetRefs(): Record<string, HTMLElement>;
    AddElement(element: HTMLElement, check?: boolean): IElementScope;
    RemoveElement(element: HTMLElement | string, preserve?: boolean): void;
    MarkElementAsRemoved(element: HTMLElement | string): void;
    ElementIsRemoved(element: HTMLElement | string): boolean;
    ElementIsContained(element: HTMLElement | string, checkDocument?: boolean): boolean;
    ElementExists(element: HTMLElement | string): boolean;
    AddNextTickCallback(callback: () => void): void;
    ExecuteNextTick(): void;
    AddLocal(element: HTMLElement | string, key: string, value: any): void;
    GetLocal(element: HTMLElement | string, key: string, bubble?: boolean, useNull?: boolean): any;
    AddLocalHandler(element: HTMLElement, callback: (element: HTMLElement, prop: string, bubble: boolean, useNull?: boolean) => any): void;
    RemoveLocalHandler(element: HTMLElement): void;
    GetObserver(): MutationObserver;
    ExpandEvent(event: string, element: HTMLElement | string | true): string;
    ForwardEventBinding(element: HTMLElement, directiveValue: string, directiveOptions: Array<string>, event: string): import("./typedefs").DirectiveHandlerReturn;
    Call(target: (...args: any) => any, ...args: any): any;
    AddTemp(callback: () => any): string;
    CallTemp(key: string): any;
    AddComponent(element: HTMLElement, key: string): boolean;
    Get(id: string): IRegion;
    GetCurrent(id: string): IRegion;
    Infer(element: HTMLElement | string): IRegion;
    Find(key: string, getNativeProxy: false): IRegion;
    Find(key: string, getNativeProxy: true): any;
    PushPostProcessCallback(): void;
    PopPostProcessCallback(): void;
    AddPostProcessCallback(callback: () => void): void;
    TraversePostProcessCallbacks(handler: (callback: () => void) => void): void;
    ExecutePostProcessCallbacks(pop?: boolean): void;
    IsObject(target: any): boolean;
    IsEqual(first: any, second: any): boolean;
    DeepCopy(target: any): any;
    UnsubscribeAll(list: Array<IChangeRefInfo>): void;
    GetElementKeyName(): string;
    static GetEntries(): Record<string, IRegion>;
    static GetEvaluator(): IEvaluator;
    static GetProcessor(): IProcessor;
    static GetConfig(): IConfig;
    static GetDatabase(createIfNotExists?: boolean): IDatabase;
    static GetDirectiveManager(): IDirectiveManager;
    static GetGlobalManager(): IGlobalManager;
    static SetAlertHandler(handler: IAlertHandler): IAlertHandler;
    static GetAlertHandler(): IAlertHandler;
    static Alert(data: any): boolean | void;
    static SetAnimationParser(parser: IAnimationParser): void;
    static GetAnimationParser(): IAnimationParser;
    static ParseAnimation(options: Array<string>, target?: AnimationTargetType, parse?: boolean): IParsedAnimation;
    static Get(id: string): IRegion;
    static GetCurrent(id: string): IRegion;
    static Infer(element: HTMLElement | string): IRegion;
    static RemoveElement(element: HTMLElement, preserve?: boolean): void;
    static Find(key: string, getNativeProxy: false): IRegion;
    static Find(key: string, getNativeProxy: true): any;
    static PushPostProcessCallback(): void;
    static PopPostProcessCallback(): void;
    static AddPostProcessCallback(callback: () => void, forced?: boolean): void;
    static TraversePostProcessCallbacks(handler: (callback: () => void) => void): void;
    static ExecutePostProcessCallbacks(pop?: boolean): void;
    static IsObject(target: any): boolean;
    static IsEqual(first: any, second: any): boolean;
    static DeepCopy(target: any): any;
    static ToString(value: any): string;
    static CreateProxy(getter: (prop: string) => any, contains: Array<string> | ((prop: string) => boolean), setter?: (target: object, prop: string | number | symbol, value: any) => boolean, target?: any): any;
    static UnsubscribeAll(list: Array<IChangeRefInfo>): void;
    static InsertHtml(target: HTMLElement, value: string, replace?: boolean, append?: boolean, region?: IRegion): void;
    static GetElementKeyName(): string;
}
