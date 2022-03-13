import { ExtendedDirectiveHandler } from "../directives/extended/generic";
import { Region } from "../region";
import { DirectiveHandlerReturn, IAuthGlobalHandler, IDirective, IRegion } from "../typedefs";
import { ChannelProxy, EchoGlobalHandler } from "./echo";
import { GlobalHandler } from "./generic";

export interface NotificationsData{
    id: string;
    readOnVisible?: boolean;
    html?: string;
    iconHtml?: string;
    icon?: string;
    action?: string;
    bodyHtml?: string;
    body?: string;
    titleHtml?: string;
    title?: string;
    textHtml?: string;
    text?: string;
    timestamp?: string;
    backgroundColor?: string;
    type?: string;
    read?: boolean;
}

export interface NotificationsEntry{
    type: string;
    data: NotificationsData | string;
    id?: string | number;
}

export interface NotificationsEvent extends NotificationsEntry{
    target?: string;
    action?: string;
}

export type NotificationsEventHandler = (e?: NotificationsEvent) => boolean;

export class NotificationsDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(notifications: NotificationsGlobalHandler){
        super(notifications.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'update' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.update`);
            }


            if (['status', 'connected', 'disconnected', 'add', 'remove', 'unread', 'read', 'count'].includes(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class NotificationsGlobalHandler extends GlobalHandler{
    private scopeId_: string;

    private listProxy_: any;
    private channel_: ChannelProxy = null;

    private doneInit_ = false;
    private items_ = new Array<NotificationsData>();

    private options_ = {
        path: '/push/notification',
        channelName: (null as string | number),
    };

    private state_ = {
        connected: false,
        unreadCount: 0,
    };

    private targetHandlers_: Record<string, NotificationsEventHandler> = {};
    private actionHandlers_: Record<string, NotificationsEventHandler> = {};
    
    public constructor(private echo_: EchoGlobalHandler, private auth_: IAuthGlobalHandler){
        super('notifications', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new NotificationsDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'items'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.listProxy_;
                }

                if (prop === 'count'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.items`);
                    return this.items_.length;
                }

                if (prop === 'unreadCount'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.state_.unreadCount;
                }

                if (prop === 'connected'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.state_.connected;
                }

                if (prop === 'markAsRead' || prop === 'remove'){
                    let uri = ((prop === 'markAsRead') ? 'read' : prop);
                    return (id: string) => {
                        fetch(`${(this.options_.path || '/push/notification')}/${uri}/${id}`, {
                            method: 'GET',
                            credentials: 'same-origin',
                        });
                    };
                }

                if (prop === 'clear'){
                    return () => {
                        fetch(`${(this.options_.path || '/push/notification')}/${prop}`, {
                            method: 'GET',
                            credentials: 'same-origin',
                        });
                    };
                }

                if (prop === 'addTargetHandler'){
                    return (target: string, handler: NotificationsEventHandler) => this.AddTargetHandler(target, handler);
                }

                if (prop === 'removeTargetHandler'){
                    return (target: string, handler?: NotificationsEventHandler) => this.RemoveTargetHandler(target, handler);
                }

                if (prop === 'addActiontHandler'){
                    return (action: string, handler: NotificationsEventHandler) => this.AddActiontHandler(action, handler);
                }

                if (prop === 'removeActionHandler'){
                    return (action: string, handler?: NotificationsEventHandler) => this.RemoveActiontHandler(action, handler);
                }

                if (prop === 'listen'){
                    return (channelName?: string | number) => {
                        this.Listen(channelName);
                    }
                }
            }, ['items', 'count', 'unreadCount', 'connected', 'markAsRead', 'remove', 'clear', 'addTargetHandler', 'removeTargetHandler', 'addActiontHandler', 'removeActionHandler', 'listen']);

            this.listProxy_ = Region.CreateProxy((prop) => {
                if (prop === '__InlineJS_Target__'){
                    return this.items_;
                }

                if (prop === '__InlineJS_Path__'){
                    return `${this.scopeId_}.items`;
                }
                
                return this.items_[prop];
            }, ['__InlineJS_Target__', '__InlineJS_Path__'], null, []);
        }, () => {
            this.listProxy_ = null;
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }

    public Init(items: Array<NotificationsEntry> = null, refresh = false){
        if (this.doneInit_ && !refresh){
            return;
        }

        this.doneInit_ = true;
        let load = (entries: Array<NotificationsEntry>) => {
            let previousUnreadCount = this.state_.unreadCount;

            this.state_.unreadCount = 0;
            this.items_ = entries.map((entry) => {
                let data = ((typeof entry.data === 'string') ? (JSON.parse(entry.data) as NotificationsData) : entry.data);
                if (!data.id && (entry.id || entry.id === 0)){
                    data.id = entry.id.toString();
                }

                if (!data.type && entry.type){
                    data.type = entry.type.toLowerCase().replace(/[\/\\]+/g, '.');
                }

                if (!data.read){
                    ++this.state_.unreadCount;
                }
                
                return data;
            });

            GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
            if (this.state_.unreadCount != previousUnreadCount){
                GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);
                window.dispatchEvent(new CustomEvent(`${this.key_}.unread`, {
                    detail: {
                        value: this.state_.unreadCount,
                    },
                }));
            }

            window.dispatchEvent(new CustomEvent(`${this.key_}.count`, {
                detail: {
                    value: this.items_.length,
                },
            }));

            window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                detail: {
                    type: 'init',
                },
            }));
        };
        
        if (!Array.isArray(items)){
            fetch((this.options_.path || '/push/notification'), {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.json()).then((response) => {
                if (response && response['ok'] && Array.isArray(response['data'])){
                    load(response['data']);
                }
            });
        }
        else{
            load(items);
        }
    }

    public Listen(channelName?: string | number){
        if (this.channel_){
            return;
        }

        channelName = (channelName || this.options_.channelName);
        if (!channelName && channelName !== 0){
            if (this.auth_.Check()){//Use authenticated user's ID
                channelName = this.auth_.User('id');
            }
            else{//Channel name required
                return;
            }
        }

        this.echo_.Status((status) => {
            if (status){
                this.Listen_(channelName);
            }
        });
    }

    public AddTargetHandler(target: string, handler: NotificationsEventHandler){
        this.targetHandlers_[target] = handler;
    }

    public RemoveTargetHandler(target: string, handler?: NotificationsEventHandler){
        if (!handler || this.targetHandlers_[target] === handler){
            delete this.targetHandlers_[target];
        }
    }

    public AddActiontHandler(action: string, handler: NotificationsEventHandler){
        this.actionHandlers_[action] = handler;
    }

    public RemoveActiontHandler(action: string, handler?: NotificationsEventHandler){
        if (!handler || this.actionHandlers_[action] === handler){
            delete this.actionHandlers_[action];
        }
    }

    private Listen_(channelName: string | number){
        this.channel_ = this.echo_.GetNotificationChannel(channelName);
        if (!this.channel_){
            return;
        }

        this.channel_.status((status) => {
            if (this.state_.connected != status){
                this.state_.connected = status;
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);

                window.dispatchEvent(new CustomEvent(`${this.key_}.${status ? 'connected' : 'disconnected'}`));
                window.dispatchEvent(new CustomEvent(`${this.key_}.status`, {
                    detail: {
                        value: this.state_.connected,
                    },
                }));
            }
        });

        (this.channel_.listen as (handler: (e: any) => void) => void)((e: NotificationsEvent) => {
            if (!Region.IsObject(e)){
                return;
            }

            if ((e.target && e.target in this.targetHandlers_ && this.targetHandlers_[e.target](e)) || !e.action){
                return;//Handled
            }

            if (e.action in this.actionHandlers_ && this.actionHandlers_[e.action](e)){
                return;//Handled
            }

            let data = ((typeof e.data === 'string') ? (JSON.parse(e.data) as NotificationsData) : e.data);
            if (!data.id && (e.id || e.id === 0)){
                data.id = e.id.toString();
            }

            if (!data.type && e.type){
                data.type = e.type.toLowerCase().replace(/[\/\\]+/g, '.');
            }
            
            if (e.action === 'add'){
                if (!data.read){
                    ++this.state_.unreadCount;
                    GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);
                }

                this.items_.unshift(data);
                GlobalHandler.region_.GetChanges().AddComposed('1', `${this.scopeId_}.items.unshift`, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
                
                if (!data.read){
                    window.dispatchEvent(new CustomEvent(`${this.key_}.unread`, {
                        detail: {
                            value: this.state_.unreadCount,
                        },
                    }));
                }

                window.dispatchEvent(new CustomEvent(`${this.key_}.count`, {
                    detail: {
                        value: this.items_.length,
                    },
                }));
                
                window.dispatchEvent(new CustomEvent(`${this.key_}.add`, {
                    detail: {
                        data: {
                            id: data.id,
                            type: data.type,
                        },
                    },
                }));

                window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                    detail: {
                        type: 'add',
                        data: {
                            id: data.id,
                            type: data.type,
                        },
                    },
                }));
            }
            else if (e.action === 'remove'){
                let index = this.items_.findIndex(item => (item.id === data.id));
                if (index == -1){
                    return;
                }

                let wasUnread = false;
                if (!this.items_[index].read && this.state_.unreadCount > 0){
                    --this.state_.unreadCount;
                    GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);
                    wasUnread = true;
                }

                GlobalHandler.region_.GetChanges().AddComposed(`${index}.1.0`, `${this.scopeId_}.items.splice`, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);

                let item = this.items_.splice(index, 1)[0];
                if (wasUnread){
                    window.dispatchEvent(new CustomEvent(`${this.key_}.unread`, {
                        detail: {
                            value: this.state_.unreadCount,
                        },
                    }));
                }

                window.dispatchEvent(new CustomEvent(`${this.key_}.count`, {
                    detail: {
                        value: this.items_.length,
                    },
                }));
                
                window.dispatchEvent(new CustomEvent(`${this.key_}.remove`, {
                    detail: {
                        data: {
                            id: item.id,
                            type: item.type,
                        },
                    },
                }));

                window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                    detail: {
                        type: 'remove',
                        data: {
                            id: item.id,
                            type: item.type,
                        },
                    },
                }));
            }
            else if (e.action === 'clear'){
                if (this.items_.length == 0){
                    return;
                }
                
                this.items_ = [];
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);

                if (this.state_.unreadCount > 0){
                    this.state_.unreadCount = 0;
                    GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);

                    window.dispatchEvent(new CustomEvent(`${this.key_}.unread`, {
                        detail: {
                            value: this.state_.unreadCount,
                        },
                    }));
                }

                window.dispatchEvent(new CustomEvent(`${this.key_}.clear`));
                window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                    detail: {
                        type: 'clear',
                    },
                }));
            }
            else if (e.action === 'markAsRead'){
                let item = this.items_.find(item => (item.id === data.id));
                if (!item || item.read == (data.read !== false)){
                    return;
                }
                
                item.read = (data.read !== false);
                let wasRead = false;
                
                if (!item.read){//Marked as 'unread'
                    ++this.state_.unreadCount;
                    GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);
                    wasRead = true;
                }
                else if (this.state_.unreadCount > 0){
                    --this.state_.unreadCount;
                    GlobalHandler.region_.GetChanges().AddComposed('unreadCount', this.scopeId_);
                    wasRead = true;
                }

                if (wasRead){
                    window.dispatchEvent(new CustomEvent(`${this.key_}.unread`, {
                        detail: {
                            value: this.state_.unreadCount,
                        },
                    }));
                }

                window.dispatchEvent(new CustomEvent(`${this.key_}.read`, {
                    detail: {
                        value: item.read,
                    },
                }));
            }
        });
    }
}
