import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
export interface PageOptions {
    path: string | RegExp;
    name?: string;
    title?: string;
    middleware?: string | Array<string>;
    onLoad?: (reloaded?: boolean) => void;
}
export declare class RouterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(router: RouterGlobalHandler);
}
export declare class RegisterDirectiveHandler extends ExtendedDirectiveHandler {
    private router_;
    constructor(router_: RouterGlobalHandler);
}
export declare class RouterGlobalHandler extends GlobalHandler {
    private scopeId_;
    constructor();
    Register(page: PageOptions): number;
    Unregister(id: number): void;
}
