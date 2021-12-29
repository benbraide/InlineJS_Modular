import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'
import { IntersectionObserver } from '../observers/intersection';

export class TextHelper{
    public static Bind(region: IRegion, element: HTMLElement, directive: IDirective, isHtml: boolean, callback?: () => boolean, allowAnimation?: boolean){
        let onChange: (value: any) => void, regionId = region.GetId(), options = {
            ancestor: -1,
            lazy: false,
            comma: false,
            float: false,
            fixed: false,
            fixedPoint: 0,
        };

        if (isHtml){
            onChange = (value: any) => Region.InsertHtml(element, DirectiveHandler.ToString(value));
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
                    element.value = DirectiveHandler.ToString(value);
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
                    element.value = DirectiveHandler.ToString(value);
                }
            };
        }
        else if (element instanceof HTMLTextAreaElement){
            onChange = (value: any) => element.value = DirectiveHandler.ToString(value);
        }
        else{//Unknown
            onChange = (value: any) => element.textContent = DirectiveHandler.ToString(value);
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

        let lastValue = null, step = (value: any, fraction: number) => {
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

        let animator = region.ParseAnimation(directive.arg.options, element, (allowAnimation && directive.arg.key === 'animate')), active = false;
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
                
                active = true;
                animator.Run(true, fraction => step(DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value), fraction));
            });
        }
        else{//Immediate
            active = true;
        }

        region.GetState().TrapGetAccess(() => {
            if (active && (!callback || callback())){
                animator.Run(true, fraction => step(DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value), fraction));
            }
        }, true, element);
    }
}

export class TextDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('text', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            TextHelper.Bind(region, element, directive, false, null, true);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}

export class HtmlDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('html', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            TextHelper.Bind(region, element, directive, true);
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
