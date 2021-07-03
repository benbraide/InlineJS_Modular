import {
    IRegion,
    IElementScope,
    IState,
    IProxy,
    IChanges,
    IChangeRefInfo,
    IEvaluator,
    IProcessor,
    IConfig,
    IDirectiveManager,
    IGlobalManager,
    IOutsideEventManager,
    IIntersectionObserverManager,
    IAlertHandler,
    ILocalHandler,
    IRootElement,
    ITrapInfo,
    AnimationBindInfo,
    IParsedAnimation,
    IAnimationParser,
} from './typedefs'

import { Stack } from './stack'
import { State } from './state'
import { Changes } from './changes'
import { Evaluator } from './evaluator'
import { Config } from './config'
import { Processor } from './processor'
import { DirectiveManager } from './managers/directive'
import { GlobalManager } from './managers/global'
import { OutsideEventManager } from './managers/outside_event'
import { IntersectionObserverManager } from './managers/observers/intersection'
import { RootProxy, NoResult } from './proxy'

class NoAnimation implements IParsedAnimation{
    public Run(show: boolean, target?: HTMLElement | ((fraction: number) => void), afterHandler?: (isCanceled?: boolean, show?: boolean) => void, beforeHandler?: (show?: boolean) => void): void{
        if (beforeHandler){
            beforeHandler(show);
        }

        if (target && typeof target === 'function'){
            target(show ? 1 : 0);
        }
        
        if (afterHandler){
            afterHandler(false, show);
        }
    }

    public Cancel(show: boolean, target?: HTMLElement | ((fraction: number) => void)): void{}

    public Bind(show: boolean, target?: HTMLElement | ((fraction: number) => void)): AnimationBindInfo{
        return null;
    }
}

export class Region implements IRegion{
    private static components_: Record<string, string> = {};
    private static postProcessCallbacks_ = new Stack<Array<() => void>>();

    private static lastId_ = 0;
    private static lastSubId_: number = null;
    
    private static entries_: Record<string, IRegion> = {};
    private static scopeRegionIds_ = new Stack<string>();
    private static hooks_ = new Array<(region: IRegion, added: boolean) => void>();

    private static evaluator_ = new Evaluator(Region.Get, Region.GetElementKeyName(), Region.scopeRegionIds_);
    private static config_ = new Config();
    private static directiveManager_ = new DirectiveManager();
    private static globalManager_ = new GlobalManager(Region.Get, Region.Infer);
    private static outsideEventManager_ = new OutsideEventManager();
    private static alertHandler_: IAlertHandler = null;

    private static processor_ = new Processor(Region.config_, Region.directiveManager_);
    private static animationParser_: IAnimationParser = null;
    private static noAnimation_ = new NoAnimation();
    
    private id_: string = null;
    private componentKey_ = '';
    private doneInit_ = false;
    private scopes_: Record<string, object> = {};
    private elementScopes_: Record<string, IElementScope> = {};
    private lastElementId_: number = null;
    private state_: IState;
    private changes_: IChanges;
    private rootProxy_: IProxy = null;
    private proxies_: Record<string, IProxy> = {};
    private refs_: Record<string, HTMLElement> = {};
    private observer_: MutationObserver = null;
    private intersectionObserverManager_: IIntersectionObserverManager = null;
    private localHandlers_ = new Array<ILocalHandler>();
    private nextTickCallbacks_ = new Array<() => void>();
    private tempCallbacks_: Record<string, () => any> = {};
    private scopeId_ = 0;
    private directiveScopeId_ = 0;
    private tempCallbacksId_ = 0;
    private enableOptimizedBinds_ = true;

