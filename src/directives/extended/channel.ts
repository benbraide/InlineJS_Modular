import { ChannelProxy, EchoGlobalHandler } from "../../globals/echo";
import { Region } from "../../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../../typedefs";
import { ExtendedDirectiveHandler } from "./generic";

export class ChannelDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(echo: EchoGlobalHandler){
        super('channel', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let options = {
                private: false,
                presence: false,
                public: false,
                notification: false,
                listen: false,
                bind: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });

            let channelName = directive.arg.key.replace(/\-/g, '.');
            if (options.bind){
                return region.ForwardEventBinding(element, directive.value, directive.arg.options, `${this.key_}.${channelName}`);
            }
            
            let channel: ChannelProxy, elementScope = region.AddElement(element, true), isNew = true, key = `$${this.key_}`;
            if (key in elementScope.locals){
                channel = elementScope.locals[key].object;
                options.listen = true;
                isNew = false;
            }
            else if (options.private){
                channel = echo.GetPrivateChannel(channelName);
            }
            else if (options.presence){
                channel = echo.GetPresenceChannel(channelName);
            }
            else if (options.notification){
                channel = echo.GetNotificationChannel(channelName);
            }
            else if (options.public){
                channel = echo.GetPublicChannel(channelName);
            }
            else{//Look up hierarchy or create a public channel
                let channelInfo = region.GetLocal(element, key, true, true);
                if (channelInfo){
                    channel = channelInfo.object;
                    options.listen = true;
                    isNew = false;
                }
                else{
                    channel = echo.GetPublicChannel(channelName);
                }
            }

            if (!channel){
                region.GetState().Warn(`Failed to create a channel named '${channelName}'.`);
                return DirectiveHandlerReturn.Handled;
            }

            let regionId = region.GetId();
            if (options.listen){//Listen for default event
                let handler = (e: any) => {
                    element.dispatchEvent(new CustomEvent(`${this.key_}.${channelName}`, {
                        detail: {
                            data: e.data,
                        },
                    }));
    
                    let myRegion = Region.Get(regionId);
                    if (!myRegion){
                        return;
                    }
                    
                    try{
                        myRegion.GetState().PushContext('event', e);
                        ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                    }
                    catch{}

                    myRegion.GetState().PopContext('event');
                };
                
                if (channel.isNotification){
                    (channel.listen as (handler: (e: any) => void) => void)(handler);
                }
                else{//General channel
                    (channel.listen as (event: string, handler: (e: any) => void) => void)(`.${channelName}.event`, handler);
                }
            }

            if (isNew){
                let connected = false, scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`);
                channel.status((value) => {
                    if (connected == !!value){
                        return;
                    }
                    
                    connected = !connected;
                    Region.Get(regionId).GetChanges().AddComposed('connected', scopeId);
                    
                    element.dispatchEvent(new CustomEvent(`${this.key_}.status`, {
                        detail: {
                            value: value,
                        },
                    }));
                });
                
                elementScope.uninitCallbacks.push(() => {
                    echo.GetGlobalEcho().leave(channelName);
                    channel = null;
                });
    
                elementScope.locals[key] = Region.CreateProxy((prop) =>{
                    if (prop === 'object'){
                        return channel;
                    }
                    
                    if (prop === 'name'){
                        return channelName;
                    }

                    if (prop === 'connected'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                        return connected;
                    }
                }, ['object', 'name', 'connected']);
            }
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
