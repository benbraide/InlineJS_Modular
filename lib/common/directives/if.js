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
            let info = control_1.ControlHelper.Init(this.key_, region, element, directive, () => {
                if (itemInfo) {
                    control_1.ControlHelper.RemoveItem(itemInfo, info);
                }
            });
            if (!info) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let lastValue = false, itemInfo = null, isFirstEntry = true;
            let listen = (alertChange, ifConditionChange) => {
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = region_1.Region.Get(info.regionId);
                    if (!myRegion) {
                        return false;
                    }
                    let value = !!generic_1.DirectiveHandler.Evaluate(myRegion, element, directive.value);
                    if (value != lastValue) {
                        lastValue = value;
                        if (ifConditionChange.length > 0) {
                            alertChange(value);
                        }
                        else if (value) { //Insert into parent
                            itemInfo = info.insertItem(myRegion);
                        }
                        else if (itemInfo) {
                            control_1.ControlHelper.RemoveItem(itemInfo, info);
                        }
                    }
                    else if (isFirstEntry && ifConditionChange.length > 0) {
                        alertChange(value);
                    }
                    isFirstEntry = false;
                    return true;
                }, true, null);
            };
            if (!control_1.ControlHelper.GetConditionChange(region.GetElementScope(info.template), listen)) {
                region.GetState().ReportError(`Failed to bind '${region_1.Region.GetConfig().GetDirectiveName(this.key_)}' to element`);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.IfDirectiveHandler = IfDirectiveHandler;
