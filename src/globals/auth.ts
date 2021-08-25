import { IAuthGlobalHandler, IRouterGlobalHandler } from '../typedefs'
import { GlobalHandler } from './generic'
import { Region } from '../region'

export class AuthGlobalHandler extends GlobalHandler implements IAuthGlobalHandler{
    private userProxy_ = null;

    private origin_ = window.location.origin;
    private userInfo_: Record<string, any> = null;

    private paths_ = {
        register: 'auth/register',
        login: 'auth/login',
        logout: 'auth/logout',
        user: 'user',
    };

    public constructor(private router_: IRouterGlobalHandler, private prefix_ = '', initializeUser = true){
        super('auth', null, null, () => {
            let fetchInfo = (data?: Record<string, any>) => {
                if (!data){
                    fetch(this.BuildPath_('user'), {
                        method: 'GET',
                        credentials: 'same-origin',
                    }).then(response => response.json()).then((response) => {
                        this.userInfo_ = ((response && response['ok']) ? response['data'] : null);
                    });
                }
                else{//Use data
                    this.userInfo_ = data;
                }
            };

            if (initializeUser){
                fetchInfo();
            }
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'check'){
                    return () => this.Check();
                }

                if (prop === 'user'){
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
                    return fetchInfo;
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
                    return;
                }
                
                if (prop in this.userInfo_){
                    return this.userInfo_[prop];
                }

                if (prop === 'hasRole'){
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
            }, ['hasRole']);
        }, () => {
            this.userProxy_ = null;
            this.proxy_ = null;
            this.userInfo_ = null;
        });
    }

    public Check(){
        return !! this.userInfo_;
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
