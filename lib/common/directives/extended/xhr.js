"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONDirectiveHandler = exports.XHRDirectiveHandler = exports.XHRHelper = void 0;
const typedefs_1 = require("../../typedefs");
const intersection_1 = require("../../observers/intersection");
const fetch_1 = require("../../utilities/fetch");
const region_1 = require("../../region");
const generic_1 = require("./generic");
class XHRHelper {
    static BindFetch(options) {
        options.publicProps = (options.publicProps || ['url', 'mode']);
        let regionId = options.region.GetId(), scopeId = options.region.GenerateDirectiveScopeId(null, `_${options.key}`), state = {
            active: false,
            loaded: false,
            loads: 0,
            progress: 0,
            data: (options.formatData ? options.formatData(null, options.fetchMode) : null),
        };
        let methods = {
            reload: () => {
                if (fetch) {
                    fetch.Reload();
                }
            },
            stop: () => {
                fetch.EndWatch();
            },
            unbind: () => {
                fetch.Destroy();
                fetch = null;
            },
        };
        let setState = (key, value) => {
            if (key in state && !region_1.Region.IsEqual(state[key], value)) {
                state[key] = value;
                region_1.Region.Get(regionId).GetChanges().AddComposed(key, scopeId);
            }
        };
        let target = (options.element || options.expressionElement);
        let fetch = new fetch_1.Fetch(null, options.element, {
            onBeforeRequest: () => {
                setState('active', true);
                setState('progress', 0);
            },
            onLoad: (data) => {
                setState('active', false);
                setState('loaded', true);
                setState('loads', (state.loads + 1));
                setState('progress', 100);
                if (options.formatData) {
                    data = options.formatData(data, options.fetchMode);
                }
                if (!options.element) {
                    if (options.setData) {
                        let response = options.setData(state, data, options.fetchMode, regionId, scopeId);
                        if (response === true) {
                            region_1.Region.Get(regionId).GetChanges().AddComposed('data', scopeId);
                        }
                        else if (response !== false) {
                            setState('data', data);
                        }
                    }
                    else {
                        setState('data', data);
                    }
                }
                if (target) {
                    target.dispatchEvent(new CustomEvent(`${options.key}.load`, {
                        detail: { data: (options.element ? null : data) },
                    }));
                }
                if (options.onLoad) {
                    let myRegion = region_1.Region.Get(regionId);
                    if (myRegion) {
                        options.onLoad(myRegion, data);
                    }
                }
            },
            onError: (err) => {
                setState('active', false);
                setState('progress', 100);
                if (target) {
                    target.dispatchEvent(new CustomEvent(`${options.key}.error`, {
                        detail: { error: err },
                    }));
                }
                if (options.onError) {
                    options.onError(err);
                }
            },
            onProgress: (value) => {
                setState('progress', value);
            },
            onEmptyMount: () => {
                if (target) {
                    target.dispatchEvent(new CustomEvent(`${options.key}.unload`));
                }
            },
            onBeforePropGet: (prop) => {
                return (!options.publicProps || options.publicProps.includes(prop) || prop in state || prop in methods);
            },
            onBeforePropSet: (prop) => {
                return (!options.publicProps || options.publicProps.includes(prop));
            },
            onPropGet: (prop) => {
                if (prop in methods) {
                    return methods[prop];
                }
                region_1.Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                if (prop in state) {
                    return state[prop];
                }
            },
            onPropSet: (prop) => {
                region_1.Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
            },
        }, (options.fetchMode || fetch_1.FetchMode.Replace));
        if (options.expression && target) { //Bind expression
            let elementScope = options.region.AddElement(target, true), lazyUrl = null;
            fetch.Watch(options.region);
            elementScope.locals[`$${options.key}`] = fetch.props;
            elementScope.uninitCallbacks.push(() => {
                methods.unbind();
            });
            if (options.lazy) {
                if (options.element) {
                    let intersectionOptions = {
                        root: ((options.ancestor == -1) ? null : options.region.GetElementAncestor(options.element, options.ancestor)),
                    };
                    options.region.GetIntersectionObserverManager().Add(options.element, intersection_1.IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry) => {
                        if (entry.isIntersecting && fetch) {
                            fetch.props.url = lazyUrl;
                            options.lazy = false;
                        }
                    });
                }
                else { //Element is required
                    options.lazy = false;
                }
            }
            options.region.GetState().TrapGetAccess(() => {
                if (!fetch) {
                    return false;
                }
                let myRegion = region_1.Region.Get(regionId);
                if (!myRegion) {
                    return false;
                }
                let url = generic_1.ExtendedDirectiveHandler.Evaluate(myRegion, target, options.expression);
                if (typeof url === 'string' || url === null) {
                    if (options.lazy) {
                        lazyUrl = url;
                    }
                    else { //Update fetch
                        fetch.props.url = url;
                    }
                }
            }, true, target);
        }
    }
    static ExtractFetchMode(options) {
        if (options.includes('append')) {
            return fetch_1.FetchMode.Append;
        }
        return (options.includes('prepend') ? fetch_1.FetchMode.Prepend : fetch_1.FetchMode.Replace);
    }
}
exports.XHRHelper = XHRHelper;
class XHRDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('xhr', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let lazy = false, ancestor = -1;
            if (directive.arg.options.includes('lazy')) {
                let ancestorIndex = directive.arg.options.indexOf('ancestor');
                if (ancestorIndex != -1) { //Resolve ancestor
                    ancestor = (((ancestorIndex + 1) < directive.arg.options.length) ? (parseInt(directive.arg.options[ancestorIndex + 1]) || 0) : 0);
                }
                lazy = true;
            }
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                element: element,
                lazy: lazy,
                ancestor: ancestor,
                fetchMode: XHRHelper.ExtractFetchMode(directive.arg.options),
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.XHRDirectiveHandler = XHRDirectiveHandler;
class JSONDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('json', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let options = {
                raw: false,
                array: false,
                number: false,
            };
            directive.arg.options.forEach((option) => {
                if (option in options) {
                    options[option] = true;
                }
            });
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                expressionElement: element,
                fetchMode: XHRHelper.ExtractFetchMode(directive.arg.options),
                formatData: (data, mode) => {
                    if (!data) {
                        if (options.raw) {
                            return '';
                        }
                        if (options.array) {
                            return [];
                        }
                        if (options.number) {
                            return 0;
                        }
                        return ((mode === fetch_1.FetchMode.Replace) ? {} : []);
                    }
                    if (options.raw) {
                        return region_1.Region.ToString(data);
                    }
                    if (options.number) {
                        return (parseFloat(data) || 0);
                    }
                    try {
                        return JSON.parse(data);
                    }
                    catch (_a) { }
                    return ((!options.array && mode === fetch_1.FetchMode.Replace) ? {} : []);
                },
                setData: (state, value, mode, regionId, scopeId) => {
                    if (mode !== fetch_1.FetchMode.Replace) { //Add to array
                        if (Array.isArray(value)) {
                            if (mode === fetch_1.FetchMode.Append) {
                                region_1.Region.Get(regionId).GetChanges().AddComposed(`${value.length}`, `${scopeId}.data.push`, `${scopeId}.items`);
                                state.data.push(...value);
                            }
                            else { //Prepend
                                region_1.Region.Get(regionId).GetChanges().AddComposed(`${value.length}`, `${scopeId}.data.unshift`, `${scopeId}.items`);
                                state.data.unshift(...value);
                            }
                        }
                        else if (mode === fetch_1.FetchMode.Append) {
                            region_1.Region.Get(regionId).GetChanges().AddComposed('1', `${scopeId}.data.push`, `${scopeId}.items`);
                            state.data.push(value);
                        }
                        else { //Prepend
                            region_1.Region.Get(regionId).GetChanges().AddComposed('1', `${scopeId}.data.unshift`, `${scopeId}.items`);
                            state.data.unshift(value);
                        }
                    }
                    else { //Replace
                        state.data = value;
                    }
                    return true;
                },
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.JSONDirectiveHandler = JSONDirectiveHandler;
