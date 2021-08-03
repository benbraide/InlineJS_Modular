import { SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class ExpandEventGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('expandEvent', (regionId: string) => (event: string, target?: HTMLElement) => Region.Get(regionId).ExpandEvent(event, (target || true)));
    }
}

export class DispatchEventGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('dispatchEvent', (regionId: string, contextElement: HTMLElement) => (event: Event | string, nextCycle: boolean = true, target?: Node) => {
            let resolvedTarget = ((target as HTMLElement) || contextElement);
            let resolvedEvent = ((typeof event === 'string') ? new CustomEvent(Region.Get(regionId).ExpandEvent(event, resolvedTarget)) : event);

            if (nextCycle){
                setTimeout(() => resolvedTarget.dispatchEvent(resolvedEvent), 0);
            }
            else{
                resolvedTarget.dispatchEvent(resolvedEvent);
            }
        });
    }
}
