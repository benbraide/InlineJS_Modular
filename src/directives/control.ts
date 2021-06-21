import { IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export interface ControlInfo{
    regionId: string;
    template: HTMLTemplateElement;
    parent: HTMLElement;
    blueprint: HTMLElement;
    subscriptions?: Record<string, Array<string>>;
}

export interface ControlOnLoadInfo{
    callback: () => void;
    once: boolean;
}

export interface ControlItemInfo{
    clone: HTMLElement;
    animator: any/*AnimatorCallbackType*/;
    onLoadList: Array<ControlOnLoadInfo>;
}

export class ControlHelper{
    public static Init(region: IRegion, element: HTMLElement, onUninit: () => void){
        if (!element.parentElement || !(element instanceof HTMLTemplateElement) || element.content.children.length != 1){
            return null;
        }
        
        let scope = region.AddElement(element);
        if (!scope){
            return null;
        }

        let info: ControlInfo = {
            regionId: region.GetId(),
            template: element,
            parent: element.parentElement,
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

    public static InsertItem(region: IRegion, info: ControlInfo, animate: boolean, options: Array<string>, callback?: (itemInfo?: ControlItemInfo) => void, offset = 0): ControlItemInfo{
        let clone = (info.blueprint.cloneNode(true) as HTMLElement);
        let animator = null/*(animate ? DirectiveHandler.GetAnimator(Region.Get(info.regionId), true, clone, options) : null)*/;

        DirectiveHandler.InsertOrAppendChildElement(region, info.parent, clone, offset, info.template);//Temporarily insert element into DOM
        let itemInfo = {
            clone: clone,
            animator: animator,
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

        if (animator){//Animate view
            animator(true, null, () => {
                if (clone.parentElement){//Execute directives
                    insert(clone, info, 0);
                }
            });
        }
        else{//Immediate insertion
            insert(clone, info, 0);
        }

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

        if (itemInfo.animator){//Animate view
            itemInfo.animator(false, null, () => {
                if (itemInfo.clone.parentElement){
                    itemInfo.clone.parentElement.removeChild(itemInfo.clone);
                    afterRemove();
                }
            });
        }
        else if (itemInfo.clone.parentElement){//Immediate removal
            itemInfo.clone.parentElement.removeChild(itemInfo.clone);
            afterRemove();
        }
    }
}
