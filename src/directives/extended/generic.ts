import { IDirective, DirectiveHandlerReturn, IRegion } from '../../typedefs'
import { DirectiveHandler } from '../generic'

export class ExtendedDirectiveHandler extends DirectiveHandler{
    public constructor(key: string, handler: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn){
        super(key, handler, false);
    }

    protected GenerateScopeId_(region: IRegion){
        return region.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
}
