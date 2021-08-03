import { GlobalHandler } from './generic'
import { Region } from '../region'

interface ThemePropInfo{
    dark: 'disabled' | 'enabled' | 'default';
    darkEnabled: boolean;
}

export class ThemeGlobalHandler extends GlobalHandler{
    private scopeId_: string;
    
    private props_: ThemePropInfo = {
        dark: 'disabled',
        darkEnabled: false,
    };

    public constructor(private persistent_ = false){
        super('theme', null, null, () => {
            let setState = (key: string, value: any, after?: () => void) => {
                if (key in this.props_ && !Region.IsEqual(this.props_[key], value)){
                    this.props_[key] = value;
                    GlobalHandler.region_.GetChanges().AddComposed(key, this.scopeId_);
                    if (after){
                        after();
                    }
                }
            };

            let checkDarkState = () => {
                if (this.persistent_){
                    Region.GetDatabase().Write('theme.dark', this.props_.dark);
                }
                
                if (this.props_.dark === 'default'){
                    setState('darkEnabled', window.matchMedia('(prefers-color-scheme: dark)').matches);
                }
                else{//Explicit
                    setState('darkEnabled', (this.props_.dark === 'enabled'));
                }
            };

            let setDarkValue = (value: any) => {
                if (typeof value === 'string' && ['disabled', 'enabled', 'default'].includes(value)){
                    setState('dark', value, checkDarkState);
                }
                else{//Use as boolean
                    setState('dark', (value ? 'enabled' : 'disabled'), checkDarkState);
                }
            };
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop in this.props_){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.props_[prop];
                }

                if (prop === 'persistent'){
                    return this.persistent_;
                }
            }, ['dark', 'darkEnabled', 'persistent'], (prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if (prop === 'dark'){
                    setDarkValue(value);
                }
                else if (prop === 'darkMode'){
                    setState(prop, !! value);
                }

                return true;
            });

            if (this.persistent_){//Load value
                Region.GetDatabase().Read('theme.dark', setDarkValue);
            }
        }, () => {
            this.proxy_ = null;
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
}
