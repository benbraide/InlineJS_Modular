import { DirectiveHandlerReturn, IAuthGlobalHandler, IDirective, IRegion, IRouterGlobalHandler } from '../typedefs'
import { GlobalHandler } from './generic'
import { Region } from '../region'
import { ExtendedDirectiveHandler } from '../directives/extended/generic';

export class AuthDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(auth: AuthGlobalHandler){
        super(auth.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'change' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.change`);
            }

            if (directive.arg.key === 'auth' || directive.arg.key === 'guest'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class AuthGlobalHandler extends GlobalHandler implements IAuthGlobalHandler{
    private scopeId_: string;
    private userProxy_ = null;

    private origin_ = window.location.origin;
    private userInfo_: Record<string, any> = null;
    private requestedKeys_ = new Array<string>();

    private paths_ = {
        register: 'auth/register',
        login: 'auth/login',
        logout: 'auth/logout',
        user: 'user',
    };

    public constructor(private router_: IRouterGlobalHandler, private prefix_ = '', initializeUser = true){
        super('auth', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new AuthDirectiveHandler(this));
            
            if (initializeUser){
                this.Refresh();
            }
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'check'){
                    return () => {
                        GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user`);
                        return this.Check();
                    };
                }

                if (prop === 'user'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.userProxy_;
                }

                if (prop === 'register'){
                    return (form: HTMLFormElement | Record<string, string>) => this.Post_('register', form, true);
                }

                if (prop === 'login'){
                    return (form: HTMLFormElement | Record<string, string>) => this.Post_('login', form, true);
                }

                if (prop === 'logout'){
                    return (form?: HTMLFormElement | Record<string, string>) => this.Post_('logout', (form || {}), true);
                }

                if (prop === 'update'){
                    return (form: HTMLFormElement | Record<string, string>) => this.Post_('user', form, false, 'PATCH');
                }

                if (prop === 'delete'){
                    return (form?: HTMLFormElement | Record<string, string>) => this.Post_('user', (form || {}), false, 'DELETE');
                }

                if (prop === 'refresh'){
                    return (data?: Record<string, any>) => this.Refresh(data);
                }

                if (prop === 'prefix'){
                    return this.prefix_;
                }
            }, ['check', 'user', 'register', 'login', 'logout', 'update', 'delete', 'refresh', 'prefix'], (prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if (prop === 'prefix'){
                    this.prefix_ = value;
                }

                return true;
            });

            this.userProxy_ = Region.CreateProxy((prop) => {
                if (!Region.IsObject(this.userInfo_)){
                    if (prop === 'hasRole'){
                        this.requestedKeys_.push('roles', 'role');
                        GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.roles`);
                        GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.role`);
                    }
                    else{
                        this.requestedKeys_.push(prop);
                        GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.${prop}`);
                    }
                    return;
                }
                
                if (prop in this.userInfo_){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.${prop}`);
                    return this.userInfo_[prop];
                }

                if (prop === 'hasRole'){
                    return (role: string) => {
                        let roles: Array<string> | string = null;
                        if ('roles' in this.userInfo_){
                            roles = this.userInfo_['roles'];
                            GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.roles`);
                        }
                        else if ('role' in this.userInfo_){
                            roles = this.userInfo_['role'];
                            GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.user.role`);
                        }

                        if (!roles){
                            return false;
                        }

                        return (Array.isArray(roles) ? roles.includes(role) : (roles === role));
                    };
                }
            }, ['hasRole']);

            this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        }, () => {
            this.userProxy_ = null;
            this.proxy_ = null;
            this.userInfo_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
    }

    public Refresh(data?: Record<string, any>){
        let alert = () => {
            let isAuth = Region.IsObject(this.userInfo_);
            
            GlobalHandler.region_.GetChanges().AddComposed('user', this.scopeId_);
            if (isAuth){
                this.requestedKeys_.splice(0).forEach(key => GlobalHandler.region_.GetChanges().AddComposed(key, `${this.scopeId_}.user`));
                window.dispatchEvent(new CustomEvent(`${this.key_}.auth`));
            }
            else{
                window.dispatchEvent(new CustomEvent(`${this.key_}.guest`));
            }

            window.dispatchEvent(new CustomEvent(`${this.key_}.change`, {
                detail: {
                    loggedIn: isAuth,
                },
            }));
        };
        
        if (!Region.IsObject(data)){
            fetch(this.BuildPath_('user'), {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.json()).then((response) => {
                if (response && response['ok'] && Region.IsObject(response['data'])){
                    this.userInfo_ = response['data'];
                    alert();
                }
            });
        }
        else{//Use data
            this.userInfo_ = data;
            alert();
        }
    }

    public Check(){
        return !! this.userInfo_;
    }

    public User(key: string){
        if (!Region.IsObject(this.userInfo_)){
            return null;
        }

        if (key in this.userInfo_){
            return this.userInfo_[key];
        }

        if (key === 'hasRole'){
            return (role: string) => {
                let roles: Array<string> | string = null;
                if ('roles' in this.userInfo_){
                    roles = this.userInfo_['roles'];
                }
                else if ('role' in this.userInfo_){
                    roles = this.userInfo_['role'];
                }

                if (!roles){
                    return false;
                }

                return (Array.isArray(roles) ? roles.includes(role) : (roles === role));
            };
        }

        return null;
    }

    public BuildPath(path: string){
        return (this.prefix_ ? `${this.origin_}/${this.prefix_}/${path}` : `${this.origin_}/${path}`);
    }
    
    private BuildPath_(resource: string){
        let suffix = ((resource in this.paths_) ? this.paths_[resource] : '');
        if (!suffix){
            return '';
        }

        return (this.prefix_ ? `${this.origin_}/${this.prefix_}/${suffix}` : `${this.origin_}/${suffix}`);
    }

    private Post_(resource: string, form: HTMLFormElement | Record<string, string>, refresh = false, method: 'POST' | 'PATCH' | 'DELETE' = 'POST'){
        let formData: FormData;
        if (!(form instanceof HTMLFormElement)){
            formData = new FormData();
            Object.keys(form || {}).forEach(key => formData.append(key, form[key]));
        }
        else{
            formData = new FormData(form);
        }

        if (method !== 'POST'){
            formData.append('_method', method);
        }

        fetch(this.BuildPath_(resource), {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
        }).then(response => response.json()).then((response) => {
            if (response && response.ok){
                if (refresh){
                    window.location.href = this.origin_;
                }
                else if (this.router_){
                    this.router_.Reload();
                }
            }
        }).catch((err) => {});
    }
}
