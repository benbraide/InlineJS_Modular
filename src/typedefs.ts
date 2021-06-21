export interface IStack<T>{
    Push(value: T): void;
    Pop(): T;
    Peek(): T;
    IsEmpty(): boolean;
}

export interface INoResult{}

export interface IValue{
    Get(): any;
}

export interface IChange{
    regionId: string;
    type: 'set' | 'delete';
    path: string;
    prop: string;
    origin: any;
}

export interface IBubbledChange{
    original: IChange;
    path: string;
}

export type ChangeCallbackType = (changes?: Array<IChange | IBubbledChange>) => void | boolean;

export interface IChangeRefInfo{
    regionId: string;
    subscriptionId: string;
}

export interface ISubscriberInfo{
    path: string;
    callback: ChangeCallbackType;
}

export interface IGetAccessInfo{
    regionId: string;
    path: string;
}

export interface IGetAccessCheckpoint{
    optimized: number;
    raw: number;
}

export interface IGetAccessStorage{
    optimized: Array<IGetAccessInfo>;
    raw: Array<IGetAccessInfo>;
    checkpoint: IGetAccessCheckpoint;
}

export type GetAccessHookType = (regionId?: string, path?: string) => boolean;

export interface IChanges{
    GetRegionId(): string;
    Schedule(): void;
    Add(item: IChange | IBubbledChange): void;
    AddComposed(regionId: string, prop: string, prefix?: string, targetPath?: string): void;
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

export interface IState{
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

export interface ITrapInfo{
    stopped: boolean;
    callback: ChangeCallbackType;
}

export interface IDirectiveArg{
    key: string;
    options: Array<string>;
}

export interface IDirective{
    original: string;
    expanded: string;
    parts: Array<string>;
    raw: string;
    key: string;
    arg: IDirectiveArg;
    value: string;
}

export enum DirectiveHandlerReturn{
    Nil,
    Handled,
    Rejected,
    QuitAll,
}

export interface IDirectiveHandler{
    GetKey(): string;
    IsMount(): boolean;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
}

export interface IElementScope{
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
    intersectionObservers: Record<string, IntersectionObserver>;
    ifConditionChange: Array<(isTrue: boolean) => void>;
    trapInfoList: Array<ITrapInfo>;
    removed: boolean;
    preserve: boolean;
    preserveSubscriptions: boolean;
    paused: boolean;
    isRoot: boolean;
    controlCount: number;
}

export interface ILocalHandler{
    element: HTMLElement;
    callback: (element: HTMLElement, prop: string, bubble: boolean) => any;
}

export interface IProxy{
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

export interface IRootElement{}

export interface IProcessorOptions{
    checkTemplate?: boolean;
    checkDocument?: boolean;
}

export interface IProcessor{
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

export interface IEvaluator{
    Evaluate(regionId: string, elementContext: HTMLElement | string, expression: string, useWindow?: boolean, ignoreRemoved?: boolean, useBlock?: boolean): any;
    GetContextKey(): string;
    GetProxy(regionId: string, proxy: object): object;
    CreateProxy(proxy: object): object;
    RemoveProxyCache(regionId: string): void;
    GetScopeRegionIds(): IStack<string>;
}

export interface IConfig{
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

export interface IDirectiveManager{
    AddHandler(handler: IDirectiveHandler): void;
    RemoveHandler(handler: IDirectiveHandler): void;
    Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn;
    GetMountDirectiveName(): string;
}

export interface IGlobalHandler{
    GetKey(): string;
    BeforeAdd(manager?: IGlobalManager): boolean;
    AfterAdd(manager?: IGlobalManager): void;
    AfterRemove(manager?: IGlobalManager): void;
    CanHandle(regionId?: string): boolean;
    Handle(regionId?: string, contextElement?: HTMLElement): any;
}

export interface IGlobalManager{
    AddHandler(handler: IGlobalHandler): void;
    RemoveHandler(handler: IGlobalHandler): void;
    GetHandler(regionId: string, key: string): IGlobalHandler;
    Handle(regionId: string, contextElement: HTMLElement, key: string, noResultCreator?: () => INoResult): any;
}

export interface IOutsideEventManager{
    AddListener(target: HTMLElement, events: string | Array<string>, handler: (event?: Event) => void): void;
    RemoveListener(target: HTMLElement, events: string | Array<string>, handler?: (event?: Event) => void): void;
    AddExcept(target: HTMLElement, list: Record<string, Array<HTMLElement> | HTMLElement>, handler?: (event?: Event) => void): void;
    Unbind(target: HTMLElement): void;
}

export interface IAlertHandler{
    Alert(data: any): boolean | void;
    Confirm(data: any, confirmed: any, canceled?: any): void;
    Prompt(data: any, callback: (response: any) => void): void;
    ServerError(err: any): boolean | void;
}

export interface IRegion{
    SetOptimizedBindsState(value: boolean): void;
    IsOptimizedBinds(): boolean;
    SetDoneInit(): void;
    GetDoneInit(): boolean;
    GenerateScopeId(): string;
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
    GetDirectiveManager(): IDirectiveManager;
    GetGlobalManager(): IGlobalManager;
    GetOutsideEventManager(): IOutsideEventManager;
    SetAlertHandler(handler: IAlertHandler): IAlertHandler;
    GetAlertHandler(): IAlertHandler;
    Alert(data: any): boolean | void;
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
    GetLocal(element: HTMLElement | string, key: string, bubble?: boolean): any;
    AddLocalHandler(element: HTMLElement, callback: (element: HTMLElement, prop: string, bubble: boolean) => any): void;
    RemoveLocalHandler(element: HTMLElement): void;
    GetObserver(): MutationObserver;
    ExpandEvent(event: string, element: HTMLElement | string | true): string;
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

export interface IBootstrap{
    Attach(mount?: HTMLElement): void;
}

export type AnimatorCallbackType = (show: boolean, beforeCallback?: (show?: boolean) => void, afterCallback?: (show?: boolean) => void, args?: any) => void;
