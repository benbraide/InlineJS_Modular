import { DirectiveHandlerReturn } from '../../typedefs';
import { IntersectionObserver } from '../../observers/intersection';
import { Fetch } from '../../utilities/fetch';
import { Region } from '../../region';
import { ExtendedDirectiveHandler } from './generic';
export class XHRHelper {
    static BindFetch(options) {
        options.publicProps = (options.publicProps || ['url', 'mode']);
        let regionId = options.region.GetId(), scopeId = options.region.GenerateDirectiveScopeId(null, `_${options.key}`), state = {
            active: false,
            loaded: false,
            loads: 0,
            progress: 0,
            data: (options.formatData ? options.formatData(null) : null),
        };
        let methods = {
            reload: () => {
                if (fetch) {
                    fetch.Reload();
                }
            },
        };
        let setState = (key, value) => {
            if (key in state && !Region.IsEqual(state[key], value)) {
                state[key] = value;
                Region.Get(regionId).GetChanges().AddComposed(key, scopeId);
            }
        };
        let target = (options.expressionElement || options.element);
        let fetch = new Fetch(null, options.element, {
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
                    data = options.formatData(data);
                }
                if (!options.element) {
                    setState('data', data);
                }
                if (target) {
                    target.dispatchEvent(new CustomEvent(`${options.key}.error`, {
                        detail: { data: (options.element ? null : data) },
                    }));
                }
                if (options.onLoad) {
                    let myRegion = Region.Get(regionId);
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
            onProgress: (e) => {
                if (e.lengthComputable) {
                    setState('progress', ((e.loaded / e.total) * 100));
                }
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
                Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                if (prop in state) {
                    return state[prop];
                }
            },
            onPropSet: (prop) => {
                Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
            },
        });
        if (options.expression && target) { //Bind expression
            let elementScope = options.region.AddElement(target, true), lazyUrl = null;
            fetch.Watch(options.region);
            elementScope.locals['$xhr'] = fetch.props;
            elementScope.uninitCallbacks.push(() => {
                fetch.EndWatch();
            });
            if (options.lazy) {
                if (options.element) {
                    let intersectionOptions = {
                        root: ((options.ancestor == -1) ? null : options.region.GetElementAncestor(options.element, options.ancestor)),
                    };
                    options.region.GetIntersectionObserverManager().Add(options.element, IntersectionObserver.BuildOptions(intersectionOptions)).Start(() => {
                        if (fetch) {
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
                let myRegion = Region.Get(regionId);
                if (!myRegion) {
                    return false;
                }
                let url = ExtendedDirectiveHandler.Evaluate(myRegion, target, options.expression), reload = false;
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
}
export class XHRDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('xhr', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            let lazy = false, ancestor = -1;
            if (directive.arg.options.includes('lazy')) {
                let ancestorIndex = directive.arg.options.indexOf('ancestor');
                if (ancestorIndex != -1) { //Resolve ancestor
                    ancestor = (((ancestorIndex + 1) < directive.arg.options.length) ? (parseInt(directive.arg.options[ancestorIndex + 1]) || 0) : 0);
                }
            }
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                element: element,
                lazy: lazy,
                ancestor: ancestor,
            });
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class JSONDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('json', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            XHRHelper.BindFetch({
                region: region,
                key: this.key_,
                expression: directive.value,
                expressionElement: element,
                formatData: (data) => {
                    if (!data) {
                        return {};
                    }
                    try {
                        return JSON.parse(data);
                    }
                    catch (_a) { }
                    return {};
                }
            });
            return DirectiveHandlerReturn.Handled;
        });
    }
}
