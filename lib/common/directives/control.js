"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlHelper = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
class ControlHelper {
    static Init(key, region, element, directive, onUninit, animate = false) {
        let response = generic_1.DirectiveHandler.CheckEvents(key, region, element, directive, 'after.visibility', ['before.visibility']);
        if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
            return null;
        }
        let directiveName = (key ? region_1.Region.GetConfig().GetDirectiveName(key) : 'x-control');
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
            key: key,
            regionId: region.GetId(),
            template: element,
            parent: element.parentElement,
            animator: region.ParseAnimation(directive.arg.options, null, (animate || directive.arg.key === 'animate')),
            blueprint: element.content.firstElementChild,
            insertItem(myRegion, callback) {
                if (!(myRegion = (myRegion || region_1.Region.Get(this.regionId)))) {
                    return null;
                }
                return ControlHelper.InsertItem(myRegion, info, (myItemInfo) => {
                    let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(myItemInfo.clone);
                    Object.entries(scope.locals).forEach(([key, item]) => {
                        cloneScope.locals[key] = item;
                    });
                    if (callback) {
                        callback(cloneScope, myItemInfo);
                    }
                });
            },
        };
        scope.uninitCallbacks.push(() => {
            Object.keys(info.subscriptions || {}).forEach((key) => {
                let targetRegion = region_1.Region.Get(key);
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
        generic_1.DirectiveHandler.InsertOrAppendChildElement(region, info.parent, clone, offset, info.template); //Temporarily insert element into DOM
        let itemInfo = {
            clone: clone,
            onLoadList: new Array(),
        };
        if (callback) {
            region.AddElement(itemInfo.clone);
            callback(itemInfo);
        }
        let insert = (element, info, offset) => {
            let myRegion = region_1.Region.Get(info.regionId);
            if (!myRegion) {
                return;
            }
            if (!element.parentElement) { //Wasn't previously inserted
                element.removeAttribute(region_1.Region.GetElementKeyName());
                generic_1.DirectiveHandler.InsertOrAppendChildElement(myRegion, info.parent, element, (offset || 0), info.template);
            }
            let scope = myRegion.AddElement(info.template);
            if (scope) {
                ++scope.controlCount;
            }
            region_1.Region.GetProcessor().All(myRegion, element);
        };
        info.animator.Run(true, clone, (isCanceled) => {
            if (!isCanceled && clone.parentElement) { //Animation has ended
                insert(clone, info, 0);
            }
            if (!isCanceled) {
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
    static RemoveItem(itemInfo, info) {
        let afterRemove = () => {
            let myRegion = region_1.Region.Get(info.regionId);
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
            if (!isCanceled) {
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
    static GetConditionChange(scope, callback) {
        if (!scope) {
            return null;
        }
        let ifConditionChange, callCallback = (list) => {
            callback((value) => {
                ifConditionChange.forEach((callback) => {
                    try {
                        callback(value);
                    }
                    catch (_a) { }
                });
            }, list);
        };
        if (scope.ifConditionChange && scope.ifConditionChange.length > 0) {
            ifConditionChange = scope.ifConditionChange;
            if (callback) {
                callCallback(ifConditionChange);
            }
        }
        else { //Initialize if condition change list
            ifConditionChange = (scope.ifConditionChange = new Array());
            if (callback) {
                scope.postProcessCallbacks.push(() => callCallback(ifConditionChange));
            }
        }
        return ifConditionChange;
    }
}
exports.ControlHelper = ControlHelper;
