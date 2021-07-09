export interface IStack<T> {
    Push(value: T): void;
    Pop(): T;
    Peek(): T;
    IsEmpty(): boolean;
}
export interface INoResult {
}
export interface IValue {
    Get(): any;
}
export interface IChange {
    regionId: string;
    type: 'set' | 'delete';
    path: string;
    prop: string;
    origin: any;
}
export interface IBubbledChange {
    original: IChange;
    path: string;
}
export declare type ChangeCallbackType = (changes?: Array<IChange | IBubbledChange>) => void | boolean;
export interface IChangeRefInfo {
    regionId: string;
    subscriptionId: string;
}
export interface ISubscriberInfo {
    path: string;
    callback: ChangeCallbackType;
}
export interface IGetAccessInfo {
    regionId: string;
    path: string;
}
export interface IGetAccessCheckpoint {
    optimized: number;
    raw: number;
}
export interface IGetAccessStorage {
    optimized: Array<IGetAccessInfo>;
    raw: Array<IGetAccessInfo>;
    checkpoint: IGetAccessCheckpoint;
}
export declare type GetAccessHookType = (regionId?: string, path?: string) => boolean;
export interface IChanges {
    GetRegionId(): string;
    Schedule(): void;
    Add(item: IChange | IBubbledChange): void;
    AddComposed(prop: string, prefix?: string, targetPath?: string, regionId?: string): void;
    Subscribe(path: string, callback: ChangeCallbackType): string;
    Unsubscribe(id: string): void;
    AddGetAccess(path: string): void;
    ReplaceOptimizedGetAccesses(): void;
    FlushRawGetAccesses(): void;
    AddGetAccessesCheckpoint(): void;
    DiscardGetAccessesCheckpoint(): void;
    PushGetAccessStorage(storage: IGetAccessStorage): void;
    RetrieveGetAccessStorage(optimized: false): IGetAccessStorage;
    RetrieveGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    PopGetAccessStorage(optimized: false): IGetAccessStorage;
    PopGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    PushGetAccessHook(hook: GetAccessHookType): void;
    RetrieveGetAccessHook(): GetAccessHookType;
    PopGetAccessHook(): GetAccessHookType;
    PushOrigin(origin: ChangeCallbackType): void;
    GetOrigin(): ChangeCallbackType;
    PopOrigin(): ChangeCallbackType;
}
export interface IState {
    PushElementContext(element: HTMLElement): void;
    PopElementContext(): HTMLElement;
    GetElementContext(): HTMLElement;
    PushEventContext(Value: Event): void;
    PopEventContext(): Event;
    GetEventContext(): Event;
    TrapGetAccess(callback: ChangeCallbackType, changeCallback: ChangeCallbackType | true, elementContext: HTMLElement | string, staticCallback?: () => void): Record<string, Array<string>>;
    ReportError(value: any, ref?: any): void;
    Warn(value: any, ref?: any): void;
    Log(value: any, ref?: any): void;
}
export interface ITrapInfo {
    stopped: boolean;
    callback: ChangeCallbackType;
}
export interface IDirectiveArg {
    key: string;
    options: Array<string>;
}
export interface IDirective {
    original: string;
    expanded: string;
    parts: Array<string>;
    raw: string;
    key: string;
    arg: IDirectiveArg;
    value: string;
}
export declare enum DirectiveHandlerReturn {
    Nil = 0,
    Handled = 1,
    Rejected = 2,
    QuitAll = 3
}
export interface IDirectiveHandler {
    GetKey(): string;
    IsMount(): boolean;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    Expunge(element: HTMLElement): void;
}
export interface IElementScope {
    key: string;
    element: HTMLElement;
    locals: Record<string, any>;
    uninitCallbacks: Array<() => void>;
    changeRefs: Array<IChangeRefInfo>;
    directiveManager: IDirectiveManager;
    preProcessCallbacks: Array<() => void>;
    postProcessCallbacks: Array<() => void>;
    eventExpansionCallbacks: Array<(event: string) => string | null>;
    attributeChangeCallbacks: Array<(name: string) => void>;
    ifConditionChange: Array<(isTrue: boolean) => void>;
    trapInfoList: Array<ITrapInfo>;
    removed: boolean;
    preserve: boolean;
    preserveSubscriptions: boolean;
    paused: boolean;
    isRoot: boolean;
    controlCount: number;
}
export interface ILocalHandler {
    element: HTMLElement;
    callback: (element: HTMLElement, prop: string, bubble: boolean, useNull?: boolean) => any;
}
export interface IProxy {
    IsRoot: () => boolean;
    GetRegionId: () => string;
    GetTarget: () => object;
    GetNativeProxy: () => object;
    GetName: () => string;
    GetPath: () => string;
    GetParentPath: () => string;
    AddChild: (child: IProxy) => void;
    RemoveChild: (name: string) => void;
    GetProxies: () => Record<string, IProxy>;
}
export interface IRootElement {
}
export interface IProcessorOptions {
    checkTemplate?: boolean;
    checkDocument?: boolean;
}
export interface IProcessor {
    All(region: IRegion, element: HTMLElement, options?: IProcessorOptions): void;
    One(region: IRegion, element: HTMLElement, options?: IProcessorOptions): DirectiveHandlerReturn;
    Pre(region: IRegion, element: HTMLElement): void;
    Post(region: IRegion, element: HTMLElement): void;
    PreOrPost(region: IRegion, element: HTMLElement, scopeKey: string, name: string): void;
    DispatchDirective(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    Check(element: HTMLElement, options: IProcessorOptions): boolean;
    TraverseDirectives(element: HTMLElement, callback: (directive: IDirective) => DirectiveHandlerReturn): DirectiveHandlerReturn;
    GetDirective(attribute: Attr): IDirective;
    GetDirectiveWith(name: string, value: string): IDirective;
    GetCamelCaseDirectiveName(name: string, ucfirst?: boolean): string;
}
export interface IEvaluator {
    Evaluate(regionId: string, elementContext: HTMLElement | string, expression: string, useWindow?: boolean, ignoreRemoved?: boolean, useBlock?: boolean): any;
    GetContextKey(): string;
    GetProxy(regionId: string, proxy: object): object;
    CreateProxy(proxy: object): object;
    RemoveProxyCache(regionId: string): void;
    GetScopeRegionIds(): IStack<string>;
}
export interface IConfig {
    SetAppName(name: string): void;
    GetAppName(): string;
    SetDirectivePrefix(value: string): void;
    GetDirectivePrefix(): string;
    GetDirectiveRegex(): RegExp;
    GetDirectiveName(value: string, addDataPrefix?: boolean): string;
    AddKeyEventMap(key: string, target: string): void;
    RemoveKeyEventMap(key: string): void;
    MapKeyEvent(key: string): string;
    AddBooleanAttribute(name: string): void;
    RemoveBooleanAttribute(name: string): void;
    IsBooleanAttribute(name: string): boolean;
    SetOptimizedBindsState(enabled: boolean): void;
    IsOptimizedBinds(): boolean;
}
export interface IDirectiveManager {
    AddHandler(handler: IDirectiveHandler): void;
    RemoveHandler(handler: IDirectiveHandler): void;
    RemoveHandlerByKey(key: string): void;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    GetMountDirectiveName(): string;
    Expunge(element: HTMLElement): void;
}
export interface IGlobalHandler {
    GetKey(): string;
    BeforeAdd(manager?: IGlobalManager): boolean;
    AfterAdd(manager?: IGlobalManager): void;
    AfterRemove(manager?: IGlobalManager): void;
    CanHandle(regionId?: string): boolean;
    Handle(regionId?: string, contextElement?: HTMLElement): any;
}
export interface IGlobalManager {
    AddHandler(handler: IGlobalHandler): void;
    RemoveHandler(handler: IGlobalHandler): void;
    RemoveHandlerByKey(key: string): void;
    GetHandler(regionId: string, key: string): IGlobalHandler;
    Handle(regionId: string, contextElement: HTMLElement, key: string, noResultCreator?: () => INoResult): any;
}
export interface IOutsideEventManager {
    AddListener(target: HTMLElement, events: string | Array<string>, handler: (event?: Event) => void): void;
    RemoveListener(target: HTMLElement, events: string | Array<string>, handler?: (event?: Event) => void): void;
    AddExcept(target: HTMLElement, list: Record<string, Array<HTMLElement> | HTMLElement>, handler?: (event?: Event) => void): void;
    Unbind(target: HTMLElement): void;
}
export declare type IntersectionObserverHandlerType = (entry?: IntersectionObserverEntry, key?: string, observer?: globalThis.IntersectionObserver) => void;
export interface IIntersectionObserver {
    GetKey(): string;
    GetObserver(): IntersectionObserver;
    GetTarget(): HTMLElement;
    GetOptions(): IntersectionObserverInit;
    AddHandler(handler: IntersectionObserverHandlerType): void;
    RemoveHandler(handler: IntersectionObserverHandlerType): void;
    Start(handler?: IntersectionObserverHandlerType): void;
    Stop(): void;
}
export interface IIntersectionObserverManager {
    Add(target: HTMLElement, options: IntersectionObserverInit): IIntersectionObserver;
    Remove(observer: IIntersectionObserver): void;
    RemoveByKey(key: string, stop?: boolean): void;
    RemoveAll(target: HTMLElement, stop?: boolean): void;
}
export declare type ResizeObserverHandlerType = (entry?: ResizeObserverEntry, key?: string, observer?: IResizeObserver) => void;
export interface IResizeObserver {
    Bind(element: HTMLElement, handler: ResizeObserverHandlerType): string;
    Unbind(target: string | HTMLElement): void;
    GetObserver(): globalThis.ResizeObserver;
}
export interface IAlertHandler {
    Alert(data: any): void;
    Confirm(data: any, confirmed: () => void, canceled?: () => void): void;
    Prompt(data: any, callback: (response: any) => void): void;
    ServerError(err: any): void;
}
export interface IAnimationEase {
    GetKey(): string;
    Run(time: number, duration: number): number;
}
export interface IAnimationActor {
    GetKey(): string;
    Prepare(element: HTMLElement): void;
    Step(fraction: number, element: HTMLElement): void;
    GetPreferredEase(show?: boolean): IAnimationEase;
    GetPreferredDuration(show?: boolean): number;
}
export declare type AnimationHandlerType = (fraction: number, actors?: Array<IAnimationActor>) => void;
export declare type AnimationTargetType = HTMLElement | AnimationHandlerType;
export interface AnimationBindInfo {
    run: () => void;
    cancel: (graceful?: boolean) => void;
    addBeforeHandler: (handler: () => void) => void;
    removeBeforeHandler: (handler: () => void) => void;
    addAfterHandler: (handler: (isCanceled?: boolean) => void) => void;
    removeAfterHandler: (handler: (isCanceled?: boolean) => void) => void;
    getTarget: () => AnimationTargetType;
}
export interface IAnimation {
    Bind(target: AnimationTargetType): AnimationBindInfo;
}
export interface IParsedAnimation extends IAnimation {
    Run(show: boolean, target?: AnimationTargetType, afterHandler?: (isCanceled?: boolean, show?: boolean) => void, beforeHandler?: (show?: boolean) => void): void;
    Cancel(target?: AnimationTargetType): void;
    BindOne(show: boolean, target?: AnimationTargetType): AnimationBindInfo;
    AddBeforeHandler(handler: () => void): void;
    RemoveBeforeHandler(handler: () => void): void;
    AddAfterHandler(handler: (isCanceled?: boolean) => void): void;
    RemoveAfterHandler(handler: (isCanceled?: boolean) => void): void;
}
export interface IAnimationParser {
    AddEase(ease: IAnimationEase): void;
    RemoveEase(key: string): void;
    GetEase(key: string): IAnimationEase;
    AddActor(actor: IAnimationActor): void;
    RemoveActor(key: string): void;
    GetActor(key: string): IAnimationActor;
    Parse(options: Array<string>, target?: AnimationTargetType): IParsedAnimation;
}
export interface IDatabase {
    Read(key: string, successHandler?: (data: any) => void, errorHandler?: () => void): Promise<any>;
    Write(key: string, data: any, successHandler?: () => void, errorHandler?: () => void): Promise<void>;
}
export interface IRegion {
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
    AddLocalHandler(element: HTMLElement, callback: (element: HTMLElement, prop: string, bubble: boolean) => any): void;
    RemoveLocalHandler(element: HTMLElement): void;
    GetObserver(): MutationObserver;
    ExpandEvent(event: string, element: HTMLElement | string | true): string;
    ForwardEventBinding(element: HTMLElement, directiveValue: string, directiveOptions: Array<string>, event: string): DirectiveHandlerReturn;
    Call(target: (...args: any) => any, ...args: any): any;
    AddTemp(callback: () => any): string;
    CallTemp(key: string): any;
    AddComponent(element: HTMLElement, key: string): boolean;
    Get(id: string): IRegion;
    GetCurrent(id: string): IRegion;
    Infer(element: HTMLElement | string): IRegion;
    Find(key: string, getNativeProxy: false): IRegion;
    Find(key: string, getNativeProxy: true): any;
    Find(key: string, getNativeProxy: boolean): any;
    PushPostProcessCallback(): void;
    PopPostProcessCallback(): void;
    AddPostProcessCallback(callback: () => void): void;
    TraversePostProcessCallbacks(handler: (callback: () => void) => void): void;
    ExecutePostProcessCallbacks(pop?: boolean): void;
    IsObject(target: any): boolean;
    IsEqual(first: any, second: any): boolean;
    DeepCopy(target: any): any;
    GetElementKeyName(): string;
    UnsubscribeAll(list: Array<IChangeRefInfo>): void;
}
export interface IBootstrap {
    Attach(mount?: HTMLElement): void;
}
export interface IFetch {
    Reload(): void;
    SetProp(prop: string, value: any, force?: boolean): void;
    Get(region?: IRegion): Promise<any>;
    Watch(region?: IRegion, get?: boolean): void;
    EndWatch(): void;
}
export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface NamedDirection {
    x: 'up' | 'right' | 'down' | 'left' | 'none';
    y: 'up' | 'right' | 'down' | 'left' | 'none';
}
export interface PathInfo {
    base: string;
    query: string;
}
export interface ExtendedPathInfo {
    base: string;
    query: string;
    formattedQuery: Record<string, Array<string> | string>;
}
export declare type OnRouterLoadHandlerType = (path?: ExtendedPathInfo, reloaded?: boolean) => void;
export interface IBackPath {
}
export interface IRouterGlobalHandler {
    Goto(target: string | PathInfo | IBackPath, shouldReload?: boolean | (() => boolean)): void;
    Reload(): void;
    BindOnLoad(handler: OnRouterLoadHandlerType): void;
    UnbindOnLoad(handler: OnRouterLoadHandlerType): void;
    GetCurrentUrl(): string;
    GetCurrentQuery(key?: string): Record<string, Array<string> | string> | Array<string> | string;
    GetActivePage(): PathInfo;
}
export interface IPageGlobalHandler {
    SetNextPageData(data: Record<string, any>): void;
}
