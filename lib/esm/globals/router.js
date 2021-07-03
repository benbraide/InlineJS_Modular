import { DirectiveHandlerReturn } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
import { Region } from '../region';
export class RouterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(router) {
        super(router.GetKey(), (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return DirectiveHandlerReturn.Handled;
            }
            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'breakpoint') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.breakpoint`);
            }
            if (directive.arg.key === 'checkpoint') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.checkpoint`);
            }
            if (directive.arg.key === 'direction' || directive.arg.key === 'scrollDirection') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction`);
            }
            if (directive.arg.key === 'directionOffset' || directive.arg.key === 'scrollDirectionOffset') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction.offset`);
            }
            if (directive.arg.key === 'percentage' || directive.arg.key === 'scrollPercentage') {
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.percentage`);
            }
            return DirectiveHandlerReturn.Handled;
        });
    }
}
export class RegisterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.register`, (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load');
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            let elementScope = region.AddElement(element);
            if (!elementScope) {
                return DirectiveHandlerReturn.Handled;
            }
            let info = {
                path: '',
                name: null,
                title: null,
                middleware: null,
                onLoad: null,
            };
            let data = ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
            if (Region.IsObject(info)) {
                Object.entries(data).forEach(([key, value]) => {
                    if (key in info) {
                        info[key] = value;
                    }
                });
            }
            else if (typeof data === 'string') {
                info.path = data;
            }
            let id = this.router_.Register(info);
            elementScope.uninitCallbacks.push(() => {
                this.router_.Unregister(id);
            });
            info.onLoad = (reloaded) => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.load`, {
                    detail: {
                        reloaded: reloaded,
                    },
                }));
            };
            return DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
    }
}
export class RouterGlobalHandler extends GlobalHandler {
    constructor() {
        super('router', () => { }, null, null, () => {
            Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this));
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
    Register(page) {
        return 0;
    }
    Unregister(id) { }
}
