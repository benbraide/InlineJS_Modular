import { IDirective, DirectiveHandlerReturn, IRegion } from '../../typedefs'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from './generic'

export class WatchDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('watch', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            let previousValue: any;
            region.GetState().TrapGetAccess(() => {
                let value = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
                if (!Region.IsEqual(value, previousValue)){
                    previousValue = Region.DeepCopy(value);
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`, { detail: value }));
                }
            }, true, element);

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class WhenDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('when', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            region.GetState().TrapGetAccess(() => {
                if (!! ExtendedDirectiveHandler.Evaluate(region, element, directive.value)){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                }
            }, true, element);

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class OnceDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('once', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'change');
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }
            
            region.GetState().TrapGetAccess(() => {
                if (!! ExtendedDirectiveHandler.Evaluate(region, element, directive.value)){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.change`));
                    return false;
                }
                return true;
            }, true, element);

            return DirectiveHandlerReturn.Handled;
        });
    }
}
