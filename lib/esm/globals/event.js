import { SimpleGlobalHandler } from './generic';
import { Region } from '../region';
export class ExpandEventGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('expandEvent', (regionId) => (event, target) => Region.Get(regionId).ExpandEvent(event, (target || true)));
    }
}
export class DispatchEventGlobalHandler extends SimpleGlobalHandler {
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
