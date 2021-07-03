import { IDirective, DirectiveHandlerReturn, IRegion } from '../../typedefs'
import { DirectiveHandler } from '../generic'

export class ExtendedDirectiveHandler extends DirectiveHandler{
    public constructor(key: string, handler: (region: IRegion, element: HTMLElement, directive: IDirective) => DirectiveHandlerReturn){
        super(key, handler, false);
    }

    protected GenerateScopeId_(region: IRegion){
        return region.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }

    public static CheckEvents(key: string, region: IRegion, element: HTMLElement, directive: IDirective, defaultEvent?: string, events?: Array<string>){
        const optionsWhitelist = ['outside', 'window', 'document'];
        
        if (defaultEvent && (directive.arg.key === defaultEvent || ExtendedDirectiveHandler.IsEventRequest(directive.arg?.key))){
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${defaultEvent}`);
        }

        if (events && events.includes(directive.arg.key)){
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${directive.arg.key}`);
        }

        return DirectiveHandlerReturn.Nil;
    }
}
