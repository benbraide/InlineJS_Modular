import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { NoResult } from '../proxy'

import { DirectiveHandler } from './generic'
import { ControlHelper, ControlItemInfo } from './control'

export class IfDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('if', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let info = ControlHelper.Init(region, element, () => {
                if (itemInfo){
                    ControlHelper.RemoveItem(itemInfo, info);
                }
            });

            if (!info){
                return DirectiveHandlerReturn.Nil;
            }
            
            let lastValue = false, itemInfo: ControlItemInfo = null, animate = (directive.arg.key === 'animate'), scope = region.GetElementScope(info.template);
            if (!scope){
                return DirectiveHandlerReturn.Nil;
            }
            
            let ifConditionChange: Array<(isTrue: boolean) => void>, isFirstEntry = true;
            let listen = () => {
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = Region.Get(info.regionId);
                    if (!myRegion){
                        return false;
                    }
                    
                    let value = !! DirectiveHandler.Evaluate(myRegion, element, directive.value), callListeners = (value: boolean) => {
                        ifConditionChange.forEach((callback) => {
                            try{
                                callback(value);
                            }
                            catch{}
                        });
                    };
                    
                    if (value != lastValue){
                        lastValue = value;
                        if (ifConditionChange.length > 0){
                            callListeners(value);
                        }
                        else if (value){//Insert into parent
                            itemInfo = ControlHelper.InsertItem(myRegion, info, animate, directive.arg.options, (myItemInfo) => {
                                let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(myItemInfo.clone);
                                Object.entries(scope.locals).forEach(([key, item]) => {//Forward locals
                                    cloneScope.locals[key] = item;
                                });
                            });
                        }
                        else if (itemInfo){
                            ControlHelper.RemoveItem(itemInfo, info);
                        }
                    }
                    else if (isFirstEntry && ifConditionChange.length > 0){
                        callListeners(value);
                    }

                    isFirstEntry = false;
    
                    return true;
                }, true, null);
            };

            if (scope.ifConditionChange && scope.ifConditionChange.length > 0){
                ifConditionChange = scope.ifConditionChange;
                listen();
            }
            else{//Initialize if condition change list
                ifConditionChange = (scope.ifConditionChange = new Array<(isTrue: boolean) => void>());
                scope.postProcessCallbacks.push(listen);
            }
            
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}