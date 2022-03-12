import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'
import { IntersectionObserver } from '../observers/intersection';

export class TextHelper{
    public static Bind(key: string, region: IRegion, element: HTMLElement, directive: IDirective, isHtml: boolean, callback?: () => boolean, allowAnimation?: boolean){
        let elementScope = region.AddElement(element, true), regionId = region.GetId();
        if (!elementScope){
            return;
        }

        let bindKey = (callKey: string) => {
            if (`#${key}` in elementScope.locals){
                region.GetState().TrapGetAccess(() => {
                    (elementScope.locals[`#${key}`])[callKey](DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value));
                }, true, element);
            }
        };
        
        if (directive.arg.key === 'prefix'){
            bindKey('setPrefix');
            return;
        }
        
        if (directive.arg.key === 'suffix'){
            bindKey('setSuffix');
            return;
        }
        
        let onChange: (value: any) => void, options = {
            ancestor: -1,
            nexttick: false,
            lazy: false,
            comma: false,
            float: false,
            dollar: false,
            cent: false,
            pound: false,
            euro: false,
            yen: false,
            naira: false,
            kobo: false,
            fixed: false,
            fixedPoint: 0,
            prefix: '',
            suffix: '',
        };

        let getTextPrefix = () => {
            let prefix = '';
            if (options.dollar){
                prefix += '$';
            }

            if (options.pound){
                prefix += '£';
            }

            if (options.euro){
                prefix += '€';
            }

            if (options.yen){
                prefix += '¥';
            }

            if (options.naira){
                prefix += '₦';
            }

            return (prefix + (options.prefix || ''));
        };

        let getTextSuffix = () => {
            let suffix = '';
            if (options.cent){
                suffix += '¢';
            }

            if (options.kobo){
                suffix += 'k';
            }
            
            return (suffix + (options.suffix || ''));
        };

        let getTextValue = (value: any) => {
            return (getTextPrefix() + DirectiveHandler.ToString(value) + getTextSuffix());
        };

        if (isHtml){
            onChange = (value: any) => Region.InsertHtml(element, getTextValue(value));
        }
        else if (element instanceof HTMLInputElement){
            if (element.type === 'checkbox' || element.type === 'radio'){
                onChange = (value: any) => {
                    let valueAttr = element.getAttribute('value');
                    if (valueAttr){
                        if (value && Array.isArray(value)){
                            element.checked = ((value as Array<any>).findIndex(item => (item == valueAttr)) != -1);
                        }
                        else{
                            element.checked = (value == valueAttr);
                        }
                    }
                    else{
                        element.checked = !!value;
                    }
                };
            }
            else{//Input with value
                onChange = (value: any) => {
                    element.value = getTextValue(value);
                };
            }
        }
        else if (element instanceof HTMLSelectElement){
            onChange = (value: any) => {
                if (element.multiple && Array.isArray(value)){
                    Array.from(element.options).forEach((option) => {
                        option.selected = (value.includes(option.value || option.text));
                    });
                }
                else{//Single selection
                    element.value = getTextValue(value);
                }
            };
        }
        else if (element instanceof HTMLTextAreaElement){
            onChange = (value: any) => element.value = getTextValue(value);
        }
        else{//Unknown
            onChange = (value: any) => element.textContent = getTextValue(value);
        }

        directive.arg.options.forEach((option, index) => {
            if (!(option in options)){
                return;
            }

            if (option === 'ancestor'){
                if ((index + 1) < directive.arg.options.length){
                    options.ancestor = (parseInt(directive.arg.options[index + 1]) || 0);
                }
                else{//Use parent
                    options.ancestor = 0;
                }
            }
            else if (typeof options[option] === 'boolean'){
                options[option] = true;
                if (option === 'fixed'){
                    options.fixedPoint = (parseInt(directive.arg.options[index + 1]) || 0);
                }
            }
        });

