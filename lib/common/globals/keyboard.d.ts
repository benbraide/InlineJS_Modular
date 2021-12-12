import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { ProxiedGlobalHandler } from './generic';
export declare class KeyboardDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(keyboard: KeyboardGlobalHandler);
}
export declare class KeyboardGlobalHandler extends ProxiedGlobalHandler {
    constructor();
}
