import { IAuthGlobalHandler, IRouterGlobalHandler } from '../typedefs';
import { GlobalHandler } from './generic';
export declare class AuthGlobalHandler extends GlobalHandler implements IAuthGlobalHandler {
    private router_;
    private prefix_;
    private userProxy_;
    private origin_;
    private userInfo_;
    private paths_;
    constructor(router_: IRouterGlobalHandler, prefix_?: string, initializeUser?: boolean);
    Check(): boolean;
    BuildPath(path: string): string;
    private BuildPath_;
    private Post_;
}