        let stepValue = (value: any, lastValue: any, fraction: number) => {
            if (fraction == 1 || value === lastValue){
                return value;
            }
            
            if (typeof value === 'number'){
                if (typeof lastValue === 'number'){
                    return (options.float ? ((fraction * (value - lastValue)) + lastValue) : Math.floor((fraction * (value - lastValue)) + lastValue));
                }
                return (options.float ? (fraction * value) : Math.floor(fraction * value));
            }

            if (typeof value === 'string'){
                if (typeof lastValue === 'string'){
                    if (value.startsWith(lastValue)){//Characters added
                        return (lastValue + ((fraction <= 0) ? '' : value.substr(lastValue.length, Math.floor(fraction * (value.length - lastValue.length)))));
                    }

                    if (lastValue.startsWith(value)){//Characters removed
                        return (value + ((fraction <= 0) ? '' : lastValue.substr(value.length, Math.floor((1 - fraction) * (lastValue.length - value.length)))));
                    }
                }
                
                return ((fraction <= 0) ? '' : value.substr(0, Math.floor(fraction * value.length)));
            }

            if (typeof value === 'function'){
                return (value as (fraction: number) => any)(fraction);
            }

            if (Array.isArray(value)){
                return value.map(item => stepValue(item, null, fraction));
            }

            if (Region.IsObject(value)){
                let stepped = {};
                if (Region.IsObject(lastValue)){
                    Object.entries(value).forEach(([key, value]) => (stepped[key] = stepValue(value, ((key in lastValue) ? lastValue[key] : null), fraction)));
                }
                else{
                    Object.entries(value).forEach(([key, value]) => (stepped[key] = stepValue(value, null, fraction)));
                }

                return stepped;
            }

            return value;
        };

        let lastValue = null, checkpoint = 0, queued = false, step = (value: any, fraction: number) => {
            lastValue = stepValue(value, lastValue, fraction);
            if (typeof lastValue === 'number' && ((options.float && options.fixed) || options.comma)){
                let computed = ((options.float && options.fixed) ? (Math.round(lastValue * 100) / 100).toFixed(options.fixedPoint) : lastValue.toString());
                if (options.comma){
                    let pointIndex = computed.indexOf('.'), beforePoint: string, afterPoint: string;
                    if (pointIndex == -1){
                        beforePoint = computed.substring(0, (pointIndex - 1));
                        afterPoint = computed.substring(pointIndex + 1);
                    }
                    else{
                        beforePoint = computed;
                        afterPoint = '';
                    }

                    beforePoint = beforePoint.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    computed = (afterPoint ? `${beforePoint}.${afterPoint}` : beforePoint);
                }
                
                onChange(computed);
            }
            else{
                onChange(lastValue);
            }
        };

        let doRun = () => {
            queued = false;
            let checked = ++checkpoint, value = DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value);
            animator.Run(true, (fraction) => {
                if (checked == checkpoint){
                    step(value, fraction);
                }
            });
        };
        
        let animator = region.ParseAnimation(directive.arg.options, element, (allowAnimation && directive.arg.key === 'animate')), run = (isFirst = false) => {
            let myRegion = Region.Get(regionId);
            if (!isFirst && options.nexttick && myRegion){
                if (!queued){
                    queued = true;
                    myRegion.AddNextTickCallback(doRun);
                }
            }
            else{
                doRun();
            }
        };

        let isBound = false, bind = () => {
            if (isBound){
                return;
            }

            isBound = true;
            region.GetState().TrapGetAccess(() => run(true), () => {
                if (!callback || callback()){
                    run();
                }
            }, element);
        };

        let setOption = (key: string, value: any) => {
            if (options[key] === value){
                return;
            }
            
            options[key] = value;
            if (isBound && (!callback || callback())){
                run();
            }
        };

        elementScope.locals[`#${key}`] = Region.CreateProxy((prop) => {
            if (prop === 'setPrefix'){
                return (value: string) => setOption('prefix', value);
            }

            if (prop === 'setSuffix'){
                return (value: string) => setOption('suffix', value);
            }

            return true;
        }, ['setPrefix', 'setSuffix']);

        if (options.lazy && !callback){
            let intersectionOptions = {
                root: ((options.ancestor == -1) ? null : region.GetElementAncestor(element, options.ancestor)),
            };
            
            region.GetIntersectionObserverManager().Add(element, IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry, key) => {
                if (!entry.isIntersecting){
                    return;
                }
                
                let myRegion = Region.Get(regionId);
                if (myRegion){
                    myRegion.GetIntersectionObserverManager().RemoveByKey(key);
                }
                
                bind();
            });
        }
        else{//Immediate
            bind();
        }
    }
}

export class TextDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('text', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            TextHelper.Bind(this.key_, region, element, directive, false, null, true);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class HtmlDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('html', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            TextHelper.Bind(this.key_, region, element, directive, true);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
