import { IDirective, DirectiveHandlerReturn, IRegion, IParsedAnimation } from '../../typedefs'
import { IntersectionObserver } from '../../observers/intersection'
import { Fetch } from '../../utilities/fetch'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from './generic'

export class ImageDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(){
        super('image', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            if (!(element instanceof HTMLImageElement)){
                region.GetState().ReportError('\'x-image\' reguires target to be an \'img\' element', element);
                return DirectiveHandlerReturn.Handled;
            }

            let options = {
                fit: false,
                overflow: false,
                lazy: false,
                pop: false,
                zoom: false,
                zoomMultiplier: 0,
            };

            let info = {
                loaded: false,
                zooming: false,
                zoomed: false,
                popped: false,
                size: {
                    width: element.naturalWidth,
                    height: element.naturalHeight,
                },
                aspectRatio: ((element.naturalHeight == 0) ? 0 : (element.naturalWidth / element.naturalHeight)),
            };
            
            directive.arg.options.forEach((option, index, list) => {
                if (option in options && typeof options[option] === 'boolean'){
                    options[option] = true;
                    if (option === 'zoom' && index < (list.length - 1)){
                        options.zoomMultiplier = (parseInt(list[index + 1]) || 1300);
                    }
                }
            });

            let fit = () => {
                if (!info.loaded){
                    return;
                }
                
                if (info.size.width < info.size.height){
                    element.style.width = (options.overflow ? '100%': 'auto');
                    element.style.height = (options.overflow ? 'auto' : '100%');
                }
                else{
                    element.style.width = (options.overflow ? 'auto' : '100%');
                    element.style.height = (options.overflow ? '100%' : 'auto');
                }
            };

            let regionId = region.GetId(), scopeId = this.GenerateScopeId_(region);
            if (options.lazy){
                let lazyOptions = ExtendedDirectiveHandler.Evaluate(region, element, directive.value), src = '';
                if (Region.IsObject(lazyOptions)){
                    src = lazyOptions['src'];
                }
                else if (typeof lazyOptions === 'string'){
                    src = lazyOptions;
                }
                
                if (src){
                    region.GetIntersectionObserverManager().Add(element, IntersectionObserver.BuildOptions(lazyOptions)).Start((entry, key) => {
                        (new Fetch(src, element, {
                            onLoad: () => {
                                let myRegion = Region.Get(regionId);
                                if (!myRegion){
                                    return;
                                }

                                info.loaded = true;
                                myRegion.GetChanges().AddComposed('loaded', scopeId);

                                let size = {
                                    width: element.naturalWidth,
                                    height: element.naturalHeight,
                                };
        
                                if (size.width !== info.size.width || size.height !== info.size.height){
                                    info.size = size;
                                    myRegion.GetChanges().AddComposed('size', scopeId);
                                }

                                let aspectRatio = ((info.size.height == 0) ? 0 : (info.size.width / info.size.height));
                                if (aspectRatio !== info.aspectRatio){
                                    info.aspectRatio = aspectRatio;
                                    myRegion.GetChanges().AddComposed('aspectRatio', scopeId);
                                }

                                element.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                                if (options.fit){
                                    fit();
                                }
                            },
                            onError: (err) => {
                                element.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                                    detail: { error: err },
                                }));
                            },
                        })).Get();
                        
                        let myRegion = Region.Get(regionId);
                        if (myRegion){
                            myRegion.GetIntersectionObserverManager().RemoveByKey(key);
                        }
                    });
                }
                else{//Warn
                    region.GetState().ReportError('\'x-image\' reguires a \'src\' field for lazy loading', element);
                }
            }
            else{//Immediate
                info.loaded = true;
                if (options.fit){
                    fit();
                }
            }

            let zoomAnimator: IParsedAnimation = null;
            let onZoomAnimationBefore = () => {
                Region.Get(regionId).GetChanges().AddComposed('zooming', scopeId);
                info.zooming = true;
            };

            let onZoomAnimationAfter = (isCanceled: boolean, show: boolean) => {
                if (isCanceled){
                    return;
                }
                
                Region.Get(regionId).GetChanges().AddComposed('zooming', scopeId);
                Region.Get(regionId).GetChanges().AddComposed('zoomed', scopeId);

                info.zooming = false;
                info.zoomed = show;
            };
            
            let onZoomEnter = () => {
                zoomAnimator.Run(true, null, onZoomAnimationAfter, onZoomAnimationBefore);
            };

            let onZoomLeave = () => {
                zoomAnimator.Run(false, null, onZoomAnimationAfter, onZoomAnimationBefore);
            };

            let bindZoom = () => {
                zoomAnimator = Region.ParseAnimation(['zoom', options.zoomMultiplier.toString(), 'faster', ...directive.arg.options], element, (directive.arg.key === 'animate'));
                element.addEventListener('mouseenter', onZoomEnter);
                element.addEventListener('mouseleave', onZoomLeave);
            };

            let unbindZoom = () => {
                element.removeEventListener('mouseleave', onZoomLeave);
                element.removeEventListener('mouseenter', onZoomEnter);
            };

            if (options.zoom){//Zoom in on mouse entry
                bindZoom();
            }

            region.AddElement(element, true).locals['$image'] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop in info){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return info[prop];
                }
            }, Object.keys(info), (target, prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if ((prop === 'fit' || prop === 'overflow') && options[prop] != !!value){
                    Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                    options[prop] = !options[prop];

                    if (options.fit){
                        fit();
                    }
                }
                else if (prop === 'zoom' && options.zoom != !!value){
                    Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                    options.zoom = !options.zoom;

                    if (options.zoom){
                        bindZoom();
                    }
                    else{
                        unbindZoom();
                    }
                }
                else if (prop === 'zoomMultiplier' && options.zoomMultiplier != value){
                    options.zoomMultiplier = value;
                    Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                    
                    if (options.zoom){
                        zoomAnimator = Region.ParseAnimation(['zoom', options.zoomMultiplier.toString(), 'faster', ...directive.arg.options], element, (directive.arg.key === 'animate'));
                    }
                }
                else if (prop === 'pop' && options.pop != !!value){
                    Region.Get(regionId).GetChanges().AddComposed(prop, scopeId);
                    options.pop = !options.pop;
                }

                return true;
            });

            return DirectiveHandlerReturn.Handled;
        });
    }
}