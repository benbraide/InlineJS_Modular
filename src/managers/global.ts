import { IGlobalManager, IGlobalHandler, INoResult, IRegion } from '../typedefs'

export class GlobalManager implements IGlobalManager{
    private handlers_: Record<string, IGlobalHandler> = {};

    public constructor(private getRegion_: (id: string) => IRegion, private inferRegion_: (element: HTMLElement | string) => IRegion){}

    public AddHandler(handler: IGlobalHandler){
        if (handler.BeforeAdd(this)){
            let key = ('$' + handler.GetKey());
            if (key in this.handlers_){
                this.handlers_[key].AfterRemove();
            }

            this.handlers_[key] = handler;
            handler.AfterAdd(this);
        }
    }

    public RemoveHandler(handler: IGlobalHandler){
        this.RemoveHandlerByKey(handler.GetKey());
    }

    public RemoveHandlerByKey(key: string){
        key = ('$' + key);
        if (key in this.handlers_){
            delete this.handlers_[key];
            this.handlers_[key].AfterRemove();
        }
    }

    public GetHandler(regionId: string, key: string): IGlobalHandler{
        if (key in this.handlers_){
            return ((!regionId || this.handlers_[key].CanHandle(regionId)) ? this.handlers_[key] : null);
        }

        if (!key.startsWith('$')){
            return this.GetHandler(regionId, ('$' + key));
        }
        
        return null;
    }
    
    public Handle(regionId: string, contextElement: HTMLElement, key: string, noResultCreator?: () => INoResult): any{
        let handler = this.GetHandler(regionId, key);
        if (handler){
            return handler.Handle(regionId, contextElement);
        }
        
        if (key.startsWith('$$')){//External access
            key = key.substr(1);
            return (target: HTMLElement) => {
                let region = (this.inferRegion_(target) || this.getRegion_(regionId));
                if (!region){
                    return null;
                }

                let local = region.GetLocal(target, key, false, true);
                if (local){//Prioritize local value
                    return local;
                }

                return this.GetHandler(region.GetId(), key)?.Handle(region.GetId(), target);
            };
        }

        return (noResultCreator ? noResultCreator() : null);
    }
}
