import { IDirective, DirectiveHandlerReturn, IRegion, IChange, IBubbledChange } from '../typedefs'
import { Region } from '../region'
import { Value, ProxyHelper } from '../proxy'

import { DirectiveHandler } from './generic'
import { ControlHelper, ControlItemInfo } from './control'

export interface EachCloneInfo{
    key: string | number;
    itemInfo: ControlItemInfo;
}

export interface EachOptions{
    clones: Array<EachCloneInfo> | Record<string, EachCloneInfo>;
    items: Array<any> | Record<string, any> | number;
    itemsTarget: Array<any> | Record<string, any> | number;
    count: number;
    path: string;
    rangeValue: number;
}

export class EachDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('each', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let info = ControlHelper.Init(region, element, directive.arg.options, (directive.arg.key === 'animate'), () => {
                empty(Region.Get(info.regionId));
            }, 'x-each'), isCount = false, isReverse = false;

            if (!info){
                return DirectiveHandlerReturn.Handled;
            }

            let scope = region.GetElementScope(info.template);
            if (!scope){
                region.GetState().ReportError('Failed to bind \'x-each\' to element');
                return DirectiveHandlerReturn.Handled;
            }
            
            if (directive.arg){
                isCount = directive.arg.options.includes('count');
                isReverse = directive.arg.options.includes('reverse');
            }

            let options: EachOptions = {
                clones: null,
                items: null,
                itemsTarget: null,
                count: 0,
                path: null,
                rangeValue: null,
            };

            let valueKey = '', matches = directive.value.match(/^(.+)? as[ ]+([A-Za-z_][0-9A-Za-z_$]*)[ ]*$/), expression: string, animate = (directive.arg.key === 'animate');
            if (matches && 2 < matches.length){
                expression = matches[1];
                valueKey = matches[2];
            }
            else{
                expression = directive.value;
            }

            let scopeId = region.GenerateDirectiveScopeId(null, '_each');
            let addSizeChange = (myRegion: IRegion) => {
                myRegion.GetChanges().AddComposed('count', scopeId);
            };

            let locals = (myRegion: IRegion, cloneInfo: EachCloneInfo) => {
                let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                Object.entries(scope.locals).forEach(([key, item]) => {//Forward locals
                    cloneScope.locals[key] = item;
                });

                cloneScope.locals['$each'] = DirectiveHandler.CreateProxy((prop) => {
                    let innerRegion = Region.Get(info.regionId);
                    if (prop === 'count'){
                        innerRegion.GetChanges().AddGetAccess(`${scopeId}.count`);
                        return options.count;
                    }
                    
                    if (prop === 'index'){
                        if (typeof cloneInfo.key === 'number'){
                            let myScope = innerRegion.AddElement(cloneInfo.itemInfo.clone);
                            innerRegion.GetChanges().AddGetAccess(`${scopeId}.${myScope.key}.index`);
                        }
                        
                        return cloneInfo.key;
                    }

                    if (prop === 'value'){
                        return options.items[cloneInfo.key];
                    }

                    if (prop === 'collection'){
                        return options.items;
                    }

                    if (prop === 'parent'){
                        return innerRegion.GetLocal(cloneInfo.itemInfo.clone.parentElement, '$each', true);
                    }

                    return null;
                }, ['count', 'index', 'value', 'collection', 'parent']);
                
                if (valueKey){
                    cloneScope.locals[valueKey] = new Value(() => {
                        return options.items[cloneInfo.key];
                    });
                }
            };

            let append = (myRegion: IRegion, key?: string | number) => {
                if (typeof key !== 'string'){
                    if (typeof key === 'number'){
                        for (let index = key; index < (options.clones as Array<EachCloneInfo>).length; ++index){
                            let cloneInfo = (options.clones as Array<EachCloneInfo>)[index], myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope){
                                ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            
                            ++(cloneInfo.key as number);
                        }
                    }
                    else{//Array
                        key = (options.clones as Array<EachCloneInfo>).length;
                    }

                    ControlHelper.InsertItem(myRegion, info, (itemInfo) => {
                        if (key < (options.clones as Array<EachCloneInfo>).length){
                            (options.clones as Array<EachCloneInfo>).splice((key as number), 0, {
                                key : key,
                                itemInfo: itemInfo,
                            });
                        }
                        else{//Append
                            (options.clones as Array<EachCloneInfo>).push({
                                key : key,
                                itemInfo: itemInfo,
                            });
                        }
                        
                        locals(myRegion, (options.clones as Array<EachCloneInfo>)[key]);
                    }, key);
                }
                else{//Map
                    ControlHelper.InsertItem(myRegion, info, (itemInfo) => {
                        (options.clones as Record<string, EachCloneInfo>)[key] = {
                            key : key,
                            itemInfo: itemInfo,
                        };
                        locals(myRegion, (options.clones as Record<string, EachCloneInfo>)[key]);
                    }, Object.keys(options.items).indexOf(key));
                }
            };

            let empty = (myRegion: IRegion) => {
                if (!Array.isArray(options.clones)){
                    Object.keys((options.clones as Record<string, EachCloneInfo>) || {}).forEach((key) => {
                        let myInfo = (options.clones as Record<string, EachCloneInfo>)[key];
                        ControlHelper.RemoveItem(myInfo.itemInfo, info);
                    });
                }
                else{//Array
                    ((options.clones as Array<EachCloneInfo>) || []).forEach(myInfo => ControlHelper.RemoveItem(myInfo.itemInfo, info));
                }

                options.clones = null;
                options.path = null;
            };

            let getRange = (from: number, to: number) => {
                if (from < to){
                    return Array.from({length: (to - from)}, (value, key) => (key + from));
                }
                return Array.from({length: (from - to)}, (value, key) => (from - key));
            };

            let arrayChangeHandler = (myRegion: IRegion, change: IChange, isOriginal: boolean) => {
                let removeRange = (myRegion: IRegion, index: number, count: number) => {
                    if (count <= 0){
                        return false;
                    }
                    
                    let max = ((options.clones as Array<EachCloneInfo>).length - (getTarget(DirectiveHandler.Evaluate(myRegion, element, expression)) as Array<any>).length);
                    if (max <= 0){//Nothing to remove
                        return false;
                    }

                    count = ((max < count) ? max : count);
                    (options.clones as Array<EachCloneInfo>).splice(index, count).forEach(myInfo => ControlHelper.RemoveItem(myInfo.itemInfo, info));

                    return count;
                };
                
                if (isOriginal){
                    if (change.path === `${options.path}.unshift.${change.prop}`){
                        let count = (Number.parseInt(change.prop) || 0);
                        
                        options.count += count;
                        addSizeChange(myRegion);

                        for (let index = 0; index < count; ++index){
                            append(myRegion, index);
                        }
                    }
                    else if (change.path === `${options.path}.shift.${change.prop}`){
                        let count = (Number.parseInt(change.prop) || 0);
                        if (!removeRange(myRegion, 0, count)){
                            return;
                        }
                        
                        options.count = (options.clones as Array<EachCloneInfo>).length;
                        addSizeChange(myRegion);

                        (options.clones as Array<EachCloneInfo>).forEach((cloneInfo) => {
                            let myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope){
                                ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            
                            (cloneInfo.key as number) -= count;
                        });
                    }
                    else if (change.path === `${options.path}.splice.${change.prop}`){
                        let parts = change.prop.split('.');//start.deleteCount.itemsCount

                        let index = (Number.parseInt(parts[0]) || 0);
                        let itemsCount = (Number.parseInt(parts[2]) || 0);
                        
                        let removedCount = removeRange(myRegion, index, (Number.parseInt(parts[1]) || 0));
                        for (let i = index; i < (itemsCount + index); ++i){
                            append(myRegion, i);
                        }
                        
                        options.count = (options.clones as Array<EachCloneInfo>).length;
                        addSizeChange(myRegion);

                        for (let i = (index + itemsCount); i < (options.clones as Array<EachCloneInfo>).length; ++i){
                            let cloneInfo = (options.clones as Array<EachCloneInfo>)[i], myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope){
                                ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            
                            (cloneInfo.key as number) -= ((removedCount === false) ? 0 : removedCount);
                        }
                    }
                    else if (change.path === `${options.path}.push.${change.prop}`){
                        let count = (Number.parseInt(change.prop) || 0);
                        
                        options.count += count;
                        addSizeChange(myRegion);

                        for (let index = 0; index < count; ++index){
                            append(myRegion);
                        }
                    }
                    
                    if (change.path !== `${options.path}.${change.prop}`){
                        return;
                    }
                }
                
                let index = ((change.prop === 'length') ? null : Number.parseInt(change.prop));
                if (!index && index !== 0){//Not an index
                    return;
                }
                
                if (change.type === 'set' && (options.clones as Array<EachCloneInfo>).length <= index){//Element added
                    ++options.count;
                    addSizeChange(myRegion);
                    append(myRegion);
                }
                else if (change.type === 'delete' && index < (options.clones as Array<EachCloneInfo>).length){
                    (options.clones as Array<EachCloneInfo>).splice(index, 1).forEach((myInfo) => {
                        --options.count;
                        addSizeChange(myRegion);
                        ControlHelper.RemoveItem(myInfo.itemInfo, info);
                    });
                }
            };

            let mapChangeHandler = (myRegion: IRegion, change: IChange, isOriginal: boolean) => {
                if (isOriginal && change.path !== `${options.path}.${change.prop}`){
                    return;
                }
                
                let key = change.prop;
                if (change.type === 'set' && !(key in (options.clones as Record<string, EachCloneInfo>))){//Element added
                    ++options.count;
                    addSizeChange(myRegion);
                    append(myRegion, key);
                }
                else if (change.type === 'delete' && (key in (options.clones as Record<string, EachCloneInfo>))){
                    --options.count;
                    addSizeChange(myRegion);
                    
                    let myInfo = (options.clones as Record<string, EachCloneInfo>)[key];
                    delete (options.clones as Record<string, EachCloneInfo>)[key];
                    
                    ControlHelper.RemoveItem(myInfo.itemInfo, info);
                }
            };

            let changeHandler: (myRegion: IRegion, change: IChange, isOriginal: boolean) => void, getTarget = (target: any) => {
                return (((Array.isArray(target) || Region.IsObject(target)) && ('__InlineJS_Target__' in target)) ? target['__InlineJS_Target__'] : target);
            };

            let initOptions = (target: any, count: number, handler: (myRegion: IRegion, change: IChange, isOriginal: boolean) => void, createClones: () => any) => {
                if (Region.IsObject(target) && '__InlineJS_Path__' in target){
                    options.path = target['__InlineJS_Path__'];
                }

                options.items = target;
                options.itemsTarget = getTarget(target);
                options.count = count;
                options.clones = createClones();

                changeHandler = handler;
            };

            let init = (myRegion: IRegion, target: any) => {
                let isRange = (typeof target === 'number' && Number.isInteger(target));
                if (isRange && !isReverse && options.rangeValue !== null && target <= options.count){//Range value decrement
                    let diff = (options.count - target);
                    if (0 < diff){
                        options.count = target;
                        addSizeChange(myRegion);
                        
                        (options.items as Array<any>).splice(target, diff);
                        (options.clones as Array<EachCloneInfo>).splice(target, diff).forEach(myInfo => ControlHelper.RemoveItem(myInfo.itemInfo, info));
                    }
                    
                    return true;
                }
                
                if (!isRange || isReverse || options.rangeValue === null){
                    empty(myRegion);
                }
                
                if (isRange){
                    let offset = (isCount ? 1 : 0), items: Array<number>;
                    if (target < 0){
                        items = (isReverse ? getRange((target - offset + 1), (1 - offset)) : getRange(-offset, (target - offset)));
                    }
                    else{
                        items = (isReverse ? getRange((target + offset - 1), (offset - 1)) : getRange(offset, (target + offset)));
                    }

                    if (!isReverse && options.rangeValue !== null){//Ranged value increment
                        let addedItems = items.splice(options.count);
                        
                        options.count = target;
                        addSizeChange(myRegion);

                        options.items = (options.items as Array<number>).concat(addedItems);
                        addedItems.forEach(item => append(myRegion));

                        options.rangeValue = target;
                    }
                    else{
                        options.rangeValue = target;
                        initOptions(items, items.length, arrayChangeHandler, () => new Array<EachCloneInfo>());
                        items.forEach(item => append(myRegion));
                    }
                }
                else if (Array.isArray(target)){
                    let items = (getTarget(target) as Array<any>);

                    options.rangeValue = null;
                    initOptions(target, items.length, arrayChangeHandler, () => new Array<EachCloneInfo>());
                    items.forEach(item => append(myRegion));
                }
                else if (Region.IsObject(target)){
                    let keys = Object.keys(getTarget(target) as Record<string, any>);

                    options.rangeValue = null;
                    initOptions(target, keys.length, mapChangeHandler, () => ({}));
                    keys.forEach(key => append(myRegion, key));
                }

                return true;
            };

            let isListening = false, listen = () => {
                if (isListening){
                    return;
                }
                
                isListening = true;
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = Region.Get(info.regionId), target = DirectiveHandler.Evaluate(myRegion, element, expression);
                    init(myRegion, target);
                }, (changes: Array<IChange | IBubbledChange>) => {
                    let myRegion = Region.Get(info.regionId);
                    changes.forEach((change) => {
                        if ('original' in change){//Bubbled change
                            if (changeHandler){
                                changeHandler(myRegion, change.original, true);
                            }
                        }
                        else if (change.type === 'set'){//Target changed
                            let target = DirectiveHandler.Evaluate(myRegion, element, expression);
                            if (getTarget(target) !== options.itemsTarget){
                                init(myRegion, target);
                            }
                        }
                        else if (change.type === 'delete' && change.path === options.path){//Item deleted
                            if (changeHandler){
                                changeHandler(myRegion, change, false);
                            }
                        }
                    });
    
                    return true;
                }, null);
            };

            let ifConditionCalled = false, onIfConditionChange = (isTrue: boolean) => {
                ifConditionCalled = true;
                if (isTrue){
                    if (isListening){
                        let myRegion = Region.Get(info.regionId), target = DirectiveHandler.Evaluate(myRegion, element, expression);
                        init(myRegion, target);
                    }
                    else{//Bind changes
                        listen();
                    }
                }
                else{
                    empty(Region.Get(info.regionId));
                }
            };

            if (!scope.ifConditionChange){//Listen for if condition change
                (scope.ifConditionChange = new Array<(isTrue: boolean) => void>()).push(onIfConditionChange);
                scope.postProcessCallbacks.push(() => {
                    if (!ifConditionCalled){
                        listen();
                    }
                });
            }
            else{//Bind changes
                scope.ifConditionChange.push(onIfConditionChange);
            }
            
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}