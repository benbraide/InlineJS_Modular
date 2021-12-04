import { IRegion, IParsedAnimation, IDirective, DirectiveHandlerReturn } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export interface ControlInfo{
    key: string;
    regionId: string;
    template: HTMLTemplateElement;
    parent: HTMLElement;
    blueprint: HTMLElement;
    animator: IParsedAnimation;
    subscriptions?: Record<string, Array<string>>;
}

export interface ControlOnLoadInfo{
    callback: () => void;
    once: boolean;
}

export interface ControlItemInfo{
    clone: HTMLElement;
    onLoadList: Array<ControlOnLoadInfo>;
}

export class ControlHelper{
    public static Init(key: string, region: IRegion, element: HTMLElement, directive: IDirective, onUninit: () => void, animate = false){
        let response = DirectiveHandler.CheckEvents(key, region, element, directive, 'after.visibility', ['before.visibility']);
        if (response != DirectiveHandlerReturn.Nil){
            return null;
        }
        
        let directiveName = (key ? Region.GetConfig().GetDirectiveName(key) : 'x-control');
        if (region.GetRootElement() === element){
            region.GetState().ReportError(`\'${directiveName}\' cannot be bound to the root element`);
            return null;
        }
        
        if (!element.parentElement || !(element instanceof HTMLTemplateElement) || element.content.children.length != 1){
            region.GetState().ReportError(`\'${directiveName}\' requires a single element child`);
            return null;
        }
        
        let scope = region.AddElement(element);
        if (!scope){
            region.GetState().ReportError(`Failed to bind \'${directiveName}\' to element`);
            return null;
        }

        let info: ControlInfo = {
            key: key,
            regionId: region.GetId(),
            template: element,
            parent: element.parentElement,
            animator: region.ParseAnimation(directive.arg.options, null, (animate || directive.arg.key === 'animate')),
            blueprint: (element.content.firstElementChild as HTMLElement),
        };

        scope.uninitCallbacks.push(() => {
            Object.keys(info.subscriptions || {}).forEach((key) => {
                let targetRegion = Region.Get(key);
                if (targetRegion){
                    let changes = targetRegion.GetChanges();
                    info.subscriptions[key].forEach(id => changes.Unsubscribe(id));
                }

                delete info.subscriptions[key];
            });

            onUninit();
        });
        
        return info;
    }

    public static InsertItem(region: IRegion, info: ControlInfo, callback?: (itemInfo?: ControlItemInfo) => void, offset = 0): ControlItemInfo{
        let clone = (info.blueprint.cloneNode(true) as HTMLElement);

        DirectiveHandler.InsertOrAppendChildElement(region, info.parent, clone, offset, info.template);//Temporarily insert element into DOM
        let itemInfo = {
            clone: clone,
            onLoadList: new Array<ControlOnLoadInfo>(),
        };
        
        if (callback){
            region.AddElement(itemInfo.clone);
            callback(itemInfo);
        }

        let insert = (element: HTMLElement, info: ControlInfo, offset: number) => {
            let myRegion = Region.Get(info.regionId);
            if (!myRegion){
                return;
            }
            
            if (!element.parentElement){//Wasn't previously inserted
                element.removeAttribute(Region.GetElementKeyName());
                DirectiveHandler.InsertOrAppendChildElement(myRegion, info.parent, element, (offset || 0), info.template);
            }

            let scope = myRegion.AddElement(info.template);
            if (scope){
                ++scope.controlCount;
            }

            Region.GetProcessor().All(myRegion, element);
        };

        info.animator.Run(true, clone, (isCanceled) => {
            if (!isCanceled && clone.parentElement){//Animation has ended
                insert(clone, info, 0);
            }

            if (!isCanceled){
                info.template.dispatchEvent(new CustomEvent(`${info.key}.after.visibility`, {
                    detail: {
                        show: true,
                        clone: clone,
                    },
                }));
            }
        }, () => {
            info.template.dispatchEvent(new CustomEvent(`${info.key}.before.visibility`, {
                detail: {
                    show: true,
                    clone: clone,
                },
            }));
        });

        return itemInfo;
    }

    public static RemoveItem(itemInfo: ControlItemInfo, info: ControlInfo){
        let afterRemove = () => {
            let myRegion = Region.Get(info.regionId);
            if (myRegion){
                myRegion.MarkElementAsRemoved(itemInfo.clone);
                let scope = myRegion.AddElement(info.template);
                if (scope){
                    --scope.controlCount;
                }
            }
        };

        info.animator.Run(false, itemInfo.clone, (isCanceled) => {
            if (!isCanceled && itemInfo.clone.parentElement){//Animation has ended
                itemInfo.clone.parentElement.removeChild(itemInfo.clone);
                afterRemove();
            }

            if (!isCanceled){
                info.template.dispatchEvent(new CustomEvent(`${info.key}.after.visibility`, {
                    detail: {
                        show: false,
                        clone: itemInfo.clone,
                    },
                }));
            }
        }, () => {
            info.template.dispatchEvent(new CustomEvent(`${info.key}.before.visibility`, {
                detail: {
                    show: false,
                    clone: itemInfo.clone,
                },
            }));
        });
    }
}
