"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EachDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const region_1 = require("../region");
const proxy_1 = require("../proxy");
const generic_1 = require("./generic");
const control_1 = require("./control");
class EachDirectiveHandler extends generic_1.DirectiveHandler {
    constructor() {
        super('each', (region, element, directive) => {
            let info = control_1.ControlHelper.Init(region, element, directive.arg.options, (directive.arg.key === 'animate'), () => {
                empty(region_1.Region.Get(info.regionId));
            }, 'x-each'), isCount = false, isReverse = false;
            if (!info) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let scope = region.GetElementScope(info.template);
            if (!scope) {
                region.GetState().ReportError('Failed to bind \'x-each\' to element');
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            if (directive.arg) {
                isCount = directive.arg.options.includes('count');
                isReverse = directive.arg.options.includes('reverse');
            }
            let options = {
                clones: null,
                items: null,
                itemsTarget: null,
                count: 0,
                path: null,
                rangeValue: null,
            };
            let valueKey = '', matches = directive.value.match(/^(.+)? as[ ]+([A-Za-z_][0-9A-Za-z_$]*)[ ]*$/), expression, animate = (directive.arg.key === 'animate');
            if (matches && 2 < matches.length) {
                expression = matches[1];
                valueKey = matches[2];
            }
            else {
                expression = directive.value;
            }
            let scopeId = region.GenerateDirectiveScopeId(null, '_each');
            let addSizeChange = (myRegion) => {
                myRegion.GetChanges().AddComposed('count', scopeId);
            };
            let locals = (myRegion, cloneInfo) => {
                let scope = myRegion.GetElementScope(info.template), cloneScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                Object.entries(scope.locals).forEach(([key, item]) => {
                    cloneScope.locals[key] = item;
                });
                cloneScope.locals['$each'] = generic_1.DirectiveHandler.CreateProxy((prop) => {
                    let innerRegion = region_1.Region.Get(info.regionId);
                    if (prop === 'count') {
                        innerRegion.GetChanges().AddGetAccess(`${scopeId}.count`);
                        return options.count;
                    }
                    if (prop === 'index') {
                        if (typeof cloneInfo.key === 'number') {
                            let myScope = innerRegion.AddElement(cloneInfo.itemInfo.clone);
                            innerRegion.GetChanges().AddGetAccess(`${scopeId}.${myScope.key}.index`);
                        }
                        return cloneInfo.key;
                    }
                    if (prop === 'value') {
                        return options.items[cloneInfo.key];
                    }
                    if (prop === 'collection') {
                        return options.items;
                    }
                    if (prop === 'parent') {
                        return innerRegion.GetLocal(cloneInfo.itemInfo.clone.parentElement, '$each', true);
                    }
                    return null;
                }, ['count', 'index', 'value', 'collection', 'parent']);
                if (valueKey) {
                    cloneScope.locals[valueKey] = new proxy_1.Value(() => {
                        return options.items[cloneInfo.key];
                    });
                }
            };
            let append = (myRegion, key) => {
                if (typeof key !== 'string') {
                    if (typeof key === 'number') {
                        for (let index = key; index < options.clones.length; ++index) {
                            let cloneInfo = options.clones[index], myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope) {
                                proxy_1.ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            ++cloneInfo.key;
                        }
                    }
                    else { //Array
                        key = options.clones.length;
                    }
                    control_1.ControlHelper.InsertItem(myRegion, info, (itemInfo) => {
                        if (key < options.clones.length) {
                            options.clones.splice(key, 0, {
                                key: key,
                                itemInfo: itemInfo,
                            });
                        }
                        else { //Append
                            options.clones.push({
                                key: key,
                                itemInfo: itemInfo,
                            });
                        }
                        locals(myRegion, options.clones[key]);
                    }, key);
                }
                else { //Map
                    control_1.ControlHelper.InsertItem(myRegion, info, (itemInfo) => {
                        options.clones[key] = {
                            key: key,
                            itemInfo: itemInfo,
                        };
                        locals(myRegion, options.clones[key]);
                    }, Object.keys(options.items).indexOf(key));
                }
            };
            let empty = (myRegion) => {
                if (!Array.isArray(options.clones)) {
                    Object.keys(options.clones || {}).forEach((key) => {
                        let myInfo = options.clones[key];
                        control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info);
                    });
                }
                else { //Array
                    (options.clones || []).forEach(myInfo => control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info));
                }
                options.clones = null;
                options.path = null;
            };
            let getRange = (from, to) => {
                if (from < to) {
                    return Array.from({ length: (to - from) }, (value, key) => (key + from));
                }
                return Array.from({ length: (from - to) }, (value, key) => (from - key));
            };
            let arrayChangeHandler = (myRegion, change, isOriginal) => {
                if (isOriginal) {
                    if (change.path === `${options.path}.unshift.${change.prop}`) {
                        let count = (Number.parseInt(change.prop) || 0);
                        options.count += count;
                        addSizeChange(myRegion);
                        for (let index = 0; index < count; ++index) {
                            append(myRegion, index);
                        }
                    }
                    else if (change.path === `${options.path}.shift.${change.prop}`) {
                        let count = (Number.parseInt(change.prop) || 0);
                        options.count -= count;
                        addSizeChange(myRegion);
                        options.clones.splice(0, count).forEach(myInfo => control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info));
                        options.clones.forEach((cloneInfo) => {
                            let myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope) {
                                proxy_1.ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            cloneInfo.key -= count;
                        });
                    }
                    else if (change.path === `${options.path}.splice.${change.prop}`) {
                        let parts = change.prop.split('.'); //start.deleteCount.itemsCount
                        let index = (Number.parseInt(parts[0]) || 0);
                        let itemsCount = (Number.parseInt(parts[2]) || 0);
                        let removedClones = options.clones.splice(index, (Number.parseInt(parts[1]) || 0));
                        removedClones.forEach(myInfo => control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info));
                        for (let i = index; i < (itemsCount + index); ++i) {
                            append(myRegion, i);
                        }
                        options.count += (itemsCount - removedClones.length);
                        addSizeChange(myRegion);
                        for (let i = (index + itemsCount); i < options.clones.length; ++i) {
                            let cloneInfo = options.clones[i], myScope = myRegion.GetElementScope(cloneInfo.itemInfo.clone);
                            if (myScope) {
                                proxy_1.ProxyHelper.AddChanges(myRegion.GetChanges(), 'set', `${scopeId}.${myScope.key}.index`, 'index');
                            }
                            cloneInfo.key -= removedClones.length;
                        }
                    }
                    else if (change.path === `${options.path}.push.${change.prop}`) {
                        let count = (Number.parseInt(change.prop) || 0);
                        options.count += count;
                        addSizeChange(myRegion);
                        for (let index = 0; index < count; ++index) {
                            append(myRegion);
                        }
                    }
                    if (change.path !== `${options.path}.${change.prop}`) {
                        return;
                    }
                }
                let index = ((change.prop === 'length') ? null : Number.parseInt(change.prop));
                if (!index && index !== 0) { //Not an index
                    return;
                }
                if (change.type === 'set' && options.clones.length <= index) { //Element added
                    ++options.count;
                    addSizeChange(myRegion);
                    append(myRegion);
                }
                else if (change.type === 'delete' && index < options.clones.length) {
                    options.clones.splice(index, 1).forEach((myInfo) => {
                        --options.count;
                        addSizeChange(myRegion);
                        control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info);
                    });
                }
            };
            let mapChangeHandler = (myRegion, change, isOriginal) => {
                if (isOriginal && change.path !== `${options.path}.${change.prop}`) {
                    return;
                }
                let key = change.prop;
                if (change.type === 'set' && !(key in options.clones)) { //Element added
                    ++options.count;
                    addSizeChange(myRegion);
                    append(myRegion, key);
                }
                else if (change.type === 'delete' && (key in options.clones)) {
                    --options.count;
                    addSizeChange(myRegion);
                    let myInfo = options.clones[key];
                    delete options.clones[key];
                    control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info);
                }
            };
            let changeHandler, getTarget = (target) => {
                return (((Array.isArray(target) || region_1.Region.IsObject(target)) && ('__InlineJS_Target__' in target)) ? target['__InlineJS_Target__'] : target);
            };
            let initOptions = (target, count, handler, createClones) => {
                if (region_1.Region.IsObject(target) && '__InlineJS_Path__' in target) {
                    options.path = target['__InlineJS_Path__'];
                }
                options.items = target;
                options.itemsTarget = getTarget(target);
                options.count = count;
                options.clones = createClones();
                changeHandler = handler;
            };
            let init = (myRegion, target) => {
                let isRange = (typeof target === 'number' && Number.isInteger(target));
                if (isRange && !isReverse && options.rangeValue !== null && target <= options.count) { //Range value decrement
                    let diff = (options.count - target);
                    if (0 < diff) {
                        options.count = target;
                        addSizeChange(myRegion);
                        options.items.splice(target, diff);
                        options.clones.splice(target, diff).forEach(myInfo => control_1.ControlHelper.RemoveItem(myInfo.itemInfo, info));
                    }
                    return true;
                }
                if (!isRange || isReverse || options.rangeValue === null) {
                    empty(myRegion);
                }
                if (isRange) {
                    let offset = (isCount ? 1 : 0), items;
                    if (target < 0) {
                        items = (isReverse ? getRange((target - offset + 1), (1 - offset)) : getRange(-offset, (target - offset)));
                    }
                    else {
                        items = (isReverse ? getRange((target + offset - 1), (offset - 1)) : getRange(offset, (target + offset)));
                    }
                    if (!isReverse && options.rangeValue !== null) { //Ranged value increment
                        let addedItems = items.splice(options.count);
                        options.count = target;
                        addSizeChange(myRegion);
                        options.items = options.items.concat(addedItems);
                        addedItems.forEach(item => append(myRegion));
                        options.rangeValue = target;
                    }
                    else {
                        options.rangeValue = target;
                        initOptions(items, items.length, arrayChangeHandler, () => new Array());
                        items.forEach(item => append(myRegion));
                    }
                }
                else if (Array.isArray(target)) {
                    let items = getTarget(target);
                    options.rangeValue = null;
                    initOptions(target, items.length, arrayChangeHandler, () => new Array());
                    items.forEach(item => append(myRegion));
                }
                else if (region_1.Region.IsObject(target)) {
                    let keys = Object.keys(getTarget(target));
                    options.rangeValue = null;
                    initOptions(target, keys.length, mapChangeHandler, () => ({}));
                    keys.forEach(key => append(myRegion, key));
                }
                return true;
            };
            let isListening = false, listen = () => {
                if (isListening) {
                    return;
                }
                isListening = true;
                info.subscriptions = region.GetState().TrapGetAccess(() => {
                    let myRegion = region_1.Region.Get(info.regionId), target = generic_1.DirectiveHandler.Evaluate(myRegion, element, expression);
                    init(myRegion, target);
                }, (changes) => {
                    let myRegion = region_1.Region.Get(info.regionId);
                    changes.forEach((change) => {
                        if ('original' in change) { //Bubbled change
                            if (changeHandler) {
                                changeHandler(myRegion, change.original, true);
                            }
                        }
                        else if (change.type === 'set') { //Target changed
                            let target = generic_1.DirectiveHandler.Evaluate(myRegion, element, expression);
                            if (getTarget(target) !== options.itemsTarget) {
                                init(myRegion, target);
                            }
                        }
                        else if (change.type === 'delete' && change.path === options.path) { //Item deleted
                            if (changeHandler) {
                                changeHandler(myRegion, change, false);
                            }
                        }
                    });
                    return true;
                }, null);
            };
            let ifConditionCalled = false, onIfConditionChange = (isTrue) => {
                ifConditionCalled = true;
                if (isTrue) {
                    if (isListening) {
                        let myRegion = region_1.Region.Get(info.regionId), target = generic_1.DirectiveHandler.Evaluate(myRegion, element, expression);
                        init(myRegion, target);
                    }
                    else { //Bind changes
                        listen();
                    }
                }
                else {
                    empty(region_1.Region.Get(info.regionId));
                }
            };
            if (!scope.ifConditionChange) { //Listen for if condition change
                (scope.ifConditionChange = new Array()).push(onIfConditionChange);
                scope.postProcessCallbacks.push(() => {
                    if (!ifConditionCalled) {
                        listen();
                    }
                });
            }
            else { //Bind changes
                scope.ifConditionChange.push(onIfConditionChange);
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        }, false);
    }
}
exports.EachDirectiveHandler = EachDirectiveHandler;