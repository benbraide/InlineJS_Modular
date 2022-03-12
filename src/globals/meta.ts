import { GlobalHandler, SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class NextTickGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('nextTick', (regionId: string) => (callback: () => void) => {
            let region = Region.Get(regionId);
            if (region){
                region.AddNextTickCallback(callback);
            }
        });
    }
}

export class PostGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('post', () => (callback: () => void) => {
            Region.AddPostProcessCallback(callback);
        });
    }
}

export class UseGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('use', (regionId: string) => (value: any) => {
            let region = Region.GetCurrent(regionId);
            if (region){
                region.GetChanges().ReplaceOptimizedGetAccesses();
            }

            return value;
        }, (regionId: string) => {
            let region = Region.GetCurrent(regionId);
            if (region){
                region.GetChanges().FlushRawGetAccesses();
            }

            return true;
        });
    }
}

export class StaticGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('static', (regionId: string) => (value: any) => {
            let region = Region.GetCurrent(regionId);
            if (region){
                region.GetChanges().DiscardGetAccessesCheckpoint();
            }

            return value;
        }, (regionId: string) => {
            let region = Region.GetCurrent(regionId);
            if (region){
                region.GetChanges().AddGetAccessesCheckpoint();
            }

            return true;
        });
    }
}

export class RawGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('raw', () => (value: any) => ((Region.IsObject(value) && '__InlineJS_Target__' in value) ? value.__InlineJS_Target__ : value));
    }
}

export class OrGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('or', () => OrGlobalHandler.Compute);
    }

    public static Compute(...values: any[]){
        return (values.find(value => !!value) || values[values.length - 1]);
    }
}

export class AndGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('and', () => AndGlobalHandler.Compute);
    }

    public static Compute(...values: any[]){
        let index = values.findIndex(value => !value);
        return ((index == -1) ? values[values.length - 1] : values[index]);
    }
}

export class ArithmeticGlobalHandler extends GlobalHandler{
    public constructor(){
        super('arithmetic', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'neg' || prop === 'negative'){
                    return (value: number) => -value;
                }

                if (prop === 'add' || prop === 'sum'){
                    return (...values: number[]) => values.reduce((acc, value) => (acc + value));
                }

                if (prop === 'sub' || prop === 'subtract'){
                    return (...values: number[]) => values.reduce((acc, value) => (acc - value));
                }

                if (prop === 'mult' || prop === 'multiply'){
                    return (...values: number[]) => values.reduce((acc, value) => (acc * value));
                }

                if (prop === 'div' || prop === 'divide'){
                    return (...values: number[]) => values.reduce((acc, value) => (acc / value));
                }
            }, ['neg', 'negative', 'add', 'sum', 'sub', 'subtract', 'mult', 'multiply', 'div', 'divide']);
        }, () => {
            this.proxy_ = null;
        });
    }
}

export class RelationalGlobalHandler extends GlobalHandler{
    public constructor(){
        super('relational', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'compare'){
                    return (first: number, second: number) => ((first < second) ? -1 : ((first == second) ? 0 : 1));
                }

                if (prop === 'less'){
                    return (first: number, second: number) => (first < second);
                }

                if (prop === 'lessOrEqual' || prop === 'lessOrEquals'){
                    return (first: number, second: number) => (first <= second);
                }

                if (prop === 'equal' || prop === 'equals'){
                    return (first: number, second: number) => (first == second);
                }

                if (prop === 'explicitlyEqual' || prop === 'explicitlyEquals'){
                    return (first: number, second: number) => (first === second);
                }

                if (prop === 'explicitlyNotEqual' || prop === 'explicitlyNotEquals'){
                    return (first: number, second: number) => (first !== second);
                }

                if (prop === 'notEqual' || prop === 'notEquals'){
                    return (first: number, second: number) => (first != second);
                }

                if (prop === 'greaterOrEqual' || prop === 'greaterOrEquals'){
                    return (first: number, second: number) => (first >= second);
                }

                if (prop === 'greater'){
                    return (first: number, second: number) => (first > second);
                }
            }, ['compare', 'less', 'lessOrEqual', 'lessOrEquals', 'equal', 'equals', 'explicitlyEqual', 'explicitlyEquals', 'explicitlyNotEqual', 'explicitlyNotEquals', 'notEqual', 'notEquals', 'greaterOrEqual', 'greaterOrEquals', 'greater']);
        }, () => {
            this.proxy_ = null;
        });
    }
}

export class LogicalGlobalHandler extends GlobalHandler{
    public constructor(){
        super('logical', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'not'){
                    return (value: boolean) => !value;
                }

                if (prop === 'or'){
                    return OrGlobalHandler.Compute;
                }

                if (prop === 'and'){
                    return AndGlobalHandler.Compute;
                }
            }, ['not', 'or', 'and']);
        }, () => {
            this.proxy_ = null;
        });
    }
}

export class ConditionalGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('conditional', () => (condition: boolean, trueValue: any, falseValue: any) => (condition ? trueValue : falseValue));
    }
}

export class EvaluateGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('evaluate', (regionId: string, contextElement: HTMLElement) => (value: string) => Region.GetEvaluator().Evaluate(regionId, contextElement, value));
    }
}

export class CallTempGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('__InlineJS_CallTemp__', (regionId: string) => (key: string) => Region.Get(regionId).CallTemp(key));
    }
}
