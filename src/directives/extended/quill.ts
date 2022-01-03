import { IDirective, DirectiveHandlerReturn, IRegion, IResource } from '../../typedefs'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from '../extended/generic'

interface QuillToolbarEntry{
    element: HTMLElement;
    name: string;
    action?: string;
    match?: string | boolean;
    active: boolean;
}

export class QuillDirectiveHandler extends ExtendedDirectiveHandler{
    private static fieldGroups_ = {
        toggle: ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code'],
        size: ['size', 'small', 'normal', 'large', 'huge'],
        header: ['header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        align: ['align', 'left', 'center', 'right'],
        indent: ['indent', 'in', 'out'],
        list: ['list', 'bullet', 'ordered'],
        script: ['script', 'sub', 'super'],
        direction: ['direction', 'rtl'],
        prompts: ['link', 'image', 'video', 'color', 'background', 'font', 'indent'],
        mounts: ['container'],
    };
    
    public constructor(resource?: IResource, urls?: Array<string> | string){
        super('quill', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let elementScope = region.AddElement(element, true), locals = region.GetLocal(element, `\$${this.key_}`, true, true), mounts = {
                container: <HTMLElement>null,
            };

            let groupKey = Object.keys(QuillDirectiveHandler.fieldGroups_).find(field => (QuillDirectiveHandler.fieldGroups_[field].includes(directive.arg.key)));
            if (groupKey){
                if (!locals || `\$${this.key_}` in elementScope.locals){
                    return DirectiveHandlerReturn.Handled;
                }

                if (groupKey === 'toggle'){
                    locals.addToolbarItem(element, directive.arg.key, true, directive.arg.key);
                }
                else if (groupKey === 'prompts'){
                    locals.addToolbarItem(element, (directive.arg.options.includes('prompt') ? `${directive.arg.key}.prompt` : directive.arg.key));
                }
                else if (directive.arg.key === 'container'){
                    locals.addToolbarItem(element, directive.arg.key);
                }
                else if (directive.arg.key === groupKey){
                    locals.addToolbarItem(element, groupKey);
                }
                else if (groupKey === 'indent'){
                    locals.addToolbarItem(element, `${groupKey}.${directive.arg.key}`, ((directive.arg.key === 'out') ? '-1' : '+1'), groupKey);
                }
                else{//Standard
                    locals.addToolbarItem(element, `${groupKey}.${directive.arg.key}`, directive.arg.key, groupKey);
                }

                return DirectiveHandlerReturn.Handled;
            }

            let options = {
                readonly: false,
                snow: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });

            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`);
            let toolbar: Record<string, QuillToolbarEntry> = {}, toolbarProxy: Record<string, any> = {};
            
            let addToolbarItem = (parent: HTMLElement, el: HTMLElement, name: string, match?: string | boolean, action?: string) => {
                let myRegion = Region.Get(regionId);
                if (!myRegion || name in toolbar){
                    return;
                }

                let bindPrompt = (action: string, defaultValue = '') => {
                    let input = el.querySelector('input'), onEvent = (e: Event) => {
                        e.preventDefault();

                        quillInstance?.format(action, input.value);
                        input.value = defaultValue;

                        el.dispatchEvent(new CustomEvent(`${this.key_}.${action}`));
                    };

                    if (input){
                        input.value = defaultValue;
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter'){
                                onEvent(e);
                            }
                        });
                        el.querySelector('button')?.addEventListener('click', onEvent);
                    }
                };

                let found = QuillDirectiveHandler.fieldGroups_.prompts.find((item) => {
                    if (name !== `${item}.prompt`){
                        return false;
                    }

                    bindPrompt(item, ((item === 'link') ? 'https://' : ''));

                    return true;
                });
                
                if (found){
                    return;
                }

                if (name === 'container'){
                    mounts.container = el;
                    return;
                }

                let myElementScope = myRegion.AddElement(el, true);
                if (!myElementScope){
                    return;
                }
                
                let toolbarEntry = {
                    element: el,
                    name: name,
                    action: action,
                    match: match,
                    active: false,
                }, computedAction = (toolbarEntry.action || toolbarEntry.name);

                let toolbarEntryProxy = ExtendedDirectiveHandler.CreateProxy((prop) => {
                    if (prop === 'parent'){
                        return Region.Get(regionId)?.GetLocal(parent, `\$${this.key_}`, true, true);
                    }

                    if (prop === 'element'){
                        return toolbarEntry.element;
                    }
    
                    if (prop === 'name'){
                        return toolbarEntry.name;
                    }
    
                    if (prop === 'action'){
                        return computedAction;
                    }
    
                    if (prop === 'match'){
                        return toolbarEntry.match;
                    }

                    if (prop === 'active'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${toolbarEntry.name}.${prop}`);
                        return toolbarEntry.active;
                    }

