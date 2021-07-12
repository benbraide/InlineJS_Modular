"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenGlobalHandler = exports.ScreenDirectiveHandler = void 0;
const typedefs_1 = require("../typedefs");
const generic_1 = require("../directives/extended/generic");
const generic_2 = require("./generic");
const region_1 = require("../region");
class ScreenDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor(screen) {
        super(screen.GetKey(), (region, element, directive) => {
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
exports.ScreenDirectiveHandler = ScreenDirectiveHandler;
class ScreenGlobalHandler extends generic_2.GlobalHandler {
    constructor(animator_ = null, debounce_ = 250) {
        super('screen', () => {
            let position = ScreenGlobalHandler.GetScrollPosition(), size = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            this.properties_ = {
                size: size,
                breakpoint: ScreenGlobalHandler.ComputeBreakpoint(size.width),
                scrollPosition: position,
                scrollPercentage: ScreenGlobalHandler.ComputePercentage(position),
                scrollDirection: {
                    x: 'none',
                    y: 'none',
                },
                scrollDirectionOffset: {
                    x: 0,
                    y: 0,
                },
            };
            this.methods_ = {
                scroll: (from, to, animate) => {
                    ScreenGlobalHandler.Scroll(from, to, this, animate);
                },
                scrollTo: (to, animate) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, to, this, animate);
                },
                scrollTop: (animate) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: -1, y: 0 }, this, animate);
                },
                scrollRight: (animate) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: document.body.scrollWidth, y: -1 }, this, animate);
                },
                scrollBottom: (animate) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: -1, y: document.body.scrollHeight }, this, animate);
                },
                scrollLeft: (animate) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: 0, y: -1 }, this, animate);
                },
            };
            this.resizeEventHandler_ = () => {
                if (this.debounce_ && !this.scheduledResize_) {
                    this.scheduledResize_ = true;
                    setTimeout(() => {
                        this.scheduledResize_ = false;
                        this.HandleResize_();
                    }, this.debounce_);
                }
                else if (!this.debounce_) {
                    this.HandleResize_();
                }
            };
            this.scrollEventHandler_ = () => {
                if (this.debounce_ && !this.scheduledScroll_) {
                    this.scheduledScroll_ = true;
                    setTimeout(() => {
                        this.scheduledScroll_ = false;
                        this.HandleScroll_();
                    }, this.debounce_);
                }
                else if (!this.debounce_) {
                    this.HandleScroll_();
                }
            };
            return region_1.Region.CreateProxy((prop) => {
                if (prop === 'breakpoint') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_.breakpoint[0];
                }
                if (prop === 'checkpoint') {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_.breakpoint[1];
                }
                if (prop in this.properties_) {
                    generic_2.GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_[prop];
                }
                if (prop in this.methods_) {
                    return this.methods_[prop];
                }
            }, [...Object.keys(this.properties_), ...Object.keys(this.methods_), 'checkpoint']);
        }, null, null, () => {
            region_1.Region.GetDirectiveManager().AddHandler(new ScreenDirectiveHandler(this));
            window.addEventListener('resize', this.resizeEventHandler_, { passive: true });
            window.addEventListener('scroll', this.scrollEventHandler_, { passive: true });
        }, () => {
            window.removeEventListener('scroll', this.scrollEventHandler_);
            window.removeEventListener('resize', this.resizeEventHandler_);
            region_1.Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
        this.animator_ = animator_;
        this.debounce_ = debounce_;
        this.scheduledResize_ = false;
        this.scheduledScroll_ = false;
        this.resizeEventHandler_ = null;
        this.scrollEventHandler_ = null;
        this.scopeId_ = generic_2.GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
    HandleResize_() {
        generic_2.GlobalHandler.region_.GetChanges().AddComposed('size', this.scopeId_);
        this.properties_.size.width = window.innerWidth;
        this.properties_.size.height = window.innerHeight;
        let breakpoint = ScreenGlobalHandler.ComputeBreakpoint(this.properties_.size.width);
        if (breakpoint[0] !== this.properties_.breakpoint[0]) {
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('breakpoint', this.scopeId_);
            this.properties_.breakpoint[0] = breakpoint[0];
            window.dispatchEvent(new CustomEvent(`${this.key_}.breakpoint`, {
                detail: breakpoint[0],
            }));
        }
        if (breakpoint[1] !== this.properties_.breakpoint[1]) {
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('checkpoint', this.scopeId_);
            this.properties_.breakpoint[1] = breakpoint[1];
            window.dispatchEvent(new CustomEvent(`${this.key_}.checkpoint`, {
                detail: breakpoint[1],
            }));
        }
    }
    HandleScroll_() {
        let position = ScreenGlobalHandler.GetScrollPosition();
        if (position.x == this.properties_.scrollPosition.x && position.y == this.properties_.scrollPosition.y) {
            return;
        }
        let offset = {
            x: ((document.documentElement.scrollWidth || document.body.scrollWidth) - (document.documentElement.clientWidth || document.body.clientWidth)),
            y: ((document.documentElement.scrollHeight || document.body.scrollHeight) - (document.documentElement.clientHeight || document.body.clientHeight)),
        };
        let percentage = {
            x: ((offset.x <= 0) ? 0 : ((position.x / offset.x) * 100)),
            y: ((offset.y <= 0) ? 0 : ((position.y / offset.y) * 100)),
        };
        let direction, directionOffset;
        if (percentage.x < this.properties_.scrollPercentage.x) {
            direction.x = 'left';
            directionOffset.x = (this.properties_.scrollPercentage.x - percentage.x);
        }
        else if (this.properties_.scrollPercentage.x < percentage.x) {
            direction.x = 'right';
            directionOffset.x = (percentage.x - this.properties_.scrollPercentage.x);
        }
        else {
            direction.x = 'none';
            directionOffset.x = 0;
        }
        if (percentage.y < this.properties_.scrollPercentage.y) {
            direction.y = 'up';
            directionOffset.y = (this.properties_.scrollPercentage.y - percentage.y);
        }
        else if (this.properties_.scrollPercentage.y < percentage.y) {
            direction.y = 'down';
            directionOffset.y = (percentage.y - this.properties_.scrollPercentage.y);
        }
        else {
            direction.y = 'none';
            directionOffset.y = 0;
        }
        if (this.properties_.scrollDirection.x != direction.x || this.properties_.scrollDirection.y != direction.y) {
            if (this.properties_.scrollDirection.x != direction.x) {
                this.properties_.scrollDirection.x = direction.x;
                this.properties_.scrollDirectionOffset.x = directionOffset.x;
            }
            else {
                this.properties_.scrollDirectionOffset.x += directionOffset.x;
            }
            if (this.properties_.scrollDirection.y != direction.y) {
                this.properties_.scrollDirection.y = direction.y;
                this.properties_.scrollDirectionOffset.y = directionOffset.y;
            }
            else {
                this.properties_.scrollDirectionOffset.y += directionOffset.y;
            }
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('scrollDirection', this.scopeId_);
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('scrollDirectionOffset', this.scopeId_);
            window.dispatchEvent(new CustomEvent(`${this.key_}.direction`, {
                detail: { x: direction.x, y: direction.y },
            }));
            window.dispatchEvent(new CustomEvent(`${this.key_}.direction.offset`, {
                detail: { x: directionOffset.x, y: directionOffset.y },
            }));
        }
        else if (directionOffset.x != 0 || directionOffset.y != 0) {
            this.properties_.scrollDirectionOffset.x += directionOffset.x;
            this.properties_.scrollDirectionOffset.y += directionOffset.y;
            generic_2.GlobalHandler.region_.GetChanges().AddComposed('scrollDirectionOffset', this.scopeId_);
            window.dispatchEvent(new CustomEvent('screen.direction.offset', {
                detail: { x: directionOffset.x, y: directionOffset.y },
            }));
        }
        generic_2.GlobalHandler.region_.GetChanges().AddComposed('scrollPosition', this.scopeId_);
        generic_2.GlobalHandler.region_.GetChanges().AddComposed('scrollPercentage', this.scopeId_);
        window.dispatchEvent(new CustomEvent(`${this.key_}.percentage`, {
            detail: { x: percentage.x, y: percentage.y },
        }));
    }
    static ComputeBreakpoint(width) {
        if (width < 576) { //Extra small
            return ['xs', 0];
        }
        if (width < 768) { //Small
            return ['sm', 1];
        }
        if (width < 992) { //Medium
            return ['md', 2];
        }
        if (width < 1200) { //Large
            return ['lg', 3];
        }
        if (width < 1400) { //Extra large
            return ['xl', 4];
        }
        return ['xxl', 5]; //Extra extra large
    }
    static GetScrollPosition() {
        return {
            x: (window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
            y: (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
        };
    }
    static ComputePercentage(position) {
        return {
            x: ((document.body.scrollWidth <= 0) ? 0 : ((position.x / document.body.scrollWidth) * 100)),
            y: ((document.body.scrollHeight <= 0) ? 0 : ((position.y / document.body.scrollHeight) * 100)),
        };
    }
    static Scroll(from, to, handler, animate) {
        let position = ScreenGlobalHandler.GetScrollPosition();
        if (from.x < 0) {
            from.x = position.x;
        }
        if (to.x < 0) {
            to.x = position.x;
        }
        if (from.y < 0) {
            from.y = position.y;
        }
        if (to.y < 0) {
            to.y = position.y;
        }
        if (animate && handler && !handler.animator_) {
            if (from.x != position.x || from.y != position.y) {
                window.scrollTo(from.x, from.y);
                setTimeout(() => {
                    window.scrollTo({
                        left: to.x,
                        top: to.y,
                        behavior: 'smooth',
                    });
                }, 0);
            }
            else { //Scroll from current
                window.scrollTo({
                    left: to.x,
                    top: to.y,
                    behavior: 'smooth',
                });
            }
        }
        else if (animate && handler) {
        }
        else if (from.x != position.x || from.y != position.y) {
            window.scrollTo(from.x, from.y);
            setTimeout(() => {
                window.scrollTo(to.x, to.y);
            }, 0);
        }
        else { //Scroll from current
            window.scrollTo(to.x, to.y);
        }
    }
}
exports.ScreenGlobalHandler = ScreenGlobalHandler;