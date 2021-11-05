import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { ExtendedDirectiveHandler } from '../directives/extended/generic'
import { GlobalHandler } from './generic'
import { Region } from '../region'

export class OverlayDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(private overlay_: OverlayGlobalHandler){
        super(overlay_.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (ExtendedDirectiveHandler.IsEventRequest(directive.arg.key) || directive.arg.key === 'visible' || directive.arg.key === 'visibilityChange'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.visibility.change`);
            }

            if (directive.arg.key === 'click'){
                let regionId = region.GetId(), onEvent = (e: Event) => {
                    let myRegion = Region.Get(regionId), state = myRegion?.GetState();
                    try{
                        if (state){
                            state.PushContext(state.EventContextKey(), e);
                        }

                        ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value, false, e);
                    }
                    finally{
                        if (state){
                            state.PopContext(state.EventContextKey());
                        }
                    }
                };

                this.overlay_.AddClickHandler(onEvent);
                region.GetElementScope(element).uninitCallbacks.push(() => this.overlay_.RemoveClickHandler(onEvent));
            }
            else{
                let regionId = region.GetId(), value = false;
                region.GetState().TrapGetAccess(() => {//Bind value to visibility
                    if (!! ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value) != value){
                        value = !value;
                        this.overlay_.OffsetCount(value ? 1 : -1);
                    }
                }, true, element);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class OverlayGlobalHandler extends GlobalHandler{
    private scopeId_: string;

    private clickHandlers_ = new Array<(e?: Event) => void>();
    private resizeHandler_: () => void;
    
    private state_ = {
        element: document.createElement('div'),
        zIndex: 999,
        count: 0,
        visible: false,
        overflow: false,
    };

    private styles_: Record<string, string> = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.63)',
        zIndex: '',
    };

    public constructor(private updateBody_ = false, private padBody_ = false, styles: Record<string, string> = null){
        super('overlay', null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop in this.state_){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.state_[prop];
                }
            }, [...Object.keys(this.state_)], (prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if (prop === 'zIndex'){
                    this.SetZIndex((typeof value === 'number') ? value : (parseInt(value) || 0));
                }

                if (prop === 'visible'){
                    this.OffsetCount(value ? 1 : -1);
                }

                return true;
            });

            document.addEventListener('resize', this.resizeHandler_, { passive: true });
            Region.GetDirectiveManager().AddHandler(new OverlayDirectiveHandler(this));
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
            document.removeEventListener('resize', this.resizeHandler_);
            this.proxy_ = null;
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        this.resizeHandler_ = () => {
            this.CheckOverflow_();
        };

        this.styles_.zIndex = this.state_.zIndex.toString();
        Object.entries(styles || {}).forEach(([key, value]) => {
            this.styles_[key] = value;
        });

        Object.entries(this.styles_).forEach(([key, value]) => {
            if (key in this.state_.element.style){
                this.state_.element.style[key] = value;
            }
        });

        this.state_.element.style.width = '0';
        this.state_.element.addEventListener('click', (e) => {
            this.clickHandlers_.forEach((handler) => {
                try{
                    handler(e);
                }
                catch{}
            });
        });

        document.body.appendChild(this.state_.element);
    }

    public SetZIndex(value: number){
        if (this.state_.zIndex == value){
            return;
        }

        this.state_.zIndex == value;
        GlobalHandler.region_.GetChanges().AddComposed('zIndex', this.scopeId_);

        this.state_.element.style.zIndex = value.toString();
    }

    public OffsetCount(offset: number){
        if (offset == 0 || (offset < 0 && this.state_.count <= 0)){//No change
            return;
        }
        
        this.state_.count += offset;
        GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);
        
        if (this.state_.count <= 0){
            this.state_.count = 0;
            this.SetVisibility_(false);
        }
        else{
            this.SetVisibility_(true);
        }
    }

    public AddClickHandler(handler: (e?: Event) => void){
        this.clickHandlers_.push(handler);
    }

    public RemoveClickHandler(handler: (e?: Event) => void){
        this.clickHandlers_.splice(this.clickHandlers_.indexOf(handler), 1);
    }

    private SetVisibility_(visible: boolean){
        if (this.state_.visible == visible){
            return;
        }

        this.state_.visible = visible;
        GlobalHandler.region_.GetChanges().AddComposed('visible', this.scopeId_);

        if (this.updateBody_ && visible){
            document.body.style.width = '100vw';
            document.body.style.height = '100vh';
            document.body.style.overflow = 'hidden';
        }
        else if (this.updateBody_){
            document.body.style.width = 'auto';
            document.body.style.height = 'auto';
            document.body.style.overflow = 'auto';
        }
        
        this.state_.element.style.width = (visible ? (this.styles_['width'] || '100vw') : '0');
        this.CheckOverflow_();

        window.dispatchEvent(new CustomEvent(`${this.key_}.visibility.change`, {
            detail: { visible: visible },
        }));
    }

    private CheckOverflow_(){
        if ((this.state_.visible && document.body.clientHeight < document.body.scrollHeight) != this.state_.overflow){
            this.state_.overflow = !this.state_.overflow;
            GlobalHandler.region_.GetChanges().AddComposed('overflow', this.scopeId_);

            if (this.padBody_ && this.state_.overflow){
                document.body.style.paddingRight = '1rem';
            }
            else if (this.padBody_){
                document.body.style.paddingRight = '0';
            }
        }
    }
}
