import { SimpleGlobalHandler } from './generic';
import { Region } from '../region';
export class ProxyGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('proxy', (regionId) => Region.Get(regionId).GetRootProxy().GetNativeProxy());
    }
}
export class RefsGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('refs', (regionId) => Region.Get(regionId).GetRefs());
    }
}
export class RootGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('root', (regionId) => Region.Get(regionId).GetRootElement());
    }
}
