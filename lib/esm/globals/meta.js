import { GlobalHandler, SimpleGlobalHandler } from './generic';
import { Region } from '../region';
export class NextTickGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('nextTick', (regionId) => (callback) => {
            let region = Region.Get(regionId);
            if (region) {
                region.AddNextTickCallback(callback);
            }
        });
    }
}
export class PostGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('post', () => (callback) => {
            Region.AddPostProcessCallback(callback);
        });
    }
}
export class UseGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('use', (regionId) => (value) => {
            let region = Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().ReplaceOptimizedGetAccesses();
            }
            return value;
        }, (regionId) => {
            let region = Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().FlushRawGetAccesses();
            }
            return true;
        });
    }
}
export class StaticGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('static', (regionId) => (value) => {
            let region = Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().DiscardGetAccessesCheckpoint();
            }
            return value;
        }, (regionId) => {
            let region = Region.GetCurrent(regionId);
            if (region) {
                region.GetChanges().AddGetAccessesCheckpoint();
            }
            return true;
        });
    }
}
export class RawGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('raw', () => (value) => ((Region.IsObject(value) && '__InlineJS_Target__' in value) ? value.__InlineJS_Target__ : value));
    }
}
export class OrGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('or', () => OrGlobalHandler.Compute);
    }
    static Compute(...values) {
        return (values.find(value => !!value) || values[values.length - 1]);
    }
}
export class AndGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('and', () => AndGlobalHandler.Compute);
    }
    static Compute(...values) {
        let index = values.findIndex(value => !value);
        return ((index == -1) ? values[values.length - 1] : values[index]);
    }
}
export class ArithmeticGlobalHandler extends GlobalHandler {
    constructor() {
        super('arithmetic', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
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
export class RelationalGlobalHandler extends GlobalHandler {
    constructor() {
        super('relational', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
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
export class LogicalGlobalHandler extends GlobalHandler {
    constructor() {
        super('logical', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
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
export class ConditionalGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('conditional', () => (condition, trueValue, falseValue) => (condition ? trueValue : falseValue));
    }
}
export class EvaluateGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('evaluate', (regionId, contextElement) => (value) => Region.GetEvaluator().Evaluate(regionId, contextElement, value));
    }
}
export class CallTempGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('__InlineJS_CallTemp__', (regionId) => (key) => Region.Get(regionId).CallTemp(key));
    }
}
