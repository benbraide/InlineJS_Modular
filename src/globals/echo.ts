import { ExtendedDirectiveHandler } from "../directives/extended/generic";
import { Region } from "../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../typedefs";
import { GlobalHandler } from "./generic";

export interface Channel{
    notification(handler: (e?: any) => void): Channel;
    listen(event: string, handler: (e?: any) => void): Channel;
    listenForWhisper(event: string, handler: (e?: any) => void): Channel;
    whisper(event: string, data: any): Channel;
    stopListening(event: string): Channel;
    stopListeningForWhisper(event: string): Channel;
    subscribed(callback: Function): Channel;
    error(callback: Function): Channel;
}

export interface ChannelProxy{
    name: string;
    channel: Channel;
    isNotification: boolean;
    status: (handler: (status: boolean) => void) => void;
    listen: ((handler: (e: any) => void) => void) | ((event: string, handler: (e: any) => void) => void);
    leave: () => void;
}

export interface PresenceChannel extends Channel{
    here(callback: Function): PresenceChannel;
    joining(callback: Function): PresenceChannel;
    leaving(callback: Function): PresenceChannel;
}

export interface GlobalEcho{
    connector: any;
    channel(channel: string): Channel;
    connect(): void;
    disconnect(): void;
    join(channel: string): PresenceChannel;
    leave(channel: string): void;
    leaveChannel(channel: string): void;
    listen(channel: string, event: string, callback: Function): Channel;
    private(channel: string): Channel;
    encryptedPrivate(channel: string): Channel;
    socketId(): string;
}

