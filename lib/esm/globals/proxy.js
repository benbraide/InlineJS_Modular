import { GlobalHandler } from './generic';
import { Region } from '../region';
export class ProxyGlobalHandler extends GlobalHandler {
    constructor() {
        super('proxy', (regionId) => Region.Get(regionId).GetRootProxy().GetNativeProxy());
    }
}
export class RefsGlobalHandler extends GlobalHandler {
    constructor() {
        super('refs', (regionId) => Region.Get(regionId).GetRefs());
    }
}
export class SelfGlobalHandler extends GlobalHandler {
    constructor() {
        super('self', (regionId) => Region.Get(regionId).GetState().GetElementContext());
    }
}
export class RootGlobalHandler extends GlobalHandler {
    constructor() {
        super('root', (regionId) => Region.Get(regionId).GetRootElement());
    }
}
