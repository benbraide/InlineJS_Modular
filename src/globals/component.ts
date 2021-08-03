import { SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class ComponentGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('component', () => (id: string) => Region.Find(id, true));
    }
}

export class ComponentKeyGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('componentKey', (regionId: string) => Region.Get(regionId).GetComponentKey());
    }
}

export class LocalsGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('locals', (regionId: string) => (element?: HTMLElement) => Region.Get(regionId).GetElementScope(element || true).locals);
    }
}

export class GetScopeGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('getScope', (regionId: string) => (key: string) => Region.Get(regionId).GetScope(key));
    }
}
