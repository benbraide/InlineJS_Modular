"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterGlobalHandler = exports.RegisterDirectiveHandler = exports.RouterDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const generic_1 = require("../directives/extended/generic");
const generic_2 = require("./generic");
const region_1 = require("../region");
class RouterDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router) {
        super(router.GetKey(), (region, element, directive) => {
            if (!directive.arg || !directive.arg.key) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            directive.arg.key = region_1.Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
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
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.RouterDirectiveHandler = RouterDirectiveHandler;
class RegisterDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(router_) {
        super(`${router_.GetKey()}.register`, (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load');
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let elementScope = region.AddElement(element);
            if (!elementScope) {
                return typedefs_1.DirectiveHandlerReturn.Handled;
            }
            let info = {
                path: '',
                name: null,
                title: null,
                middleware: null,
                onLoad: null,
            };
            let data = generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value);
            if (region_1.Region.IsObject(info)) {
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
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
        this.router_ = router_;
    }
}
exports.RegisterDirectiveHandler = RegisterDirectiveHandler;
class RouterGlobalHandler extends generic_2.GlobalHandler {
    constructor() {
        super('router', () => { }, null, null, () => {
            region_1.Region.GetDirectiveManager().AddHandler(new RouterDirectiveHandler(this));
        }, () => {
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
        this.scopeId_ = generic_2.GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
    Register(page) {
        return 0;
    }
    Unregister(id) { }
}
exports.RouterGlobalHandler = RouterGlobalHandler;
