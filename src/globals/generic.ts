import { IGlobalHandler, IGlobalManager } from '../typedefs'
import { Region } from '../region'

export class GlobalHandler implements IGlobalHandler{
    protected static region_ = new Region(document.createElement('template'));
    
    public constructor(protected key_: string, private value_: any, private canHandle_?: (regionId?: string) => boolean,
        private beforeAdd_?: (manager?: IGlobalManager) => boolean, private afterAdd_?: (manager?: IGlobalManager) => void, private afterRemove_?: (manager?: IGlobalManager) => void){}
    
    public GetKey(): string{
        return this.key_;
    }

    public BeforeAdd(manager: IGlobalManager): boolean{
        return (!this.beforeAdd_ || this.beforeAdd_(manager));
    }
    
    public AfterAdd(manager: IGlobalManager): void{
        if (this.afterAdd_){
            this.afterAdd_(manager);
        }
    }
    
    public AfterRemove(manager: IGlobalManager): void{
        if (this.afterRemove_){
            this.afterRemove_(manager);
        }
    }

    public CanHandle(regionId: string): boolean{
        return (!this.canHandle_ || this.canHandle_(regionId));
    }

    public Handle(regionId: string, contextElement: HTMLElement): any{
        return ((typeof this.value_ === 'function') ? (this.value_ as (regionId?: string, contextElement?: HTMLElement) => any)(regionId, contextElement) : this.value_);
    }
}
