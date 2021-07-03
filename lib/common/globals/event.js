"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchEventGlobalHandler = exports.ExpandEventGlobalHandler = exports.EventGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class EventGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('event', (regionId) => region_1.Region.Get(regionId).GetState().GetEventContext());
    }
}
exports.EventGlobalHandler = EventGlobalHandler;
class ExpandEventGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('expandEvent', (regionId) => (event, target) => region_1.Region.Get(regionId).ExpandEvent(event, (target || true)));
    }
}
exports.ExpandEventGlobalHandler = ExpandEventGlobalHandler;
class DispatchEventGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('dispatchEvent', (regionId, contextElement) => (event, nextCycle = true, target) => {
            let resolvedTarget = (target || contextElement);
            let resolvedEvent = ((typeof event === 'string') ? new CustomEvent(region_1.Region.Get(regionId).ExpandEvent(event, resolvedTarget)) : event);
            if (nextCycle) {
                setTimeout(() => resolvedTarget.dispatchEvent(resolvedEvent), 0);
            }
            else {
                resolvedTarget.dispatchEvent(resolvedEvent);
            }
        });
    }
}
exports.DispatchEventGlobalHandler = DispatchEventGlobalHandler;
