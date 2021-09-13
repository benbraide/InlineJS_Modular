import { IAuthGlobalHandler, IRouterGlobalHandler } from '../typedefs';
import { GlobalHandler } from './generic';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
export declare class AuthDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(auth: AuthGlobalHandler);
}
export declare class AuthGlobalHandler extends GlobalHandler implements IAuthGlobalHandler {
    private router_;
    private prefix_;
    private scopeId_;
    private userProxy_;
    private origin_;
    private userInfo_;
    private requestedKeys_;
    private paths_;
    constructor(router_: IRouterGlobalHandler, prefix_?: string, initializeUser?: boolean);
    Refresh(data?: Record<string, any>): void;
    Check(): boolean;
    User(key: string): any;
    BuildPath(path: string): string;
    private BuildPath_;
    private Post_;
}
