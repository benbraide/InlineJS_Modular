import { SimpleGlobalHandler } from './generic'
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
        super('or', () => (...values: any[]) => {
            let lastValue = undefined;
            for (let value of values){
                if (value){
                    return value;
                }

                lastValue = value;
            }

            return lastValue;
        });
    }
}

export class AndGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('and', () => (...values: boolean[]) => (values.findIndex(value => !value) == -1));
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
