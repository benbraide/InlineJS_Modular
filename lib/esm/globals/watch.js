import { GlobalHandler } from './generic';
import { Region } from '../region';
export class WatchHelper {
    static Watch(regionId, elementContext, expression, callback, skipFirst) {
        let region = Region.Get(regionId);
        if (!region) {
            return;
        }
        let previousValue;
        let onChange = () => {
            let value = Region.GetEvaluator().Evaluate(regionId, elementContext, expression);
            if (Region.IsEqual(value, previousValue)) {
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
export class WatchGlobalHandler extends GlobalHandler {
    constructor() {
        super('watch', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value), true);
        });
    }
}
export class WhenGlobalHandler extends GlobalHandler {
    constructor() {
        super('when', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value)), false);
        });
    }
}
export class OnceGlobalHandler extends GlobalHandler {
    constructor() {
        super('once', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || (callback.call(Region.Get(regionId).GetRootProxy().GetNativeProxy(), value) && false)), false);
        });
    }
}
