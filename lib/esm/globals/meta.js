import { SimpleGlobalHandler } from './generic';
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
        super('or', () => (...values) => {
            let lastValue = undefined;
            for (let value of values) {
                if (value) {
                    return value;
                }
                lastValue = value;
            }
            return lastValue;
        });
    }
}
export class AndGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('and', () => (...values) => (values.findIndex(value => !value) == -1));
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
