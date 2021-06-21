import { IDirectiveManager, IDirectiveHandler, IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'

export class DirectiveManager implements IDirectiveManager{
    private handlers_: Record<string, IDirectiveHandler> = {};
    private mountDirectiveNames_ = new Array<string>();

    public constructor(private isLocal_ = false){}

    public AddHandler(handler: IDirectiveHandler){
        this.RemoveHandler(handler);
        this.handlers_[handler.GetKey()] = handler;
        if (handler.IsMount()){
            this.mountDirectiveNames_.push(handler.GetKey());
        }
    }

    public RemoveHandler(handler: IDirectiveHandler){
        let key = handler.GetKey();
        if (key in this.handlers_){
            let index = this.mountDirectiveNames_.findIndex(name => (name === key));
            if (index != -1){
                this.mountDirectiveNames_.splice(index, 1);
            }
            delete this.handlers_[key];
        }
    }

    public Handle(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn{
        if (!directive){
            return DirectiveHandlerReturn.Nil;
        }
        
        let scope = region.AddElement(element, true);
        if (!this.isLocal_ && scope && scope.directiveManager){
            let result = scope.directiveManager.Handle(region, element, directive);
            if (result != DirectiveHandlerReturn.Nil){//Handled
                return result;
            }
        }
        
        if (directive.key in this.handlers_){
            return this.handlers_[directive.key].Handle(region, element, directive);
        }

        return DirectiveHandlerReturn.Nil;
    }

    public GetMountDirectiveName(): string{
        return ((this.mountDirectiveNames_.length == 0) ? 'data' : this.mountDirectiveNames_[this.mountDirectiveNames_.length - 1]);
    }
}