    public constructor(private rootElement_: HTMLElement){
        let regionSubId: number;
        if (Region.lastSubId_ === null){
            regionSubId = (Region.lastSubId_ = 0);
        }
        else if (Region.lastSubId_ == (Number.MAX_SAFE_INTEGER || 9007199254740991)){//Roll over
            ++Region.lastId_;
            regionSubId = Region.lastSubId_ = 0;
        }
        else{
            regionSubId = ++Region.lastSubId_;
        }

        this.id_ = `rgn__${Region.lastId_}_${regionSubId}`;
        Region.entries_[this.id_] = this;
        
        this.rootProxy_ = new RootProxy(this.id_, Region.Get, {});
        this.state_ = new State(this.id_, Region.Get);
        this.changes_ = new Changes(this.id_, Region.Get, Region.GetCurrent);
        this.enableOptimizedBinds_ = Region.config_.IsOptimizedBinds();

        let id = this.id_;
        if (window.MutationObserver){
            this.observer_ = new window.MutationObserver((mutations) => {
                let region = Region.Get(id);
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList'){
                        mutation.removedNodes.forEach((node) => {
                            if (node instanceof HTMLElement){
                                region.RemoveElement(node);
                            }
                        });
    
                        mutation.addedNodes.forEach((node) => {
                            if (node instanceof HTMLElement){
                                Region.processor_.All(region, node, {
                                    checkTemplate: true,
                                    checkDocument: false,
                                });
                            }
                        });
                    }
                    else if (mutation.type === 'attributes'){
                        let directive = ((mutation.target as HTMLElement).hasAttribute(mutation.attributeName) ? Region.processor_.GetDirectiveWith(mutation.attributeName, (mutation.target as HTMLElement).getAttribute(mutation.attributeName)) : null);
                        if (!directive){
                            let scope = region.GetElementScope(mutation.target as HTMLElement);
                            if (scope){
                                scope.attributeChangeCallbacks.forEach(callback => callback(mutation.attributeName));
                            }
                        }
                        else{//Process directive
                            Region.processor_.DispatchDirective(region, (mutation.target as HTMLElement), directive);
                        }
                    }
                });
    
                Region.ExecutePostProcessCallbacks();
            });
        }

        Region.hooks_.forEach((hook) => {
            try{
                hook(this, true);
            }
            catch{}
        });
    }

    public SetOptimizedBindsState(value: boolean): void{
        this.enableOptimizedBinds_ = value;
    }

    public IsOptimizedBinds(): boolean{
        return this.enableOptimizedBinds_;
    }

    public SetDoneInit(){
        this.doneInit_ = true;
    }

    public GetDoneInit(){
        return this.doneInit_;
    }

    public GenerateScopeId(){
        return `${this.id_}_scope_${this.scopeId_++}`;
    }

    public GenerateDirectiveScopeId(prefix?: string, suffix?: string){
        return `${prefix || ''}${this.id_}_dirscope_${this.directiveScopeId_++}${suffix || ''}`;
    }

    public GetId(){
        return this.id_;
    }

    public GetComponentKey(){
        return this.componentKey_;
    }

    public AddScope(key: string, value: object): void{
        this.scopes_[key] = (value || {});
    }

    public RemoveScope(key: string): void{
        delete this.scopes_[key];
    }

    public GetScope(key: string): object{
        return ((key in this.scopes_) ? this.scopes_[key] : null);
    }

    public GetRootElement(){
        return this.rootElement_;
    }

    public GetElementWith(target: HTMLElement | true, callback: (resolvedTarget: HTMLElement) => boolean): HTMLElement{
        let resolvedTarget = ((target === true) ? this.state_.GetElementContext() : target);
        while (resolvedTarget){
            if (callback(resolvedTarget)){
                return resolvedTarget;
            }

            if (resolvedTarget === this.rootElement_){
                break;
            }

            resolvedTarget = resolvedTarget.parentElement;
        }

        return null;
    }

    public GetElementAncestor(target: HTMLElement | true, index: number): HTMLElement{
        let resolvedTarget = ((target === true) ? this.state_.GetElementContext() : target);
        if (!resolvedTarget || resolvedTarget === this.rootElement_){
            return null;
        }

        let ancestor = resolvedTarget;
        for (; 0 <= index && ancestor && ancestor !== this.rootElement_; --index){
            ancestor = ancestor.parentElement;
        }

        return ((0 <= index) ? null : ancestor);
    }

    public GetElementScope(element: HTMLElement | string | true | IRootElement): IElementScope{
        let key: string;
        if (typeof element === 'string'){
            key = element;
        }
        else if (element === true){
            key = this.state_.GetElementContext().getAttribute(Region.GetElementKeyName());
        }
        else if (!(element instanceof HTMLElement)){
            key = this.rootElement_.getAttribute(Region.GetElementKeyName());
        }
        else if (element){//HTMLElement
            key = element.getAttribute(Region.GetElementKeyName());
        }

        return ((key && key in this.elementScopes_) ? this.elementScopes_[key] : null);
    }

    public GetElement(element: HTMLElement | string){
        if (typeof element !== 'string'){
            return element;
        }

        let scope = this.GetElementScope(element);
        return (scope ? scope.element : null);
    }

    public GetState(){
        return this.state_;
    }

    public GetChanges(){
        return this.changes_;
    }

    public GetEvaluator(): IEvaluator{
        return Region.evaluator_;
    }

    public GetProcessor(): IProcessor{
        return Region.processor_;
    }

    public GetConfig(): IConfig{
        return Region.config_;
    }

    public GetDirectiveManager(): IDirectiveManager{
        return Region.directiveManager_;
    }

    public GetGlobalManager(): IGlobalManager{
        return Region.globalManager_;
    }

    public GetOutsideEventManager(): IOutsideEventManager{
        return Region.outsideEventManager_;
    }

    public GetIntersectionObserverManager(): IIntersectionObserverManager{
        return (this.intersectionObserverManager_ = (this.intersectionObserverManager_ || new IntersectionObserverManager(this.id_)));
    }

    public SetAlertHandler(handler: IAlertHandler): IAlertHandler{
        return Region.SetAlertHandler(handler);
    }

    public GetAlertHandler(): IAlertHandler{
        return Region.alertHandler_;
    }

    public Alert(data: any): boolean | void{
        return Region.Alert(data);
    }

    public GetRootProxy(){
        if (this.componentKey_ && this.componentKey_ in Region.components_){
            let targetRegion = Region.Get(Region.components_[this.componentKey_]);
            return (targetRegion ? (targetRegion as Region).rootProxy_ : this.rootProxy_);
        }
        return this.rootProxy_;
    }

    public FindProxy(path: string): IProxy{
        if (path === this.rootProxy_.GetName()){
            return this.rootProxy_;
        }

        return ((path in this.proxies_) ? this.proxies_[path] : null);
    }

    public AddProxy(proxy: IProxy){
        this.proxies_[proxy.GetPath()] = proxy;
    }

    public RemoveProxy(path: string){
        delete this.proxies_[path];
    }

    public AddRef(key: string, element: HTMLElement){
        this.refs_[key] = element;
    }

    public GetRefs(){
        return this.refs_;
    }

    public AddElement(element: HTMLElement, check: boolean = true): IElementScope{
        if (check){//Check for existing
            let scope = this.GetElementScope(element);
            if (scope){
                return scope;
            }
        }

        if (!element || (element !== this.rootElement_ && !this.rootElement_.contains(element))){
            return null;
        }

        let id: number;
        if (this.lastElementId_ === null){
            id = (this.lastElementId_ = 0);
        }
        else{
            id = ++this.lastElementId_;
        }

        let key = `${this.id_}.${id}`;
        (this.elementScopes_[key] as IElementScope) = {
            key: key,
            element: element,
            locals: {},
            uninitCallbacks: new Array<() => void>(),
            changeRefs: new Array<IChangeRefInfo>(),
            directiveManager: null,
            preProcessCallbacks: new Array<() => void>(),
            postProcessCallbacks: new Array<() => void>(),
            eventExpansionCallbacks: new Array<(event: string) => string | null>(),
            attributeChangeCallbacks: new Array<(name: string) => void>(),
            ifConditionChange: null,
            trapInfoList: new Array<ITrapInfo>(),
            removed: false,
            preserve: false,
            preserveSubscriptions: false,
            paused: false,
            isRoot: false,
            controlCount: 0,
        };

        element.setAttribute(Region.GetElementKeyName(), key);
        return this.elementScopes_[key];
    }
    
    public RemoveElement(element: HTMLElement | string, preserve = false): void{
        let scope = this.GetElementScope(element);
        if (scope){
            if (scope.paused){//Paused removal
                scope.paused = false;
                return;
            }
            
            scope.uninitCallbacks.splice(0).forEach((callback) => {
                try{
                    callback();
                }
                catch (err){
                    this.state_.ReportError(err, `InlineJs.Region<${this.id_}>.$uninit`);
                }
            });

            if (!preserve && !scope.preserve){
                Region.directiveManager_.Expunge(scope.element);
                if (this.intersectionObserverManager_){
                    this.intersectionObserverManager_.RemoveAll(scope.element);
                }
                
                if (!scope.preserveSubscriptions){
                    Region.UnsubscribeAll(scope.changeRefs);

                    scope.changeRefs = [];
                    scope.element.removeAttribute(Region.GetElementKeyName());
                }
            }
            else{
                scope.preserve = !(preserve = true);
            }
            
            Array.from(scope.element.children).forEach(child => this.RemoveElement((child as HTMLElement), preserve));
            if (!preserve){//Delete scope
                scope.trapInfoList.forEach((info) => {
                    if (!info.stopped){
                        info.stopped = true;
                        info.callback([]);
                    }
                });

                delete this.elementScopes_[scope.key];
            }
        }
        else if (typeof element !== 'string'){
            Array.from(element.children).forEach(child => this.RemoveElement((child as HTMLElement), preserve));
        }
        
        if (!preserve && element === this.rootElement_){//Remove from map
            Region.hooks_.forEach((hook) => {
                try{
                    hook(this, false);
                }
                catch{}
            });

            this.AddNextTickCallback(() => {//Wait for changes to finalize
                Region.evaluator_.RemoveProxyCache(this.id_);
                if (this.componentKey_ && this.componentKey_ in Region.components_){
                    delete Region.components_[this.componentKey_];
                }

                delete Region.entries_[this.id_];
            });
        }
    }

    public MarkElementAsRemoved(element: HTMLElement | string): void{
        let scope = this.GetElementScope(element);
        if (scope){
            scope.removed = true;
        }
    }

    public ElementIsRemoved(element: HTMLElement | string): boolean{
        let scope = this.GetElementScope(element);
        return (scope && scope.removed);
    }

    public ElementIsContained(element: HTMLElement | string, checkDocument = true): boolean{
        if (typeof element === 'string'){
            return (element && element in this.elementScopes_);
        }
        
        if (!element || (checkDocument && !document.contains(element))){
            return false;
        }
        
        let key = element.getAttribute(Region.GetElementKeyName());
        return ((key && key in this.elementScopes_) || this.ElementIsContained(element, false));
    }
    
    public ElementExists(element: HTMLElement | string): boolean{
        let scope = this.GetElementScope(element);
        return (scope && !scope.removed);
    }

    public AddNextTickCallback(callback: () => void){
        this.nextTickCallbacks_.push(callback);
        this.changes_.Schedule();
    }

    public ExecuteNextTick(){
        if (this.nextTickCallbacks_.length == 0){
            return;
        }

        let callbacks = this.nextTickCallbacks_;
        let proxy = this.rootProxy_.GetNativeProxy();

        this.nextTickCallbacks_ = new Array<() => void>();
        callbacks.forEach((callback) => {
            try{
                callback.call(proxy);
            }
            catch (err){
                this.state_.ReportError(err, `InlineJs.Region<${this.id_}>.$nextTick`);
            }
        });
    }

    public AddLocal(element: HTMLElement | string, key: string, value: any){
        let scope = ((typeof element === 'string') ? this.GetElementScope(element) : this.AddElement(element, true));
        if (scope){
            scope.locals = (scope.locals || {});
            scope.locals[key] = value;
        }
    }

    public GetLocal(element: HTMLElement | string, key: string, bubble: boolean = true, useNull = false): any{
        if (typeof element !== 'string'){
            for (let i = 0; i < this.localHandlers_.length; ++i){
                if (this.localHandlers_[i].element === element){
                    return this.localHandlers_[i].callback(element, key, bubble, useNull);
                }
            }
        }
        
        let scope = this.GetElementScope(element);
        if (scope && key in scope.locals){
            return scope.locals[key];
        }

        if (!bubble || typeof element === 'string'){
            return (useNull ? null : new NoResult());
        }
        
        for (let ancestor = this.GetElementAncestor(element, 0); ancestor; ancestor = this.GetElementAncestor(ancestor, 0)){
            scope = this.GetElementScope(ancestor);
            if (scope && key in scope.locals){
                return scope.locals[key];
            }
        }

        return (useNull ? null : new NoResult());
    }

    public AddLocalHandler(element: HTMLElement, callback: (element: HTMLElement, prop: string, bubble: boolean, useNull?: boolean) => any){
        this.localHandlers_.push({
            element: element,
            callback: callback
        });
    }

    public RemoveLocalHandler(element: HTMLElement){
        this.localHandlers_ = this.localHandlers_.filter(info => (info.element !== element));
    }

    public GetObserver(){
        return this.observer_;
    }

    public ExpandEvent(event: string, element: HTMLElement | string | true){
        let scope = this.GetElementScope(element);
        if (!scope){
            return event;
        }

        for (let i = 0; i < scope.eventExpansionCallbacks.length; ++i){
            let expanded = scope.eventExpansionCallbacks[i](event);
            if (expanded !== null){
                return expanded;
            }
        }
        
        return event;
    }

    public ForwardEventBinding(element: HTMLElement, directiveValue: string, directiveOptions: Array<string>, event: string){
        return Region.directiveManager_.Handle(this, element, {
            original: 'x-on',
            expanded: 'x-on',
            parts: ['on'],
            raw: 'on',
            key: 'on',
            arg: {
                key: event,
                options: directiveOptions,
            },
            value: directiveValue,
        });
    }

    public Call(target: (...args: any) => any, ...args: any){
        return ((target.name in this.rootProxy_.GetTarget()) ? target.call(this.rootProxy_.GetNativeProxy(), ...args) : target(...args));
    }

    public AddTemp(callback: () => any){
        let key = `Region<${this.id_}>.temp<${++this.tempCallbacksId_}>`;
        this.tempCallbacks_[key] = callback;
        return key;
    }

    public CallTemp(key: string){
        if (!(key in this.tempCallbacks_)){
            return null;
        }

        let callback = (this.tempCallbacks_[key] as () => any);
        delete this.tempCallbacks_[key];

        return callback();
    }

    public AddComponent(element: HTMLElement, key: string): boolean{
        if (!key || this.rootElement_ !== element || this.componentKey_){
            return false;
        }

        this.componentKey_ = key;
        if (!(key in  Region.components_)){
            Region.components_[key] = this.id_;
        }
        
        return true;
    }

    public Get(id: string): IRegion{
        return Region.Get(id);
    }

    public GetCurrent(id: string): IRegion{
        return Region.GetCurrent(id);
    }

    public Infer(element: HTMLElement | string): IRegion{
        return Region.Infer(element);
    }

    public Find(key: string, getNativeProxy: false): IRegion;
    public Find(key: string, getNativeProxy: true): any;
    public Find(key: string, getNativeProxy: boolean): any{
        return (getNativeProxy ? Region.Find(key, true) : Region.Find(key, false));
    }

    public PushPostProcessCallback(): void{
        Region.PushPostProcessCallback();
    }

    public PopPostProcessCallback(): void{
        Region.PopPostProcessCallback();
    }

    public AddPostProcessCallback(callback: () => void): void{
        Region.AddPostProcessCallback(callback);
    }

    public TraversePostProcessCallbacks(handler: (callback: () => void) => void): void{
        Region.TraversePostProcessCallbacks(handler);
    }

    public ExecutePostProcessCallbacks(pop = true): void{
        Region.ExecutePostProcessCallbacks(pop);
    }

    public IsObject(target: any): boolean{
        return Region.IsObject(target);
    }

    public IsEqual(first: any, second: any): boolean{
        return Region.IsEqual(first, second);
    }

    public DeepCopy(target: any): any{
        return Region.DeepCopy(target);
    }

    public UnsubscribeAll(list: Array<IChangeRefInfo>): void{
        Region.UnsubscribeAll(list);
    }

    public GetElementKeyName(): string{
        return Region.GetElementKeyName();
    }

    public static GetEntries(){
        return Region.entries_;
    }

    public static GetEvaluator(): IEvaluator{
        return Region.evaluator_;
    }

    public static GetProcessor(): IProcessor{
        return Region.processor_;
    }

    public static GetConfig(): IConfig{
        return Region.config_;
    }

    public static GetDirectiveManager(): IDirectiveManager{
        return Region.directiveManager_;
    }

    public static GetGlobalManager(): IGlobalManager{
        return Region.globalManager_;
    }

    public static SetAlertHandler(handler: IAlertHandler): IAlertHandler{
        let oldHandler = Region.alertHandler_;
        Region.alertHandler_ = handler;
        return oldHandler;
    }

    public static GetAlertHandler(): IAlertHandler{
        return Region.alertHandler_;
    }

    public static Alert(data: any): boolean | void{
        return (Region.alertHandler_ ? Region.alertHandler_.Alert(data) : false);
    }

    public static SetAnimationParser(parser: IAnimationParser){
        Region.animationParser_ = parser;
    }

    public static GetAnimationParser(){
        return Region.animationParser_;
    }
    
    public static ParseAnimation(options: Array<string>, target?: HTMLElement | ((fraction: number) => void), parse = true): IParsedAnimation{
        return ((Region.animationParser_ && parse) ? Region.animationParser_.Parse(options, target) : Region.noAnimation_);
    }

    public static Get(id: string): IRegion{
        return ((id && id in Region.entries_) ? Region.entries_[id] : null);
    }

    public static GetCurrent(id: string): IRegion{
        return Region.Get(Region.scopeRegionIds_.Peek() || id);
    }

    public static Infer(element: HTMLElement | string): IRegion{
        if (!element){
            return null;
        }
        
        let key = ((typeof element === 'string') ? element : element.getAttribute(Region.GetElementKeyName()));
        if (!key){
            return null;
        }

        return Region.Get(key.split('.')[0]);
    }

    public static RemoveElement(element: HTMLElement, preserve = false){
        let region = Region.Infer(element);
        if (!region){
            Array.from(element.children).forEach(child => Region.RemoveElement((child as HTMLElement)));
        }
        else{
            region.RemoveElement(element, preserve);
        }
    }

    public static Find(key: string, getNativeProxy: false): IRegion;
    public static Find(key: string, getNativeProxy: true): any;
    public static Find(key: string, getNativeProxy: boolean): any{
        if (!key || !(key in Region.components_)){
            return null;
        }
        
        let region = Region.Get(Region.components_[key]);
        return (region ? (getNativeProxy ? (region as Region).rootProxy_.GetNativeProxy() : region) : null);
    }

    public static PushPostProcessCallback(){
        Region.postProcessCallbacks_.Push(new Array<() => void>());
    }

    public static PopPostProcessCallback(){
        Region.postProcessCallbacks_.Pop();
    }

    public static AddPostProcessCallback(callback: () => void){
        let list = Region.postProcessCallbacks_.Peek();
        if (list){
            list.push(callback);
        }
    }

    public static TraversePostProcessCallbacks(handler: (callback: () => void) => void): void{
        let list = Region.postProcessCallbacks_.Peek();
        if (list){
            list.forEach(handler);
        }
    }

    public static ExecutePostProcessCallbacks(pop = true){
        let list = (pop ? Region.postProcessCallbacks_.Pop() : Region.postProcessCallbacks_.Peek());
        if (list){
            list.forEach((callback) => {
                try{
                    callback();
                }
                catch (err){
                    console.error(err, 'InlineJs.Region<NIL>.ExecutePostProcessCallbacks');
                }
            });
        }
    }

    public static IsObject(target: any){
        return (target && typeof target === 'object' && (('__InlineJS_Target__' in target) || (target.__proto__ && target.__proto__.constructor.name === 'Object')));
    }

    public static IsEqual(first: any, second: any): boolean{
        let firstIsObject = (first && typeof first === 'object'), secondIsObject = (second && typeof second === 'object');
        if (firstIsObject && '__InlineJS_Target__' in first){//Get underlying object
            first = first['__InlineJS_Target__'];
        }

        if (secondIsObject && '__InlineJS_Target__' in second){//Get underlying object
            second = second['__InlineJS_Target__'];
        }

        if (firstIsObject != secondIsObject){
            return false;
        }

        if (!firstIsObject){
            return (first == second);
        }

        if (Array.isArray(first)){
            if (!Array.isArray(second) || first.length != second.length){
                return false;
            }

            for (let i = 0; i < first.length; ++i){
                if (!Region.IsEqual(first[i], second[i])){
                    return false;
                }
            }
            
            return true;
        }

        if (!Region.IsObject(first) || !Region.IsObject(second)){
            return (first === second);
        }

        if (Object.keys(first).length != Object.keys(second).length){
            return false;
        }

        for (let key in first){
            if (!(key in second) || !Region.IsEqual(first[key], second[key])){
                return false;
            }
        }

        return true;
    }

    public static DeepCopy(target: any): any{
        let isObject = (target && typeof target === 'object');
        if (isObject && '__InlineJS_Target__' in target){//Get underlying object
            target = target['__InlineJS_Target__'];
        }
        
        if (!isObject){
            return target;
        }

        if (Array.isArray(target)){
            let copy = [];
            target.forEach(item => copy.push(Region.DeepCopy(item)));
            return copy;
        }

        if (!Region.IsObject(target)){
            return target;
        }
        
        let copy = {};
        for (let key in target){
            copy[key] = Region.DeepCopy(target[key]);
        }
        
        return copy;
    }

    public static ToString(value: any): string{
        if (typeof value === 'string'){
            return value;
        }

        if (value === null || value === undefined){
            return '';
        }

        if (value === true){
            return 'true';
        }

        if (value === false){
            return 'false';
        }

        if (typeof value === 'object' && '__InlineJS_Target__' in value){
            return Region.ToString(value['__InlineJS_Target__']);
        }

        if (Region.IsObject(value) || Array.isArray(value)){
            return JSON.stringify(value);
        }

        return value.toString();
    }

    public static CreateProxy(getter: (prop: string) => any, contains: Array<string> | ((prop: string) => boolean), setter?: (target: object, prop: string | number | symbol, value: any) => boolean, target?: any){
        let hasTarget = !! target;
        let handler = {
            get(target: object, prop: string | number | symbol): any{
                if (typeof prop === 'symbol' || (typeof prop === 'string' && prop === 'prototype')){
                    return Reflect.get(target, prop);
                }

                return getter(prop.toString());
            },
            set(target: object, prop: string | number | symbol, value: any){
                if (hasTarget){
                    return (setter ? setter(target, prop, value) : Reflect.set(target, prop, value));    
                }

                return (setter && setter(target, prop, value));
            },
            deleteProperty(target: object, prop: string | number | symbol){
                return (hasTarget ? Reflect.deleteProperty(target, prop) : false);
            },
            has(target: object, prop: string | number | symbol){
                if (Reflect.has(target, prop)){
                    return true;
                }

                if (!contains){
                    return false;
                }

                return ((typeof contains === 'function') ? contains(prop.toString()) : contains.includes(prop.toString()));
            }
        };

        return new window.Proxy((target || {}), handler);
    }

    public static UnsubscribeAll(list: Array<IChangeRefInfo>){
        (list || []).forEach((info) => {
            let region = Region.Get(info.regionId);
            if (region){
                (region as Region).changes_.Unsubscribe(info.subscriptionId);
            }
        });
    }

    public static InsertHtml(target: HTMLElement, value: string, replace = true, append = true, region?: IRegion){
        if (replace){//Remove all child nodes
            Array.from(target.childNodes).forEach(child => target.removeChild(child));
        }
        
        let tmpl = document.createElement('template');
        tmpl.innerHTML = value;

        let childNodes = [...tmpl.content.childNodes].filter(child => !(child instanceof HTMLScriptElement));
        if (replace || append){
            target.append(...childNodes);
        }
        else{//Insert before child nodes
            target.prepend(...childNodes);
        }

        if (region && !region.GetDoneInit()){//Mutation observer not yet bound
            let scope = region.GetElementScope(target);
            if (scope){//Schedule processing
                scope.postProcessCallbacks.push(() => {
                    Region.processor_.All(region, target, {
                        checkDocument: true,
                    });
                });
            }
        }
    }

    public static GetElementKeyName(){
        return '__inlinejs_key__';
    }
}
