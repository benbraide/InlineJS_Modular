import { IDirective, DirectiveHandlerReturn, IRegion, IOverlayGlobalHandler, IModalGlobalHandler } from '../typedefs'
import { ExtendedDirectiveHandler } from '../directives/extended/generic'
import { Fetch, FetchMode } from '../utilities/fetch'
import { GlobalHandler } from './generic'
import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

export class ModalDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(private modal_: ModalGlobalHandler){
        super(modal_.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            directive.arg.key = Region.GetProcessor().GetCamelCaseDirectiveName(directive.arg.key);
            if (directive.arg.key === 'load' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.load`);
            }

            if (['loading', 'reload', 'error', 'unload', 'visibility'].includes(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            let regionId = region.GetId();
            region.GetState().TrapGetAccess(() => {//Bind URL
                this.modal_.SetUrl(ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value));
            }, true, element);

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class ModalGlobalHandler extends GlobalHandler implements IModalGlobalHandler{
    private fetch_: Fetch;

    private state_ = {
        container: document.createElement('div'),
        mount: document.createElement('div'),
        visible: false,
        onClick: (null as ((bubbled: boolean) => void)),
    };
    
    public constructor(private overlay_: IOverlayGlobalHandler = null, private pathPrefix_ = '', hideOnOutsideClick = true, zIndex = 999){
        super('modal', null, null, () => {
            this.proxy_ = this.fetch_.props;
            if (this.overlay_ && hideOnOutsideClick){
                this.overlay_.AddClickHandler(this.state_.onClick);
            }
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
            if (this.overlay_ && hideOnOutsideClick){
                this.overlay_.RemoveClickHandler(this.state_.onClick);
            }
            this.proxy_ = null;
        });

        if (this.pathPrefix_ && !this.pathPrefix_.startsWith('/')){
            this.pathPrefix_ = `/${this.pathPrefix_}`;
        }

        this.state_.container.style.position = 'fixed';
        this.state_.container.style.top = '0';
        this.state_.container.style.left = '0';
        this.state_.container.style.width = '0';
        this.state_.container.style.height = '100vh';
        this.state_.container.style.display = 'flex';
        this.state_.container.style.flexDirection = 'row';
        this.state_.container.style.justifyContent = 'center';
        this.state_.container.style.alignItems = 'center';
        this.state_.container.style.background = 'transparent';
        this.state_.container.style.overflow = 'hidden';
        this.state_.container.style.zIndex = (this.overlay_ ? (this.overlay_.GetZIndex() + 2) : zIndex).toString();
        this.state_.container.style.pointerEvents = 'none';
        
        this.state_.mount.style.width = 'auto';
        this.state_.mount.style.pointerEvents = 'auto';

        this.state_.onClick = (bubbled) => {
            if (!bubbled){
                this.SetVisibility(false);
            }
        };
        
        this.fetch_ = new Fetch(null, this.state_.mount, {
            onBeforeRequest: () => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.loading`));
            },
            onLoad: () => {
                (new Bootstrap()).Attach(this.state_.mount);
                window.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                this.SetVisibility(true);
            },
            onReload: () => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.reload`));
                this.SetVisibility(true);
            },
            onError: (err) => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                    detail: { error: err },
                }));
                this.SetVisibility(false);
            },
            onEmptyMount: () => {
                window.dispatchEvent(new CustomEvent(`${this.key_}.unload`));
            },
            onBeforePropGet: (prop) => {
                return (prop === 'url');
            },
            onBeforePropSet: (prop, valueInfo) => {
                if (prop === 'url'){
                    valueInfo.value = this.FormatUrl_(valueInfo.value);
                    return true;
                }

                return (prop === 'show');
            },
            onPropSet: (prop, value) => {
                if (prop === 'show'){
                    this.SetVisibility(!!value);
                }
            },
        }, FetchMode.Replace);

        this.fetch_.Watch(GlobalHandler.region_);
        this.state_.container.appendChild(this.state_.mount);
        document.body.appendChild(this.state_.container);
    }

    public SetUrl(url: string){
        this.fetch_.props.url = url;
    }

    public SetVisibility(visible: boolean){
        if (this.state_.visible == visible){
            return;
        }

        this.state_.visible = visible;
        this.state_.container.style.width = (visible ? '100vw' : '0');

        if (this.overlay_){//Update overlay
            this.overlay_.OffsetCount(visible ? 1 : -1);
        }

        window.dispatchEvent(new CustomEvent(`${this.key_}.visibility`, {
            detail: { visible: visible },
        }));
    }

    private FormatUrl_(url: string){
        url = url?.trim();
        if (!url){
            return '';
        }

        if (url.startsWith('modal://')){
            url = url.substr(7);
        }

        if (this.pathPrefix_){
            return (url.startsWith('/') ? `${this.pathPrefix_}${url}` : `${this.pathPrefix_}/${url}`);
        }
        
        return url;
    }
}
