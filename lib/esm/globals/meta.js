import { GlobalHandler } from './generic';
import { Region } from '../region';
export class NextTickGlobalHandler extends GlobalHandler {
    constructor() {
        super('nextTick', (regionId) => (callback) => {
            let region = Region.Get(regionId);
            if (region) {
                region.AddNextTickCallback(callback);
            }
        });
    }
}
export class PostGlobalHandler extends GlobalHandler {
    constructor() {
        super('post', () => (callback) => {
            Region.AddPostProcessCallback(callback);
        });
    }
}
export class UseGlobalHandler extends GlobalHandler {
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
export class StaticGlobalHandler extends GlobalHandler {
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
export class RawGlobalHandler extends GlobalHandler {
    constructor() {
        super('raw', () => (value) => ((Region.IsObject(value) && '__InlineJS_Target__' in value) ? value.__InlineJS_Target__ : value));
    }
}
export class OrGlobalHandler extends GlobalHandler {
    constructor() {
        super('or', () => (...values) => (values.findIndex(value => value) != -1));
    }
}
export class AndGlobalHandler extends GlobalHandler {
    constructor() {
        super('and', () => (...values) => (values.findIndex(value => !value) == -1));
    }
}
export class ConditionalGlobalHandler extends GlobalHandler {
    constructor() {
        super('conditional', () => (condition, trueValue, falseValue) => (condition ? trueValue : falseValue));
    }
}
export class EvaluateGlobalHandler extends GlobalHandler {
    constructor() {
        super('evaluate', (regionId, contextElement) => (value) => Region.GetEvaluator().Evaluate(regionId, contextElement, value));
    }
}
export class CallTempGlobalHandler extends GlobalHandler {
    constructor() {
        super('__InlineJS_CallTemp__', (regionId) => (key) => Region.Get(regionId).CallTemp(key));
    }
}
