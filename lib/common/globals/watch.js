"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnceGlobalHandler = exports.WhenGlobalHandler = exports.WatchGlobalHandler = exports.WatchHelper = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class WatchHelper {
    static Watch(regionId, elementContext, expression, callback, skipFirst) {
        let region = region_1.Region.Get(regionId);
        if (!region) {
            return;
        }
        let previousValue;
        let onChange = () => {
            let value = region_1.Region.GetEvaluator().Evaluate(regionId, elementContext, expression);
            if (region_1.Region.IsEqual(value, previousValue)) {
                return true;
            }
            previousValue = region_1.Region.DeepCopy(value);
            return callback(value);
        };
        region.GetState().TrapGetAccess(() => {
            let value = region_1.Region.GetEvaluator().Evaluate(regionId, elementContext, `$use(${expression})`);
            previousValue = region_1.Region.DeepCopy(value);
            return (skipFirst || callback(value));
        }, onChange, elementContext);
    }
}
exports.WatchHelper = WatchHelper;
class WatchGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('watch', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => callback.call(region_1.Region.Get(regionId).GetRootProxy().GetNativeProxy(), value), true);
        });
    }
}
exports.WatchGlobalHandler = WatchGlobalHandler;
class WhenGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('when', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || callback.call(region_1.Region.Get(regionId).GetRootProxy().GetNativeProxy(), value)), false);
        });
    }
}
exports.WhenGlobalHandler = WhenGlobalHandler;
class OnceGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('once', (regionId, contextElement) => (expression, callback) => {
            WatchHelper.Watch(regionId, contextElement, expression, value => (!value || (callback.call(region_1.Region.Get(regionId).GetRootProxy().GetNativeProxy(), value) && false)), false);
        });
    }
}
exports.OnceGlobalHandler = OnceGlobalHandler;
