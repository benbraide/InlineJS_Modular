import { IDirectiveHandler, IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { Value } from '../proxy'

export class DirectiveHandler implements IDirectiveHandler{
    public constructor(private key_: string, private handler_: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn, private isMount_ = false){}
    
    public GetKey(): string{
        return this.key_;
    }

    public IsMount(): boolean{
        return this.isMount_;
    }

    public Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn{
        return this.handler_(region, element, directive);
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

    public static Evaluate(region: IRegion, element: HTMLElement, expression: string, useWindow = false, ...args: any): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, useWindow, true, false, ...args);
    }

    public static EvaluateAlways(region: IRegion, element: HTMLElement, expression: string, useWindow = false, ...args: any): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, useWindow, false, false, ...args);
    }
    
    public static BlockEvaluate(region: IRegion, element: HTMLElement, expression: string, useWindow = false, ...args: any): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, useWindow, true, true, ...args);
    }

    public static BlockEvaluateAlways(region: IRegion, element: HTMLElement, expression: string, useWindow = false, ...args: any): any{
        return DirectiveHandler.DoEvaluation(region, element, expression, useWindow, false, true, ...args);
    }
    
    public static DoEvaluation(region: IRegion, element: HTMLElement, expression: string, useWindow: boolean, ignoreRemoved: boolean, useBlock: boolean, ...args: any): any{
        if (!region){
            return null;
        }
        
        let result: any;
        let evaluator = region.GetEvaluator(), state = region.GetState();
        
        evaluator.GetScopeRegionIds().Push(region.GetId());
        state.PushElementContext(element);

        try{
            result = evaluator.Evaluate(region.GetId(), element, expression, useWindow, ignoreRemoved, useBlock);
            if (typeof result === 'function'){
                result = region.Call(result as (...values: any) => any, ...args);
            }

            result = ((result instanceof Value) ? result.Get() : result);
        }
        catch (err){
            state.ReportError(err, `InlineJs.Region<${region.GetId()}>.CoreDirectiveHandlers.Evaluate(${expression})`);
        }
        finally{
            state.PopElementContext();
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
            return DirectiveHandler.ToString(value['__InlineJS_Target__']);
        }

        if (Region.IsObject(value) || Array.isArray(value)){
            return JSON.stringify(value);
        }

        return value.toString();
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
}
