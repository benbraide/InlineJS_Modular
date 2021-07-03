import { GlobalHandler } from './generic';
import { Region } from '../region';
export class ComponentGlobalHandler extends GlobalHandler {
    constructor() {
        super('component', () => (id) => Region.Find(id, true));
    }
}
export class ComponentKeyGlobalHandler extends GlobalHandler {
    constructor() {
        super('componentKey', (regionId) => Region.Get(regionId).GetComponentKey());
    }
}
export class LocalsGlobalHandler extends GlobalHandler {
    constructor() {
        super('locals', (regionId) => (element) => Region.Get(regionId).GetElementScope(element || true).locals);
    }
}
export class GetScopeGlobalHandler extends GlobalHandler {
    constructor() {
        super('getScope', (regionId) => (key) => Region.Get(regionId).GetScope(key));
    }
}
