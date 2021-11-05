"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const generic_1 = require("./generic");
const control_1 = require("./control");
class IfDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('if', (region, element, directive) => {
            let info = control_1.ControlHelper.Init(region, element, directive.arg.options, (directive.arg.key === 'animate'), () => {
                if (itemInfo) {
                    control_1.ControlHelper.RemoveItem(itemInfo, info);
                }
            }, region_1.Region.GetConfig().GetDirectiveName(this.key_));
            if (!info) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let lastValue = false, itemInfo = null, scope = region.GetElementScope(info.template);
            if (!scope) {
                region.GetState().ReportError(`Failed to bind '${region_1.Region.GetConfig().GetDirectiveName(this.key_)}' to element`);
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let ifConditionChange, isFirstEntry = true;
            let listen = () => {
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = region_1.Region.Get(info.regionId);
                    if (!myRegion) {
                        return false;
                    }
                    let value = !!generic_1.DirectiveHandler.Evaluate(myRegion, element, directive.value), callListeners = (value) => {
                        ifConditionChange.forEach((callback) => {
                            try {
                                callback(value);
                            }
                            catch (_a) { }
                        });
                    };
                    if (value != lastValue) {
                        lastValue = value;
                        if (ifConditionChange.length > 0) {
                            callListeners(value);
                        }
                        else if (value) { //Insert into parent
                            itemInfo = control_1.ControlHelper.InsertItem(myRegion, info, (myItemInfo) => {
                                let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(myItemInfo.clone);
                                Object.entries(scope.locals).forEach(([key, item]) => {
                                    cloneScope.locals[key] = item;
                                });
                            });
                        }
                        else if (itemInfo) {
                            control_1.ControlHelper.RemoveItem(itemInfo, info);
                        }
                    }
                    else if (isFirstEntry && ifConditionChange.length > 0) {
                        callListeners(value);
                    }
                    isFirstEntry = false;
                    return true;
                }, true, null);
            };
            if (scope.ifConditionChange && scope.ifConditionChange.length > 0) {
                ifConditionChange = scope.ifConditionChange;
                listen();
            }
            else { //Initialize if condition change list
                ifConditionChange = (scope.ifConditionChange = new Array());
                scope.postProcessCallbacks.push(listen);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.IfDirectiveHandler = IfDirectiveHandler;
