import { IDirectiveHandler, IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { Value } from '../proxy'

interface DataStorageInfo{
    data: any;
    element?: HTMLElement;
}

type OptionsHandler1Type = ((option: string, index?: number, list?: Array<string>) => void | boolean);
type OptionsHandler2Type<T> = ((options: T, option: string, index?: number, list?: Array<string>) => void | boolean);
type OptionsHandlerType<T> = (OptionsHandler1Type | OptionsHandler2Type<T>);

export class DirectiveHandler implements IDirectiveHandler{
    private dataStorage_: Record<string, DataStorageInfo> = {};
    private dataStorageCounter_ = 0;
    
    public constructor(protected key_: string, private handler_: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn, private isMount_ = false){}
    
    public GetKey(): string{
        return this.key_;
    }

    public IsMount(): boolean{
        return this.isMount_;
    }

    public Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn{
        return this.handler_(region, element, directive);
    }

    public Expunge(element: HTMLElement): void{
        Object.keys(this.dataStorage_).forEach((key) => {
            if (this.dataStorage_[key].element === element){
                delete this.dataStorage_[key];
            }
        });
    }

    protected AddStorage_(data: any, element?: HTMLElement): string{
        let key = `${this.key_}.store.${this.dataStorageCounter_++}`;
        this.dataStorage_[key] = {
            data: data,
            element: element,
        };

        return key;
    }

    protected RemoveStorage_(key: string){
        delete this.dataStorage_[key];
    }

    public static CreateProxy(getter: (prop: string) => any, contains: Array<string> | ((prop: string) => boolean), setter?: (prop: string | number | symbol, value: any, target?: object) => boolean, target?: any){
        return Region.CreateProxy(getter, contains, setter, target);
    }

    public static Evaluate(region: IRegion, element: HTMLElement, expression: string, ctxName?: string, ctx?: any, useWindow = false): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, true, false, ctxName, ctx, useWindow);
    }

    public static EvaluateAlways(region: IRegion, element: HTMLElement, expression: string, ctxName?: string, ctx?: any, useWindow = false): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, false, false, ctxName, ctx, useWindow);
    }
    
    public static BlockEvaluate(region: IRegion, element: HTMLElement, expression: string, ctxName?: string, ctx?: any, useWindow = false): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, true, true, ctxName, ctx, useWindow);
    }

    public static BlockEvaluateAlways(region: IRegion, element: HTMLElement, expression: string, ctxName?: string, ctx?: any, useWindow = false): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, false, true, ctxName, ctx, useWindow);
    }
    
    public static DoEvaluation(region: IRegion, element: HTMLElement, expression: string, ignoreRemoved: boolean, useBlock: boolean, ctxName?: string, ctx?: any, useWindow = false): any{
        if (!region){
            return null;
        }
        
        let result: any;
        let evaluator = region.GetEvaluator(), state = region.GetState();
        
        evaluator.GetScopeRegionIds().Push(region.GetId());
        state.PushContext(state.ElementContextKey(), element);

        if (ctxName){//Push provided context
            state.PushContext(ctxName, ctx);
        }

        try{
            result = evaluator.Evaluate(region.GetId(), element, expression, useWindow, ignoreRemoved, useBlock);
            result = ((result instanceof Value) ? result.Get() : result);
        }
        catch (err){
            state.ReportError(err, `InlineJs.Region<${region.GetId()}>.CoreDirectiveHandlers.Evaluate(${expression})`);
        }
        finally{
            if (ctxName){//Pop provided context
                state.PopContext(ctxName);
            }
            state.PopContext(state.ElementContextKey());
            evaluator.GetScopeRegionIds().Pop();
        }
        
        return result;
    }

    public static Call(region: IRegion, callback: (...args: any) => any, ...args: any){
        try{
            return region.Call(callback, ...args);
        }
        catch (err){
            region.GetState().ReportError(err, 'CoreDirectiveHandlers.Call');
        }
    }

    public static ExtractDuration(value: string, defaultValue: number){
        const regex = /[0-9]+(s|ms)?/;
        if (!value || !value.match(regex)){
            return defaultValue;
        }

        if (value.indexOf('m') == -1 && value.indexOf('s') != -1){//Seconds
            return (parseInt(value) * 1000);
        }

        return parseInt(value);
    }

    public static ToString(value: any): string{
        return Region.ToString(value);
    }

    public static GetChildElementIndex(element: HTMLElement){
        if (!element.parentElement){
            return -1;
        }

        for (let i = 0; i < element.parentElement.children.length; ++i){
            if (element.parentElement.children[i] === element){
                return i;
            }
        }
        
        return -1;
    }

    public static GetChildElementAt(region: IRegion, parent: HTMLElement, index: number, after?: HTMLElement){
        let offset = 0;
        if (after){//Move past 'after' child
            for (let i = 0; i < parent.children.length; ++i){
                ++offset;
                if (parent.children[i] === after){
                    break;
                }
            }
        }

        let skipChildren = (children: HTMLCollection, startIndex: number, count: number) => {
            for (; (startIndex < children.length && 0 < count); ++startIndex, --count){
                let scope = region.GetElementScope((parent.children.item(startIndex) as HTMLElement));
                if (scope && scope.controlCount){//Skip
                    let currentSkip = skipChildren(parent.children, (startIndex + 1), scope.controlCount);
                    startIndex += currentSkip;
                }
            }

            return startIndex;
        };

        for (; (offset < parent.children.length && 0 < index); ++offset, --index){
            let scope = region.GetElementScope((parent.children.item(offset) as HTMLElement));
            if (scope && scope.controlCount){//Skip
                offset += skipChildren(parent.children, (offset + 1), scope.controlCount);
            }
        }
        
        return ((offset < parent.children.length) ? (parent.children.item(offset) as HTMLElement) : null);
    }

    public static InsertOrAppendChildElement(region: IRegion, parent: HTMLElement, element: HTMLElement, index: number, after?: HTMLElement){
        let sibling = DirectiveHandler.GetChildElementAt(region, parent, index, after);
        if (sibling){
            parent.insertBefore(element, sibling);
        }
        else{//Append
            parent.appendChild(element);
        }
    }

    public static GetOptions<T>(options: T, specifiedOptions: Array<string>, handler?: OptionsHandler1Type, needsOptions?: false): T;
    public static GetOptions<T>(options: T, specifiedOptions: Array<string>, handler?: OptionsHandler2Type<T>, needsOptions?: true): T;
    public static GetOptions<T>(options: T, specifiedOptions: Array<string>, handler?: OptionsHandlerType<T>, needsOptions: boolean = false){
        specifiedOptions.forEach((option, index, list) => {
            if ((!handler || (needsOptions ? !(<OptionsHandler2Type<T>>handler)(options, option, index, list) : !(<OptionsHandler1Type>handler)(option, index, list))) && option in options && typeof options[option] === 'boolean'){
                options[option] = true;
            }
        });

        return options;
    }
    
    public static IsEventRequest(key: string){
        const requestList = ['bind', 'event', 'on'];
        return requestList.includes(key);
    }

    public static CheckEvents(key: string, region: IRegion, element: HTMLElement, directive: IDirective, defaultEvent?: string, events?: Array<string>){
        const optionsWhitelist = ['outside', 'window', 'document', 'once', 'nexttick'];
        
        let options: Array<string> = null;
        if (defaultEvent && (directive.arg.key === defaultEvent || DirectiveHandler.IsEventRequest(directive.arg.key))){
            options = directive.arg.options.filter(option => !optionsWhitelist.includes(option));
            return region.ForwardEventBinding(element, directive.value, options, `${key}.${defaultEvent}`);
        }

        if (events && events.includes(directive.arg.key)){
            options = (options || directive.arg.options.filter(option => !optionsWhitelist.includes(option)));
            return region.ForwardEventBinding(element, directive.value, options, `${key}.${directive.arg.key}`);
        }

        return DirectiveHandlerReturn.Nil;
    }
}
