"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDirectiveHandler = void 0;
const typedefs_1 = require("../../typedefs");
const intersection_1 = require("../../observers/intersection");
const fetch_1 = require("../../utilities/fetch");
const region_1 = require("../../region");
const generic_1 = require("./generic");
class ImageDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('image', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            if (!(element instanceof HTMLImageElement)) {
                region.GetState().ReportError('\'x-image\' reguires target to be an \'img\' element', element);
                return typedefs_1.DirectiveHandlerReturn.Handled;
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
                zoomed: false,
                popped: false,
                size: {
                    width: element.naturalWidth,
                    height: element.naturalHeight,
                },
                aspectRatio: ((element.naturalHeight == 0) ? 0 : (element.naturalWidth / element.naturalHeight)),
            };
            directive.arg.options.forEach((option, index, list) => {
                if (option in options && typeof options[option] === 'boolean') {
                    options[option] = true;
                    if (option === 'zoom' && index < (list.length - 1)) {
                        options.zoomMultiplier = (parseInt(list[index + 1]) || 1300);
                    }
                }
            });
            let fit = () => {
                if (info.size.width < info.size.height) {
                    element.style.width = (options.overflow ? '100%' : 'auto');
                    element.style.height = (options.overflow ? 'auto' : '100%');
                }
                else {
                    element.style.width = (options.overflow ? 'auto' : '100%');
                    element.style.height = (options.overflow ? '100%' : 'auto');
                }
            };
            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`);
            if (options.lazy) {
                let lazyOptions = generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value), src = '';
                if (region_1.Region.IsObject(lazyOptions)) {
                    src = lazyOptions['src'];
                }
                else if (typeof lazyOptions === 'string') {
                    src = lazyOptions;
                }
                if (src) {
                    region.GetIntersectionObserverManager().Add(element, intersection_1.IntersectionObserver.BuildOptions(lazyOptions)).Start((entry, key) => {
                        (new fetch_1.Fetch(src, element, {
                            onLoad: () => {
                                let myRegion = region_1.Region.Get(regionId);
                                if (!myRegion) {
                                    return;
                                }
                                info.loaded = true;
                                myRegion.GetChanges().AddComposed('loaded', scopeId);
                                let size = {
                                    width: element.naturalWidth,
                                    height: element.naturalHeight,
                                };
                                if (size.width !== info.size.width || size.height !== info.size.height) {
                                    info.size = size;
                                    myRegion.GetChanges().AddComposed('size', scopeId);
                                }
                                let aspectRatio = ((info.size.height == 0) ? 0 : (info.size.width / info.size.height));
                                if (aspectRatio !== info.aspectRatio) {
                                    info.aspectRatio = aspectRatio;
                                    myRegion.GetChanges().AddComposed('aspectRatio', scopeId);
                                }
                                element.dispatchEvent(new CustomEvent(`${this.key_}.load`));
                                if (options.fit) {
                                    fit();
                                }
                            },
                            onError: (err) => {
                                element.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                                    detail: { error: err },
                                }));
                            },
                        })).Get();
                        let myRegion = region_1.Region.Get(regionId);
                        if (myRegion) {
                            region.GetIntersectionObserverManager().RemoveByKey(key);
                        }
                    });
                }
                else { //Warn
                    region.GetState().ReportError('\'x-image\' reguires a \'src\' field for lazy loading', element);
                }
            }
            else if (options.fit) {
                fit();
            }
            if (options.zoom) { //Zoom in on mouse entry
                let zoomAnimator = region_1.Region.ParseAnimation(['zoom', options.zoomMultiplier.toString(), 'faster', ...directive.arg.options], element, (directive.arg.key === 'animate'));
                element.addEventListener('mouseenter', () => {
                    zoomAnimator.Run(true);
                });
                element.addEventListener('mouseleave', () => {
                    zoomAnimator.Run(false);
                });
            }
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.ImageDirectiveHandler = ImageDirectiveHandler;
