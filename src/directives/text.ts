import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'

export class TextHelper{
    public static Bind(region: IRegion, element: HTMLElement, directive: IDirective, isHtml: boolean, callback?: () => boolean){
        let onChange: (value: any) => void, regionId = region.GetId();
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

        region.GetState().TrapGetAccess(() => {
            if (!callback || callback()){
                onChange(DirectiveHandler.Evaluate(Region.Get(regionId), element, directive.value));
            }
        }, true, element);
    }
}

export class TextDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('text', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            TextHelper.Bind(region, element, directive, false);
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
