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

interface NotificationsIconMap{
    success: string;
    warning: string;
    error: string;
    info: string;
}

interface NotificationsColorInfo{
    text: string;
    background: string;
}

interface NotificationsColorMap{
    success: NotificationsColorInfo;
    warning: NotificationsColorInfo;
    error: NotificationsColorInfo;
    info: NotificationsColorInfo;
}

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
    
    private iconMap_: NotificationsIconMap = {
        success: '',
        warning: '',
        error: '',
        info: '',
    };

    private colorMap_: NotificationsColorMap = {
        success: {
            text: 'rgb(5, 150, 105)',
            background: 'rgb(236, 253, 245)',
        },
        warning: {
            text: 'rgb(217, 119, 6)',
            background: 'rgb(255, 251, 235)',
        },
        error: {
            text: 'rgb(220, 38, 38)',
            background: 'rgb(254, 242, 242)',
        },
        info: {
            text: 'rgb(37, 99, 235)',
            background: 'rgb(239, 246, 255)',
        },
    };
    
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

                if (prop === 'compile'){
                    return (data: NotificationsData, isFirst = false, ancestor = 0, closeAction = '', iconMap?: NotificationsIconMap, colorMap?: NotificationsColorMap) => {
                        return this.Compile(data, isFirst, ancestor, closeAction, iconMap, colorMap);
                    };
                }
            }, ['items', 'count', 'unreadCount', 'connected', 'markAsRead', 'remove', 'clear', 'addTargetHandler', 'removeTargetHandler', 'addActiontHandler', 'removeActionHandler', 'listen', 'compile']);

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
        this.iconMap_.success = `
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
        `;

        this.iconMap_.warning = `
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
        `;

        this.iconMap_.error = `
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-bug" viewBox="0 0 16 16">
                <path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A4.979 4.979 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A4.985 4.985 0 0 1 13 6h.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 13.5 7H13v1h1.5a.5.5 0 0 1 0 1H13v1h.5a1.5 1.5 0 0 1 1.5 1.5v.5a.5.5 0 1 1-1 0v-.5a.5.5 0 0 0-.5-.5H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 0-.5.5v.5a.5.5 0 1 1-1 0v-.5A1.5 1.5 0 0 1 2.5 10H3V9H1.5a.5.5 0 0 1 0-1H3V7h-.5A1.5 1.5 0 0 1 1 5.5V5a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 .5.5H3c0-1.356.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623zM4 7v4a4 4 0 0 0 3.5 3.97V7H4zm4.5 0v7.97A4 4 0 0 0 12 11V7H8.5zM12 6a3.989 3.989 0 0 0-1.334-2.982A3.983 3.983 0 0 0 8 2a3.983 3.983 0 0 0-2.667 1.018A3.989 3.989 0 0 0 4 6h8z"/>
            </svg>
        `;

        this.iconMap_.info = `
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
        `;
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

    public Compile(data: NotificationsData, isFirst = false, ancestor = 0, closeAction = '', iconMap?: NotificationsIconMap, colorMap?: NotificationsColorMap){
        if (data.html){//Prepared HTML
            return data.html;
        }
        
        iconMap = (iconMap || this.iconMap_);
        colorMap = (colorMap || this.colorMap_);

        let mappedColor = ((data.icon && data.icon in colorMap) ? (colorMap[data.icon] as NotificationsColorInfo) : colorMap.info), icon: string;
        if (!data.iconHtml){
            let iconContent: string;
            if (data.icon && data.icon in iconMap){
                iconContent = iconMap[data.icon];
            }
            else{//Use 'info' as default
                iconContent = iconMap.info;
            }

            icon = `
                <span style="color: ${mappedColor.text};">
                    ${iconContent}
                </span>
            `;
        }
        else{
            icon = data.iconHtml;
        }

        let iconContainer = `
            <div style="margin-top: 8px;">
                ${icon}
            </div>
        `;

        let action = '', config = Region.GetConfig(), styles: Record<string, string> = {
            'position': 'relative',
            'width': '100%',
            'display': 'flex',
            'flex-direction': 'row',
            'justify-content': 'flex-start',
            'align-items': 'flex-start',
            'padding': '4px 0 4px 8px',
            'background-color': (data.backgroundColor ? data.backgroundColor : mappedColor.background),
        };

        let compileStyles = () => Object.entries(styles).reduce((prev, [key, value]) => (`${prev}${key}:${value};`), '');
        if (data.action){
            action = `${config.GetDirectiveName('on')}:click="${data.action}"`;
            styles['cursor'] = 'pointer';
        }

        let intersection = '', closeActionValue: string;//inlinejs-notification-item
        if (!closeAction){
            if (!isFirst){
                styles['border-top-width'] = '1px';
            }

            if (data.readOnVisible !== false){
                intersection = `${config.GetDirectiveName('intersection')}="{ threshold: 0.7, root: $ancestor(${ancestor}) }"`;
                intersection += ` ${config.GetDirectiveName('on')}:in.once="$notifications.markAsRead('${data.id}')"`;
            }

            closeActionValue = `$notifications.remove('${data.id}')`;
        }
        else{//External handler
            closeActionValue = closeAction;
        }

        let closeIcon = `
            <button type="button" style="position: absolute; top: 8px; right: 16px; font-size: 24px; font-weight: 700; background-color: transparent; color: rgb(153, 27, 27);"
                ${config.GetDirectiveName('on')}:click.stop="${closeActionValue}">x</button>
        `;
        
        if (data.bodyHtml){
            return `
                <div class="inlinejs-notification-item" style="${compileStyles()}" ${action} ${intersection}>
                    ${iconContainer}
                    ${data.bodyHtml}
                    ${closeIcon}
                </div>
            `;
        }

        let body: string;
        if (!data.body){
            let title = '';
            if (!data.titleHtml && data.title){
                title = `
                    <h3 class="title" style="padding-right: 16px; font-size: 18px; font-weight: 700;">${data.title}</h3>
                `;
            }
            else if (data.titleHtml){
                title = data.titleHtml;
            }
            
            let text = (data.textHtml || `<p class="text" style="margin-top: 4px; line-height: 1.25;">${data.text || 'Notification has no content.'}</p>`);
            if (title){
                body = `
                    ${title}
                    ${text}
                `;
            }
            else{
                body = text;
            }
        }
        else{
            body = data.body;
        }

        let bodyHtml = `
            <div class="body" style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding: 8px 16px 8px 8px;">
                ${body}
                <span class="timestamp" style="margin-top: 6px; font-size: 12px;"
                    ${config.GetDirectiveName('timeago')}.caps="'${data.timestamp || ''}' || Date.now()" x-text="$timeago.label"></span>
            </div>
        `;

        return `
            <div class="inlinejs-notification-item" style="${compileStyles()}" ${action} ${intersection}>
                ${iconContainer}
                ${bodyHtml}
                ${closeIcon}
            </div>
        `;
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