                    if (prop === 'addToolbarItem'){
                        return Region.Get(regionId)?.GetLocal(parent, `\$${this.key_}`, true, true)?.addToolbarItem;
                    }
                }, ['parent', 'element', 'name', 'action', 'match', 'active', 'addToolbarItem']);

                toolbar[name] = toolbarEntry;
                toolbarProxy[name] = toolbarEntryProxy;

                if (match){//Bind listener
                    el.addEventListener('click', () => {
                        let isActive = toolbarEntry.active;
                        quillInstance.format(computedAction, (isActive ? false : toolbarEntry.match));
                        toolbarEntry.active = !isActive;
                        Region.Get(regionId).GetChanges().AddComposed('active', `${scopeId}.${name}`);
                    });
                }

                myElementScope.uninitCallbacks.push(() => {
                    delete toolbar[name];
                    delete toolbarProxy[name];
                });

                myElementScope.locals[`\$${this.key_}`] = toolbarEntryProxy;
            };

            let setActive = (name: string, value: boolean) => {
                if (name in toolbar && value != toolbar[name].active){
                    toolbar[name].active = value;
                    Region.Get(regionId).GetChanges().AddComposed('active', `${scopeId}.${name}`);
                }
            };

            let onEditorChange = () => {
                if (!quillInstance.hasFocus()){
                    return;
                }

                let format = quillInstance.getFormat();
                Object.values(toolbar).forEach((entry) => {
                    let isActive: boolean, action = (entry.action || entry.name);
                    if (action in format){
                        let value = ((action === 'indent') ? '+1' : format[action]);
                        isActive = (entry.match === null || entry.match === undefined || entry.match === value);
                    }
                    else{
                        isActive = false;
                    }

                    setActive(entry.name, isActive);
                });
            };

            let ready = false, quillInstance: any = null, init = () => {
                if (ready || !mounts.container){
                    return;
                }

                quillInstance = new window['Quill'](mounts.container, {
                    modules: { toolbar: false },
                    theme: (options.snow ? 'snow' : 'default'),
                    readOnly: options.readonly,
                });

                quillInstance.on('editor-change', onEditorChange);
                ready = true;
            };

            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) => {
                if (prop === 'instance'){
                    return quillInstance;
                }

                if (prop === 'container'){
                    return mounts.container;
                }

                if (prop === 'addToolbarItem'){
                    return (el: HTMLElement, name: string, match?: string | boolean, action?: string) => addToolbarItem(element, el, name, match, action);
                }

                if (prop === 'init'){
                    return init;
                }
            }, ['instance', 'container', 'addToolbarItem', 'init'], (prop, value) => {
                if (prop === 'container' && !mounts.container){
                    mounts.container = value;
                    init();
                }

                return true;
            });

            elementScope.uninitCallbacks.push(() => {
                if (quillInstance){
                    quillInstance.off('editor-change', onEditorChange);
                    quillInstance = null;
                }
            });

            if (resource && urls && (!Array.isArray(urls) || urls.length > 0)){
                resource.GetMixed(urls, init, true);
            }
            else{//Resource not provided
                elementScope.postProcessCallbacks.push(() => {
                    init();
                });
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}
