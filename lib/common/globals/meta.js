"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallTempGlobalHandler = exports.EvaluateGlobalHandler = exports.ConditionalGlobalHandler = exports.AndGlobalHandler = exports.OrGlobalHandler = exports.RawGlobalHandler = exports.StaticGlobalHandler = exports.UseGlobalHandler = exports.PostGlobalHandler = exports.NextTickGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class NextTickGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('nextTick', (regionId) => (callback) => {
            let region = region_1.Region.Get(regionId);
            if (region) {
                region.AddNextTickCallback(callback);
            }
        });
    }
}
exports.NextTickGlobalHandler = NextTickGlobalHandler;
class PostGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('post', () => (callback) => {
            region_1.Region.AddPostProcessCallback(callback);
        });
    }
}
exports.PostGlobalHandler = PostGlobalHandler;
class UseGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('use', (regionId) => (value) => {
            let region = region_1.Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().ReplaceOptimizedGetAccesses();
            }
            return value;
        }, (regionId) => {
            let region = region_1.Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().FlushRawGetAccesses();
            }
            return true;
        });
    }
}
exports.UseGlobalHandler = UseGlobalHandler;
class StaticGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('static', (regionId) => (value) => {
            let region = region_1.Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().DiscardGetAccessesCheckpoint();
            }
            return value;
        }, (regionId) => {
            let region = region_1.Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().AddGetAccessesCheckpoint();
            }
            return true;
        });
    }
}
exports.StaticGlobalHandler = StaticGlobalHandler;
class RawGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('raw', () => (value) => ((region_1.Region.IsObject(value) && '__InlineJS_Target__' in value) ? value.__InlineJS_Target__ : value));
    }
}
exports.RawGlobalHandler = RawGlobalHandler;
class OrGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('or', () => (...values) => (values.findIndex(value => value) != -1));
    }
}
exports.OrGlobalHandler = OrGlobalHandler;
class AndGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('and', () => (...values) => (values.findIndex(value => !value) == -1));
    }
}
exports.AndGlobalHandler = AndGlobalHandler;
class ConditionalGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('conditional', () => (condition, trueValue, falseValue) => (condition ? trueValue : falseValue));
    }
}
exports.ConditionalGlobalHandler = ConditionalGlobalHandler;
class EvaluateGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('evaluate', (regionId, contextElement) => (value) => region_1.Region.GetEvaluator().Evaluate(regionId, contextElement, value));
    }
}
exports.EvaluateGlobalHandler = EvaluateGlobalHandler;
class CallTempGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('__InlineJS_CallTemp__', (regionId) => (key) => region_1.Region.Get(regionId).CallTemp(key));
    }
}
exports.CallTempGlobalHandler = CallTempGlobalHandler;
