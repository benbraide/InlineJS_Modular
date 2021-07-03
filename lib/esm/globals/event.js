import { GlobalHandler } from './generic';
import { Region } from '../region';
export class EventGlobalHandler extends GlobalHandler {
    constructor() {
        super('event', (regionId) => Region.Get(regionId).GetState().GetEventContext());
    }
}
export class ExpandEventGlobalHandler extends GlobalHandler {
    constructor() {
        super('expandEvent', (regionId) => (event, target) => Region.Get(regionId).ExpandEvent(event, (target || true)));
    }
}
export class DispatchEventGlobalHandler extends GlobalHandler {
    constructor() {
        super('dispatchEvent', (regionId, contextElement) => (event, nextCycle = true, target) => {
            let resolvedTarget = (target || contextElement);
            let resolvedEvent = ((typeof event === 'string') ? new CustomEvent(Region.Get(regionId).ExpandEvent(event, resolvedTarget)) : event);
            if (nextCycle) {
                setTimeout(() => resolvedTarget.dispatchEvent(resolvedEvent), 0);
            }
            else {
                resolvedTarget.dispatchEvent(resolvedEvent);
            }
        });
    }
}