export class EchoDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(echo: EchoGlobalHandler){
        super(echo.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'connected' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.connected`);
            }

            if (directive.arg.key === 'error' || directive.arg.key === 'succeeded' || directive.arg.key === 'failed'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class EchoGlobalHandler extends GlobalHandler{
    private scopeId_: string;
    
    private channels_: Record<string, ChannelProxy> = {};
    private globalEcho_: GlobalEcho = null;

    private connected_: boolean = null;
    private connectionError_: any = null;
    private statusHandlers_ = new Array<(status: boolean) => void>();
    
    public constructor(){
        super('echo', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new EchoDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'status'){
                    return (handler: (status: boolean) => void) => this.Status(handler);
                }

                if (prop === 'connect'){
                    return () => {
                        try{
                            this.globalEcho_.connector.pusher.connection.connect();
                        }
                        catch{}
                    };
                }

                if (prop === 'connected'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.connected_;
                }

                if (prop === 'error'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.connectionError_;
                }
            }, ['status', 'connect', 'connected', 'error']);
        }, () => {
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }

    public SetGlobalEcho(value: GlobalEcho){
        if ((this.globalEcho_ = value)){
            this.globalEcho_.connector.pusher.connection.bind('connected', () => {
                this.SetConnectedState_(true);
                this.SetConnectionError_(null);
            });

            this.globalEcho_.connector.pusher.connection.bind('error', (error: any) => {
                this.SetConnectedState_(false);
                this.SetConnectionError_(error);
            });
        }
    }

    public GetGlobalEcho(){
        return this.globalEcho_;
    }

    public Status(handler: (status: boolean) => void){
        if (this.connected_ === null){
            this.statusHandlers_.push(handler);
        }
        else{//Connected state set
            handler(this.connected_);
        }
    }

    public GetPublicChannel(name: string){
        return this.GetChannel(name, () => this.globalEcho_.channel(name), 'public');
    }

    public GetPrivateChannel(name: string){
        return this.GetChannel(name, () => this.globalEcho_.private(name), 'private',
            this.GetPrivateProps, ['whisper', 'listenForWhisper']);
    }

    public GetPresenceChannel(name: string){
        return this.GetChannel(name, () => this.globalEcho_.join(name), 'presence', (prop: string, channel: any) => {
            if (prop === 'here'){
                return (handler: (users: any) => void) => channel.here(handler);
            }

            if (prop === 'joining'){
                return (handler: (user: any) => void) => channel.joining(handler);
            }

            if (prop === 'leaving'){
                return (handler: (user: any) => void) => channel.leaving(handler);
            }
            
            return this.GetPrivateProps(prop, channel);
        }, ['whisper', 'listenForWhisper', 'here', 'joining', 'leaving']);
    }

    public GetNotificationChannel(idOrName: string | number){
        let name = ((typeof idOrName === 'number') ? `App.Models.User.${idOrName}` : idOrName);
        return this.GetChannel(name, () => this.globalEcho_.private(name), 'notification', null, null, true);
    }

    public GetChannel(name: string, creator: (name?: string) => Channel, nameFormatter?: ((name?: string) => string) | string,
        propGetter?: (prop: string, channel: Channel) => any, props?: Array<string>, isNotification = false){
        let qname = (nameFormatter ? ((typeof nameFormatter === 'string') ? `${nameFormatter}.${name}` : nameFormatter(name)) : name);
        if (qname in this.channels_){
            return this.channels_[qname];
        }

        let channel = creator(name);
        if (!channel){
            return null;
        }

        let succeeded: boolean = null, statusHandlers = new Array<(status: boolean) => void>();
        channel.listen('.pusher:subscription_succeeded', () => {
            succeeded = true;
            statusHandlers.splice(0).forEach(handler => handler(true));
        });

        channel.listen('.pusher:subscription_error', () => {
            succeeded = false;
            statusHandlers.splice(0).forEach(handler => handler(false));
        });
        
        this.channels_[qname] = Region.CreateProxy((prop) => {
            if (prop === 'name'){
                return qname;
            }
            
            if (prop === 'channel' || prop === '__InlineJS_Target__'){
                return channel;
            }

            if (prop === 'isNotification'){
                return isNotification;
            }
            
            if (prop === 'status'){
                return (handler: (status: boolean) => void) => {
                    if (succeeded === null){
                        statusHandlers.push(handler);
                    }
                    else{
                        handler(succeeded);
                    }
                };
            }

            if (prop === 'listen'){
                if (isNotification){
                    return (handler: (e: any) => void) => channel.notification(handler);    
                }

                return (event: string, handler: (e: any) => void) => channel.listen(event, handler);
            }

            if (prop === 'leave' && this.globalEcho_){
                return () => this.globalEcho_.leave(name);
            }

            if (propGetter){
                return propGetter(prop, channel);
            }
        }, ['name', 'channel', 'listen', 'leave', '__InlineJS_Target__', ...(props || [])]);

        return this.channels_[qname];
    }
    
    public GetPrivateProps(prop: string, channel: Channel){
        if (prop === 'whisper'){
            return (event: string, data: any) => {
                if (typeof data === 'function'){
                    channel.listenForWhisper(event, data);
                }
                else{//Whisper data
                    channel.whisper(event, data);
                }
            };
        }
    }

    private SetConnectedState_(state: boolean, callHandlers = true){
        if (this.connected_ === state){
            return;
        }

        this.connected_ = state;
        GlobalHandler.region_.GetChanges().AddComposed('connected', this.scopeId_);
        
        if (callHandlers){
            this.statusHandlers_.splice(0).forEach((handler) => {
                try{
                    handler(state);
                }
                catch{}
            });
        }

        if (typeof state === 'boolean'){
            window.dispatchEvent(new CustomEvent(`${this.key_}.${state ? 'succeeded' : 'failed'}`));

            window.dispatchEvent(new CustomEvent(`${this.key_}.connected`, {
                detail: {
                    state: state,
                },
            }));
        }
    }

    private SetConnectionError_(error: any){
        if (this.connectionError_ !== error){
            this.connectionError_ = error;
            GlobalHandler.region_.GetChanges().AddComposed('error', this.scopeId_);
            window.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                detail: {
                    value: error,
                },
            }));
        }
    }
}
