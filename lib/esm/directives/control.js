import { Region } from '../region';
import { DirectiveHandler } from './generic';
export class ControlHelper {
    static Init(region, element, options, animate, onUninit, directiveName) {
        directiveName = (directiveName || 'x-if | x-each');
        if (region.GetRootElement() === element) {
            region.GetState().ReportError(`\'${directiveName}\' cannot be bound to the root element`);
            return null;
        }
        if (!element.parentElement || !(element instanceof HTMLTemplateElement) || element.content.children.length != 1) {
            region.GetState().ReportError(`\'${directiveName}\' requires a single element child`);
            return null;
        }
        let scope = region.AddElement(element);
        if (!scope) {
            region.GetState().ReportError(`Failed to bind \'${directiveName}\' to element`);
            return null;
        }
        let info = {
            regionId: region.GetId(),
            template: element,
            parent: element.parentElement,
            animator: Region.ParseAnimation(options, null, animate),
            blueprint: element.content.firstElementChild,
        };
        scope.uninitCallbacks.push(() => {
            Object.keys(info.subscriptions || {}).forEach((key) => {
                let targetRegion = Region.Get(key);
                if (targetRegion) {
                    let changes = targetRegion.GetChanges();
                    info.subscriptions[key].forEach(id => changes.Unsubscribe(id));
                }
                delete info.subscriptions[key];
            });
            onUninit();
        });
        return info;
    }
    static InsertItem(region, info, callback, offset = 0) {
        let clone = info.blueprint.cloneNode(true);
        DirectiveHandler.InsertOrAppendChildElement(region, info.parent, clone, offset, info.template); //Temporarily insert element into DOM
        let itemInfo = {
            clone: clone,
            onLoadList: new Array(),
        };
        if (callback) {
            region.AddElement(itemInfo.clone);
            callback(itemInfo);
        }
        let insert = (element, info, offset) => {
            let myRegion = Region.Get(info.regionId);
            if (!myRegion) {
                return;
            }
            if (!element.parentElement) { //Wasn't previously inserted
                element.removeAttribute(Region.GetElementKeyName());
                DirectiveHandler.InsertOrAppendChildElement(myRegion, info.parent, element, (offset || 0), info.template);
            }
            let scope = myRegion.AddElement(info.template);
            if (scope) {
                ++scope.controlCount;
            }
            Region.GetProcessor().All(myRegion, element);
        };
        info.animator.Run(true, clone, (isCanceled) => {
            if (!isCanceled && clone.parentElement) { //Animation has ended
                insert(clone, info, 0);
            }
        });
        return itemInfo;
    }
    static RemoveItem(itemInfo, info) {
        let afterRemove = () => {
            let myRegion = Region.Get(info.regionId);
            if (myRegion) {
                myRegion.MarkElementAsRemoved(itemInfo.clone);
                let scope = myRegion.AddElement(info.template);
                if (scope) {
                    --scope.controlCount;
                }
            }
        };
        info.animator.Run(false, itemInfo.clone, (isCanceled) => {
            if (!isCanceled && itemInfo.clone.parentElement) { //Animation has ended
                itemInfo.clone.parentElement.removeChild(itemInfo.clone);
                afterRemove();
            }
        });
    }
}
