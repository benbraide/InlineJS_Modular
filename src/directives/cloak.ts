import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { DirectiveHandler } from './generic'

export class CloakDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('cloak', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            return DirectiveHandlerReturn.Handled;//Do nothing
        }, false);
    }
}
