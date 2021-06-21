import { GlobalHandler } from './generic'
import { Region } from '../region'

export class ProxyGlobalHandler extends GlobalHandler{
    public constructor(){
        super('proxy', (regionId: string) => Region.Get(regionId).GetRootProxy().GetNativeProxy());
    }
}

export class RefsGlobalHandler extends GlobalHandler{
    public constructor(){
        super('refs', (regionId: string) => Region.Get(regionId).GetRefs());
    }
}

export class SelfGlobalHandler extends GlobalHandler{
    public constructor(){
        super('self', (regionId: string) => Region.Get(regionId).GetState().GetElementContext());
    }
}

export class RootGlobalHandler extends GlobalHandler{
    public constructor(){
        super('root', (regionId: string) => Region.Get(regionId).GetRootElement());
    }
}
