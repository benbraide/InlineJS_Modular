import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
import { ControlHelper } from './control';
export class IfDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('if', (region, element, directive) => {
            let info = ControlHelper.Init(this.key_, region, element, directive, () => {
                if (itemInfo) {
                    ControlHelper.RemoveItem(itemInfo, info);
                }
            });
            if (!info) {
                return DirectiveHandlerReturn.Handled;
            }
            let lastValue = false, itemInfo = null, isFirstEntry = true;
            let listen = (alertChange, ifConditionChange) => {
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = Region.Get(info.regionId);
                    if (!myRegion) {
                        return false;
                    }
                    let value = !!DirectiveHandler.Evaluate(myRegion, element, directive.value);
                    if (value != lastValue) {
                        lastValue = value;
                        if (ifConditionChange.length > 0) {
                            alertChange(value);
                        }
                        else if (value) { //Insert into parent
                            itemInfo = info.insertItem(myRegion);
                        }
                        else if (itemInfo) {
                            ControlHelper.RemoveItem(itemInfo, info);
                        }
                    }
                    else if (isFirstEntry && ifConditionChange.length > 0) {
                        alertChange(value);
                    }
                    isFirstEntry = false;
                    return true;
                }, true, null);
            };
            if (!ControlHelper.GetConditionChange(region.GetElementScope(info.template), listen)) {
                region.GetState().ReportError(`Failed to bind '${Region.GetConfig().GetDirectiveName(this.key_)}' to element`);
            }
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
