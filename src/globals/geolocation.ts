import { ExtendedDirectiveHandler } from "../directives/extended/generic";
import { Region } from "../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../typedefs";
import { GlobalHandler } from "./generic";

export class GeolocationDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(geolocation: GeolocationGlobalHandler){
        super(geolocation.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'position' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.position`);
            }

            if (directive.arg.key === 'error'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.error`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class GeolocationGlobalHandler extends GlobalHandler{
    private scopeId_: string;
    private watchId_ = -1;
    
    private state_ = {
        position: (null as GeolocationCoordinates),
        error: (null as GeolocationPositionError),
        active: false,
        tracking: false,
    };
    
    public constructor(){
        super('geolocation', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new GeolocationDirectiveHandler(this));
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop in this.state_){
                    if (prop === 'position' && !this.state_.position){//First access
                        this.state_.position = {
                            accuracy: 0,
                            altitude: 0,
                            altitudeAccuracy: 0,
                            heading: 0,
                            latitude: 0,
                            longitude: 0,
                            speed: 0,
                        };
                        this.Request();
                    }
                    
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.state_[prop];
                }

                if (prop === 'request'){
                    return () => this.Request();
                }

                if (prop === 'track'){
                    return (activate = true) => this.Track(!! activate);
                }
            }, [...Object.keys(this.state_), 'request', 'track']);
        }, () => {
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }

    public Request(){
        if (window.navigator && window.navigator.geolocation){
            this.UpdateState_('active', true);
            this.UpdateState_('error', null);
            window.navigator.geolocation.getCurrentPosition(value => this.SetPosition_(value), value => this.SetError_(value));
        }
        else{
            this.UpdateState_('error', {
                code: -1,
                message: 'Geolocation is not supported on this device.',
            });
        }
    }

    public Track(activate = true){
        if (this.state_.tracking == activate){
            return;
        }
        
        if (window.navigator && window.navigator.geolocation){
            this.UpdateState_('error', null);
            this.UpdateState_('tracking', activate);
            if (activate){
                this.watchId_ = window.navigator.geolocation.watchPosition(value => this.SetPosition_(value), value => this.SetError_(value));
            }
            else{
                window.navigator.geolocation.clearWatch(this.watchId_);
                this.watchId_ = -1;
            }
        }
        else{
            this.UpdateState_('error', {
                code: -1,
                message: 'Geolocation is not supported on this device.',
            });
        }
    }

    private UpdateState_(key: string, value: any, dispatchEvent = false){
        if (key in this.state_ && !Region.IsEqual(this.state_[key], value)){
            this.state_[key] = value;
            GlobalHandler.region_.GetChanges().AddComposed(key, this.scopeId_);

            if (dispatchEvent){
                window.dispatchEvent(new CustomEvent(`${this.key_}.${key}`, {
                    detail: {
                        value: value,
                    },
                }));
            }
        }
    }

    private SetPosition_(value: GeolocationPosition){
        this.UpdateState_('active', false);
        this.UpdateState_('position', value.coords, true);
    }

    private SetError_(value: GeolocationPositionError){
        this.UpdateState_('active', false);
        this.UpdateState_('error', value, true);
    }
}
