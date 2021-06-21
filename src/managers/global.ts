import { IGlobalManager, IGlobalHandler, INoResult } from '../typedefs'

export class GlobalManager implements IGlobalManager{
    private handlers_: Record<string, IGlobalHandler> = {};

    public AddHandler(handler: IGlobalHandler){
        if (handler.BeforeAdd(this)){
            let key = ('$' + handler.GetKey());
            if (key in this.handlers_){
                this.handlers_[key].AfterRemove();
            }

            this.handlers_[('$' + handler.GetKey())] = handler;
            handler.AfterAdd(this);
        }
    }

    public RemoveHandler(handler: IGlobalHandler){
        let key = ('$' + handler.GetKey());
        if (key in this.handlers_){
            delete this.handlers_[key];
            this.handlers_[key].AfterRemove();
        }
    }

    public GetHandler(regionId: string, key: string): IGlobalHandler{
        if (!(key in this.handlers_)){
            return null;
        }

        return ((!regionId || this.handlers_[key].CanHandle(regionId)) ? this.handlers_[key] : null);
    }
    
    public Handle(regionId: string, contextElement: HTMLElement, key: string, noResultCreator?: () => INoResult): any{
        let target = this.GetHandler(regionId, key);
        return (target ? target.Handle(regionId, contextElement) : (noResultCreator ? noResultCreator() : null));
    }
}
