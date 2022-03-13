import { DirectiveHandlerReturn } from '../typedefs';
import { DirectiveHandler } from './generic';
export class CloakDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('cloak', () => DirectiveHandlerReturn.Handled, false); //Do nothing
    }
}
