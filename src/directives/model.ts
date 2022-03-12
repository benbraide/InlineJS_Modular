import { IDirective, DirectiveHandlerReturn, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from './generic'
import { TextHelper } from './text'

export class ModelDirectiveHandler extends DirectiveHandler{
    public constructor(){
        super('model', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let regionId = region.GetId(), doneInput = false, options = {
                oneway: false,
                lazy: false,
                number: false,
                forced: false,
                trim: false,
                array: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });

            if (!options.oneway){
                TextHelper.Bind(this.key_, region, element, directive, false, () => !doneInput);
            }

            let isCheckable = false, isSelect = false, isMultiple = false, isTextArea = false;
            if (element instanceof HTMLInputElement){
                if (element.type === 'submit'){//Not supported
                    return DirectiveHandlerReturn.Nil;
                }
                isCheckable = (element.type === 'checkbox' || element.type === 'radio');
            }
            else if (element instanceof HTMLSelectElement){
                isSelect = true;
                isMultiple = (element as HTMLSelectElement).multiple;
            }
            else if (element instanceof HTMLTextAreaElement){
                isTextArea = true;
            }
            else{//Not supported
                return DirectiveHandlerReturn.Nil;
            }

            let parseValue = (value: string, addQuotes = true, enforceNumber = false) => {
                if (!options.number){
                    return (addQuotes ? `'${value}'` : value);
                }

                let parsedValue = parseFloat(value);
                if (options.forced){
                    return (enforceNumber ? (parsedValue || 0) : (parsedValue || 0).toString());
                }
                
                if (addQuotes){
                    return ((!parsedValue && parsedValue !== 0) ? (value ? `'${value}'` : 'null') : parsedValue.toString());
                }
                
                return ((!parsedValue && parsedValue !== 0) ? (value ? value : null) : (enforceNumber ? parsedValue : parsedValue.toString()));
            };
            
            let convertValue = (value: string | Array<string>, target: HTMLElement) => {
                if (typeof value !== 'string'){
                    let joined = value.reduce((cummulative, item) => (cummulative ? (`${cummulative},${parseValue(item)}`) : `${parseValue(item)}`), '');
                    return `[${joined}]`;
                }
                
                if (options.trim){
                    value = value.trim();
                }
                
                if (isCheckable){
                    if (!(target as HTMLInputElement).checked){
                        return 'false';
                    }
                    
                    if (value && value !== 'on' && value !== 'true' && value !== 'checked'){
                        return `'${value}'`;
                    }

                    return 'true';
                }
                
                return parseValue(value);
            };

            let getValue = (target: HTMLElement) => {
                if (!isSelect || !isMultiple){
                    return null;
                }

                return Array.from((target as HTMLSelectElement).options).filter(option => option.selected).map(option => (option.value || option.text));
            };

            let setValue = (value: string, target: HTMLElement) => {
                if (options.array && isCheckable){
                    let evaluatedValue = DirectiveHandler.Evaluate(region, element, directive.value);
                    if (evaluatedValue && Array.isArray(evaluatedValue) && value){
                        let index = evaluatedValue.findIndex(item => (item == value));
                        if (index == -1 && (target as HTMLInputElement).checked){
                            evaluatedValue.push(parseValue(value, false, true));
                        }
                        else if (index != -1 && !(target as HTMLInputElement).checked){//Remove value from array
                            evaluatedValue.splice(index, 1);
                        }
                    }
                }
                else{//Assign
                    DirectiveHandler.Evaluate(region, element, `(${directive.value})=(${convertValue((getValue(target) || value), target)})`);
                }
            };

            let onEvent = (e: Event) => {
                doneInput = true;
                setValue((e.target as HTMLInputElement).value, element);
                Region.Get(regionId).AddNextTickCallback(() => {
                    doneInput = false;
                });
            };

            if (options.oneway){//Initial assignment
                setValue((element as HTMLInputElement).value, element);
            }
            
            if (!options.lazy && !isSelect && !isCheckable){
                element.addEventListener('input', onEvent);
            }
            else{//Listen on change
                element.addEventListener('change', onEvent);
            }
            
            return DirectiveHandlerReturn.Handled;
        }, false);
    }
}
