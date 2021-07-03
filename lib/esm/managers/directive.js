import { DirectiveHandlerReturn } from '../typedefs';
export class DirectiveManager {
    constructor(isLocal_ = false) {
        this.isLocal_ = isLocal_;
        this.handlers_ = {};
        this.mountDirectiveNames_ = new Array();
    }
    AddHandler(handler) {
        this.RemoveHandler(handler);
        this.handlers_[handler.GetKey()] = handler;
        if (handler.IsMount()) {
            this.mountDirectiveNames_.push(handler.GetKey());
        }
    }
    RemoveHandler(handler) {
        this.RemoveHandlerByKey(handler.GetKey());
    }
    RemoveHandlerByKey(key) {
        if (key in this.handlers_) {
            let index = this.mountDirectiveNames_.findIndex(name => (name === key));
            if (index != -1) {
                this.mountDirectiveNames_.splice(index, 1);
            }
            delete this.handlers_[key];
        }
    }
    Handle(region, element, directive) {
        if (!directive) {
            return DirectiveHandlerReturn.Nil;
        }
        let scope = region.AddElement(element, true);
        if (!this.isLocal_ && scope && scope.directiveManager) {
            let result = scope.directiveManager.Handle(region, element, directive);
            if (result != DirectiveHandlerReturn.Nil) { //Handled
                return result;
            }
        }
        if (directive.key in this.handlers_) {
            return this.handlers_[directive.key].Handle(region, element, directive);
        }
        return DirectiveHandlerReturn.Nil;
    }
    GetMountDirectiveName() {
        return ((this.mountDirectiveNames_.length == 0) ? 'data' : this.mountDirectiveNames_[this.mountDirectiveNames_.length - 1]);
    }
    Expunge(element) {
        Object.values(this.handlers_).forEach(handler => handler.Expunge(element));
    }
}
