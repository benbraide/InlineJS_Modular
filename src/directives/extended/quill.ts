import { IDirective, DirectiveHandlerReturn, IRegion, IResource } from '../../typedefs'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from '../extended/generic'
import Quill from 'quill';

interface QuillToolbarEntry{
    element: HTMLElement;
    name: string;
    action?: string;
    match?: string | boolean;
    active: boolean;
}

export class QuillDirectiveHandler extends ExtendedDirectiveHandler{
    private static fieldGroups_ = {
        toggle: ['bold', 'italic', 'underline', 'strike', 'super', 'sub'],
        size: ['size', 'small', 'normal', 'large', 'huge'],
        align: ['align', 'left', 'center', 'right'],
        list: ['list', 'bullet', 'ordered'],
        link: ['link', 'link-prompt'],
        image: ['image'],
        mounts: ['container'],
    };
    
    public constructor(resource?: IResource, urls?: Array<string> | string){
        super('quill', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let elementScope = region.AddElement(element, true), locals = region.GetLocal(element, `\$${this.key_}`, true), mounts = {
                container: <HTMLElement>null,
            };

            let groupKey = Object.keys(QuillDirectiveHandler.fieldGroups_).find(field => (QuillDirectiveHandler.fieldGroups_[field].includes(directive.arg.key)));
            if (groupKey){
                if (!locals || `\$${this.key_}` in elementScope.locals){
                    return DirectiveHandlerReturn.Handled;
                }

                if (directive.arg.key === 'link-prompt'){
                    let input = element.querySelector('input'), onEvent = (e: Event) => {
                        e.preventDefault();
                        quillInstance?.format('link', input.value);
                        input.value = 'https://';
                        element.dispatchEvent(new CustomEvent(`${this.key_}.link`));
                    };

                    if (input){
                        input.value = 'https://';
                        input.addEventListener('keydown', onEvent);
                        element.querySelector('button')?.addEventListener('click', onEvent);
                    }
                }
                else if (directive.arg.key === 'container'){
                    mounts.container = element;
                }
                else if (groupKey === 'toggle'){
                    locals.addToolbarItem(element, directive.arg.key, true, directive.arg.key);
                }
                else if (directive.arg.key === groupKey){
                    locals.addToolbarItem(element, groupKey);
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
                        let myRegion = Region.Get(regionId);
                        return (myRegion ? myRegion.GetLocal(parent, `\$${this.key_}`, true) : null);
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
                }, ['parent', 'element', 'name', 'action', 'match', 'active']);

                toolbar[name] = toolbarEntry;
                toolbarProxy[name] = toolbarEntryProxy;

                if (match){//Bind listener
                    el.addEventListener('click', () => {
                        quillInstance.format(computedAction, (toolbarEntry.active ? false : toolbarEntry.match));
                        toolbarEntry.active = !toolbarEntry.active;
                        Region.Get(regionId).GetChanges().AddComposed('active', `${scopeId}.${name}`);
                    });
                }

                myElementScope.uninitCallbacks.push(() => {
                    delete toolbar[name];
                    delete toolbarProxy[name];
                });

                elementScope.locals[`\$${this.key_}`] = toolbarEntryProxy;
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
                        isActive = (entry.match === null || entry.match === undefined || entry.match === format[action]);
                    }
                    else{
                        isActive = false;
                    }

                    setActive(entry.name, isActive);
                });
            };

            let readyCount = 0, quillInstance: Quill = null, init = () => {
                if (readyCount >= 2 || ++readyCount < 2){
                    return;
                }

                if (!mounts.container){
                    --readyCount;
                    return;
                }

                quillInstance = new Quill(mounts.container, {
                    modules: { toolbar: false },
                    theme: (options.snow ? 'snow' : 'default'),
                    readOnly: options.readonly,
                });

                quillInstance.on('editor-change', onEditorChange);
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
                ++readyCount;
            }

            region.AddPostProcessCallback(() => {
                init();
            });

            return DirectiveHandlerReturn.Handled;
        });
    }
}
