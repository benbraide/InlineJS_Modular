import { DirectiveHandlerReturn } from '../typedefs';
import { DirectiveHandler } from './generic';
export class CloakDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('cloak', (region, element, directive) => {
            return DirectiveHandlerReturn.Handled; //Do nothing
        }, false);
    }
}
