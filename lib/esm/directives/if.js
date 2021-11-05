import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { DirectiveHandler } from './generic';
import { ControlHelper } from './control';
export class IfDirectiveHandler extends DirectiveHandler {
    constructor() {
        super('if', (region, element, directive) => {
            let info = ControlHelper.Init(region, element, directive.arg.options, (directive.arg.key === 'animate'), () => {
                if (itemInfo) {
                    ControlHelper.RemoveItem(itemInfo, info);
                }
            }, Region.GetConfig().GetDirectiveName(this.key_));
            if (!info) {
                return DirectiveHandlerReturn.Handled;
            }
            let lastValue = false, itemInfo = null, scope = region.GetElementScope(info.template);
            if (!scope) {
                region.GetState().ReportError(`Failed to bind '${Region.GetConfig().GetDirectiveName(this.key_)}' to element`);
                return DirectiveHandlerReturn.Handled;
            }
            let ifConditionChange, isFirstEntry = true;
            let listen = () => {
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = Region.Get(info.regionId);
                    if (!myRegion) {
                        return false;
                    }
                    let value = !!DirectiveHandler.Evaluate(myRegion, element, directive.value), callListeners = (value) => {
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
                            itemInfo = ControlHelper.InsertItem(myRegion, info, (myItemInfo) => {
                                let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(myItemInfo.clone);
                                Object.entries(scope.locals).forEach(([key, item]) => {
                                    cloneScope.locals[key] = item;
                                });
                            });
                        }
                        else if (itemInfo) {
                            ControlHelper.RemoveItem(itemInfo, info);
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
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
