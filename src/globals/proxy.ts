import { SimpleGlobalHandler } from './generic'
import { Region } from '../region'

export class ProxyGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('proxy', (regionId: string) => Region.Get(regionId).GetRootProxy().GetNativeProxy());
    }
}

export class RefsGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('refs', (regionId: string) => Region.Get(regionId).GetRefs());
    }
}

export class RootGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('root', (regionId: string) => Region.Get(regionId).GetRootElement());
    }
}
