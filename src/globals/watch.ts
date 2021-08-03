import { SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class WatchHelper{
    public static Watch(regionId: string, elementContext: HTMLElement | string, expression: string, callback: (value: any) => boolean, skipFirst: boolean){
        let region = Region.Get(regionId);
        if (!region){
            return;
        }
        
        let previousValue: any;
        let onChange = () => {
            let value = Region.GetEvaluator().Evaluate(regionId, elementContext, expression);
            if (Region.IsEqual(value, previousValue)){
                return true;
            }

            previousValue = Region.DeepCopy(value);
            return callback(value);
        };

        region.GetState().TrapGetAccess(() => {
            let value = Region.GetEvaluator().Evaluate(regionId, elementContext, `$use(${expression})`);
            previousValue = Region.DeepCopy(value);
            return (skipFirst || callback(value));
        }, onChange, elementContext);
    }
}

export class WatchGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('watch', (regionId: string, contextElement: HTMLElement) => (expression: string, callback: (value: any) => boolean) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value), true);
        });
    }
}

export class WhenGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('when', (regionId: string, contextElement: HTMLElement) => (expression: string, callback: (value: any) => boolean) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value)), false);
        });
    }
}

export class OnceGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('once', (regionId: string, contextElement: HTMLElement) => (expression: string, callback: (value: any) => boolean) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || (callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value) && false)), false);
        });
    }
}
