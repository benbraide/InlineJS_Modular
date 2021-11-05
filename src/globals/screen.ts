import { Point, Size, NamedDirection, IDirective, DirectiveHandlerReturn, IRegion, IAnimation } from '../typedefs'
import { ExtendedDirectiveHandler } from '../directives/extended/generic'
import { GlobalHandler } from './generic'
import { Region } from '../region'

export interface ScreenCheckpoints{
    name: string;
    value: number;
}

interface ScreenProperties{
    size: Size;
    breakpoint: [string, number];
    scrollPosition: Point;
    scrollPercentage: Point;
    scrollDirection: NamedDirection;
    scrollDirectionOffset: Point;
}

interface ScreenMethods{
    scroll: (from: Point, to: Point, animate?: boolean) => void;
    scrollTo: (to: Point, animate?: boolean) => void;
    scrollTop: (animate?: boolean) => void;
    scrollRight: (animate?: boolean) => void;
    scrollBottom: (animate?: boolean) => void;
    scrollLeft: (animate?: boolean) => void;
}

export class ScreenDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(screen: ScreenGlobalHandler){
        super(screen.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'breakpoint'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.breakpoint`);
            }

            if (directive.arg.key === 'checkpoint'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.checkpoint`);
            }

            if (directive.arg.key === 'direction' || directive.arg.key === 'scrollDirection'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction`);
            }

            if (directive.arg.key === 'directionOffset' || directive.arg.key === 'scrollDirectionOffset'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.direction.offset`);
            }

            if (directive.arg.key === 'percentage' || directive.arg.key === 'scrollPercentage'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.percentage`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class ScreenGlobalHandler extends GlobalHandler{
    private scopeId_: string;
    
    private properties_: ScreenProperties;
    private methods_: ScreenMethods;

    private scheduledResize_ = false;
    private scheduledScroll_ = false;
    
    private resizeEventHandler_: () => void = null;
    private scrollEventHandler_: () => void = null;
    
    public constructor(private checkpoints_: Array<ScreenCheckpoints> = null, private animator_: IAnimation = null, private debounce_ = 250){
        super('screen', null, null, () => {
            let position = ScreenGlobalHandler.GetScrollPosition(), size = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            
            this.properties_ = {
                size: size,
                breakpoint: this.ComputeBreakpoint_(size.width),
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
                scroll: (from: Point, to: Point, animate?: boolean) => {
                    ScreenGlobalHandler.Scroll(from, to, this, animate);
                },
                scrollTo: (to: Point, animate?: boolean) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, to, this, animate);
                },
                scrollTop: (animate?: boolean) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: -1, y: 0 }, this, animate);
                },
                scrollRight: (animate?: boolean) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: document.body.scrollWidth, y: -1 }, this, animate);
                },
                scrollBottom: (animate?: boolean) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: -1, y: document.body.scrollHeight }, this, animate);
                },
                scrollLeft: (animate?: boolean) => {
                    ScreenGlobalHandler.Scroll({ x: -1, y: -1 }, { x: 0, y: -1 }, this, animate);
                },
            };

            this.resizeEventHandler_ = () => {
                if (this.debounce_ && !this.scheduledResize_){
                    this.scheduledResize_ = true;
                    setTimeout(() => {
                        this.scheduledResize_ = false;
                        this.HandleResize_();
                    }, this.debounce_);
                }
                else if (!this.debounce_){
                    this.HandleResize_();
                }
            };

            this.scrollEventHandler_ = () => {
                if (this.debounce_ && !this.scheduledScroll_){
                    this.scheduledScroll_ = true;
                    setTimeout(() => {
                        this.scheduledScroll_ = false;
                        this.HandleScroll_();
                    }, this.debounce_);
                }
                else if (!this.debounce_){
                    this.HandleScroll_();
                }
            };
            
            window.addEventListener('resize', this.resizeEventHandler_, { passive: true });
            window.addEventListener('scroll', this.scrollEventHandler_, { passive: true });

            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'breakpoint'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_.breakpoint[0];
                }

                if (prop === 'checkpoint'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_.breakpoint[1];
                }
                
                if (prop in this.properties_){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.properties_[prop];
                }

                if (prop in this.methods_){
                    return this.methods_[prop];
                }
            }, [...Object.keys(this.properties_), ...Object.keys(this.methods_), 'breakpoint', 'checkpoint']);
            
            Region.GetDirectiveManager().AddHandler(new ScreenDirectiveHandler(this));
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
            window.removeEventListener('scroll', this.scrollEventHandler_);
            window.removeEventListener('resize', this.resizeEventHandler_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        if (!this.checkpoints_){
            this.checkpoints_ = [
                {
                    name: 'xs',
                    value: 576,
                },
                {
                    name: 'sm',
                    value: 768,
                },
                {
                    name: 'md',
                    value: 992,
                },
                {
                    name: 'lg',
                    value: 1200,
                },
                {
                    name: 'xl',
                    value: 1400,
                },
                {
                    name: 'xxl',
                    value: Number.MAX_SAFE_INTEGER,
                },
            ];
        }
        else{
            this.checkpoints_ = this.checkpoints_.sort((a, b) => ((a.value < b.value) ? -1 : ((a.value == b.value) ? 0 : 1)));
        }
    }

    private HandleResize_(){
        GlobalHandler.region_.GetChanges().AddComposed('size', this.scopeId_);

        this.properties_.size.width = window.innerWidth;
        this.properties_.size.height = window.innerHeight;

        let breakpoint = this.ComputeBreakpoint_(this.properties_.size.width);
        if (breakpoint[0] !== this.properties_.breakpoint[0]){
            GlobalHandler.region_.GetChanges().AddComposed('breakpoint', this.scopeId_);
            this.properties_.breakpoint[0] = breakpoint[0];

            window.dispatchEvent(new CustomEvent(`${this.key_}.breakpoint`, {
                detail: breakpoint[0],
            }));
        }

        if (breakpoint[1] !== this.properties_.breakpoint[1]){
            GlobalHandler.region_.GetChanges().AddComposed('checkpoint', this.scopeId_);
            this.properties_.breakpoint[1] = breakpoint[1];
            
            window.dispatchEvent(new CustomEvent(`${this.key_}.checkpoint`, {
                detail: breakpoint[1],
            }));
        }
    }

    private HandleScroll_(){
        let position = ScreenGlobalHandler.GetScrollPosition();
        if (position.x == this.properties_.scrollPosition.x && position.y == this.properties_.scrollPosition.y){
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

        let direction: NamedDirection = {
            x: 'none',
            y: 'none',
        };

        let directionOffset: Point = {
            x: 0,
            y: 0,
        };
        
        if (percentage.x < this.properties_.scrollPercentage.x){
            direction.x = 'left';
            directionOffset.x = (this.properties_.scrollPercentage.x - percentage.x);
        }
        else if (this.properties_.scrollPercentage.x < percentage.x){
            direction.x = 'right';
            directionOffset.x = (percentage.x - this.properties_.scrollPercentage.x);
        }
        else{
            direction.x = 'none';
            directionOffset.x = 0;
        }

        if (percentage.y < this.properties_.scrollPercentage.y){
            direction.y = 'up';
            directionOffset.y = (this.properties_.scrollPercentage.y - percentage.y);
        }
        else if (this.properties_.scrollPercentage.y < percentage.y){
            direction.y = 'down';
            directionOffset.y = (percentage.y - this.properties_.scrollPercentage.y);
        }
        else{
            direction.y = 'none';
            directionOffset.y = 0;
        }

        if (this.properties_.scrollDirection.x != direction.x || this.properties_.scrollDirection.y != direction.y){
            if (this.properties_.scrollDirection.x != direction.x){
                this.properties_.scrollDirection.x = direction.x;
                this.properties_.scrollDirectionOffset.x = directionOffset.x;
            }
            else{
                this.properties_.scrollDirectionOffset.x += directionOffset.x;
            }

            if (this.properties_.scrollDirection.y != direction.y){
                this.properties_.scrollDirection.y = direction.y;
                this.properties_.scrollDirectionOffset.y = directionOffset.y;
            }
            else{
                this.properties_.scrollDirectionOffset.y += directionOffset.y;
            }

            GlobalHandler.region_.GetChanges().AddComposed('scrollDirection', this.scopeId_);
            GlobalHandler.region_.GetChanges().AddComposed('scrollDirectionOffset', this.scopeId_);

            window.dispatchEvent(new CustomEvent(`${this.key_}.direction`, {
                detail: { x: direction.x, y: direction.y },
            }));

            window.dispatchEvent(new CustomEvent(`${this.key_}.direction.offset`, {
                detail: { x: directionOffset.x, y: directionOffset.y },
            }));
        }
        else if (directionOffset.x != 0 || directionOffset.y != 0){
            this.properties_.scrollDirectionOffset.x += directionOffset.x;
            this.properties_.scrollDirectionOffset.y += directionOffset.y;
            GlobalHandler.region_.GetChanges().AddComposed('scrollDirectionOffset', this.scopeId_);

            window.dispatchEvent(new CustomEvent('screen.direction.offset', {
                detail: { x: directionOffset.x, y: directionOffset.y },
            }));
        }

        this.properties_.scrollPosition = position;
        this.properties_.scrollPercentage = percentage;

        GlobalHandler.region_.GetChanges().AddComposed('scrollPosition', this.scopeId_);
        GlobalHandler.region_.GetChanges().AddComposed('scrollPercentage', this.scopeId_);

        window.dispatchEvent(new CustomEvent(`${this.key_}.percentage`, {
            detail: { x: percentage.x, y: percentage.y },
        }));
    }

    private ComputeBreakpoint_(width: number): [string, number]{
        for (let index = 0; index < this.checkpoints_.length; ++index){
            if (width < this.checkpoints_[index].value){
                return [this.checkpoints_[index].name, index];
            }
        }
        
        return [ '', -1 ];//Not found
    }

    public static GetScrollPosition(): Point{
        return {
            x: (window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
            y: (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
        };
    }

    public static ComputePercentage(position: Point): Point{
        return {
            x: ((document.body.scrollWidth <= 0) ? 0 : ((position.x / document.body.scrollWidth) * 100)),
            y: ((document.body.scrollHeight <= 0) ? 0 : ((position.y / document.body.scrollHeight) * 100)),
        };
    }

    public static Scroll(from: Point, to: Point, handler?: ScreenGlobalHandler, animate?: boolean){
        let position = ScreenGlobalHandler.GetScrollPosition();
        if (from.x < 0){
            from.x = position.x;
        }

        if (to.x < 0){
            to.x = position.x;
        }

        if (from.y < 0){
            from.y = position.y;
        }

        if (to.y < 0){
            to.y = position.y;
        }

        if (animate && handler && handler.animator_){//Custom animation
            let scroll = () => {
                handler.animator_.Bind((fraction) => {
                    window.scrollTo((to.x + (to.x * fraction)), (to.y + (to.y * fraction)));
                }).run();
            };

            if (from.x != position.x || from.y != position.y){
                window.scrollTo(from.x, from.y);
                setTimeout(() => {//Defer final scroll
                    scroll();
                }, 0);
            }
            else{//Scroll from current
                scroll();
            }
        }
        else if (animate){//Use default browser animation
            let scroll = () => {
                window.scrollTo({
                    left: to.x,
                    top: to.y,
                    behavior: 'smooth',
                });
            };

            if (from.x != position.x || from.y != position.y){
                window.scrollTo(from.x, from.y);
                setTimeout(() => {//Defer final scroll
                    scroll();
                }, 0);
            }
            else{//Scroll from current
                scroll();
            }
        }
        else if (from.x != position.x || from.y != position.y){
            window.scrollTo(from.x, from.y);
            setTimeout(() => {//Defer final scroll
                window.scrollTo(to.x, to.y);
            }, 0);
        }
        else{//Scroll from current
            window.scrollTo(to.x, to.y);
        }
    }
}
