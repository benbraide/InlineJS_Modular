"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallTempGlobalHandler = exports.EvaluateGlobalHandler = exports.ConditionalGlobalHandler = exports.LogicalGlobalHandler = exports.RelationalGlobalHandler = exports.ArithmeticGlobalHandler = exports.AndGlobalHandler = exports.OrGlobalHandler = exports.RawGlobalHandler = exports.StaticGlobalHandler = exports.UseGlobalHandler = exports.PostGlobalHandler = exports.NextTickGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class NextTickGlobalHandler extends generic_1.SimpleGlobalHandler {
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
class PostGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('post', () => (callback) => {
            region_1.Region.AddPostProcessCallback(callback);
        });
    }
}
exports.PostGlobalHandler = PostGlobalHandler;
class UseGlobalHandler extends generic_1.SimpleGlobalHandler {
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
class StaticGlobalHandler extends generic_1.SimpleGlobalHandler {
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
class RawGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('raw', () => (value) => ((region_1.Region.IsObject(value) && '__InlineJS_Target__' in value) ? value.__InlineJS_Target__ : value));
    }
}
exports.RawGlobalHandler = RawGlobalHandler;
class OrGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('or', () => OrGlobalHandler.Compute);
    }
    static Compute(...values) {
        return (values.find(value => !!value) || values[values.length - 1]);
    }
}
exports.OrGlobalHandler = OrGlobalHandler;
class AndGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('and', () => AndGlobalHandler.Compute);
    }
    static Compute(...values) {
        let index = values.findIndex(value => !value);
        return ((index == -1) ? values[values.length - 1] : values[index]);
    }
}
exports.AndGlobalHandler = AndGlobalHandler;
class ArithmeticGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('arithmetic', null, null, () => {
            this.proxy_ = region_1.Region.CreateProxy((prop) => {
                if (prop === 'neg' || prop === 'negative') {
                    return (value) => -value;
                }
                if (prop === 'add' || prop === 'sum') {
                    return (...values) => values.reduce((acc, value) => (acc + value));
                }
                if (prop === 'sub' || prop === 'subtract') {
                    return (...values) => values.reduce((acc, value) => (acc - value));
                }
                if (prop === 'mult' || prop === 'multiply') {
                    return (...values) => values.reduce((acc, value) => (acc * value));
                }
                if (prop === 'div' || prop === 'divide') {
                    return (...values) => values.reduce((acc, value) => (acc / value));
                }
            }, ['neg', 'negative', 'add', 'sum', 'sub', 'subtract', 'mult', 'multiply', 'div', 'divide']);
        }, () => {
            this.proxy_ = null;
        });
    }
}
exports.ArithmeticGlobalHandler = ArithmeticGlobalHandler;
class RelationalGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('relational', null, null, () => {
            this.proxy_ = region_1.Region.CreateProxy((prop) => {
                if (prop === 'compare') {
                    return (first, second) => ((first < second) ? -1 : ((first == second) ? 0 : 1));
                }
                if (prop === 'less') {
                    return (first, second) => (first < second);
                }
                if (prop === 'lessOrEqual' || prop === 'lessOrEquals') {
                    return (first, second) => (first <= second);
                }
                if (prop === 'equal' || prop === 'equals') {
                    return (first, second) => (first == second);
                }
                if (prop === 'explicitlyEqual' || prop === 'explicitlyEquals') {
                    return (first, second) => (first === second);
                }
                if (prop === 'explicitlyNotEqual' || prop === 'explicitlyNotEquals') {
                    return (first, second) => (first !== second);
                }
                if (prop === 'notEqual' || prop === 'notEquals') {
                    return (first, second) => (first != second);
                }
                if (prop === 'greaterOrEqual' || prop === 'greaterOrEquals') {
                    return (first, second) => (first >= second);
                }
                if (prop === 'greater') {
                    return (first, second) => (first > second);
                }
            }, ['compare', 'less', 'lessOrEqual', 'lessOrEquals', 'equal', 'equals', 'explicitlyEqual', 'explicitlyEquals', 'explicitlyNotEqual', 'explicitlyNotEquals', 'notEqual', 'notEquals', 'greaterOrEqual', 'greaterOrEquals', 'greater']);
        }, () => {
            this.proxy_ = null;
        });
    }
}
exports.RelationalGlobalHandler = RelationalGlobalHandler;
class LogicalGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('logical', null, null, () => {
            this.proxy_ = region_1.Region.CreateProxy((prop) => {
                if (prop === 'not') {
                    return (value) => !value;
                }
                if (prop === 'or') {
                    return OrGlobalHandler.Compute;
                }
                if (prop === 'and') {
                    return AndGlobalHandler.Compute;
                }
            }, ['not', 'or', 'and']);
        }, () => {
            this.proxy_ = null;
        });
    }
}
exports.LogicalGlobalHandler = LogicalGlobalHandler;
class ConditionalGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('conditional', () => (condition, trueValue, falseValue) => (condition ? trueValue : falseValue));
    }
}
exports.ConditionalGlobalHandler = ConditionalGlobalHandler;
class EvaluateGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('evaluate', (regionId, contextElement) => (value) => region_1.Region.GetEvaluator().Evaluate(regionId, contextElement, value));
    }
}
exports.EvaluateGlobalHandler = EvaluateGlobalHandler;
class CallTempGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('__InlineJS_CallTemp__', (regionId) => (key) => region_1.Region.Get(regionId).CallTemp(key));
    }
}
exports.CallTempGlobalHandler = CallTempGlobalHandler;
