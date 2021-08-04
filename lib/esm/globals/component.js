import { SimpleGlobalHandler } from './generic';
import { Region } from '../region';
export class ComponentGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('component', () => (id) => Region.Find(id, true));
    }
}
export class ComponentKeyGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('componentKey', (regionId) => Region.Get(regionId).GetComponentKey());
    }
}
export class LocalsGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('locals', (regionId) => (element) => Region.Get(regionId).GetElementScope(element || true).locals);
    }
}
export class GetScopeGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('getScope', (regionId) => (key) => Region.Get(regionId).GetScope(key));
    }
}
