import { IProcessor, IProcessorOptions, IRegion, IDirective, IDirectiveArg, DirectiveHandlerReturn, IDirectiveManager, IConfig } from './typedefs'

export class Processor implements IProcessor{
    public constructor (private config_: IConfig, private directiveManager_: IDirectiveManager){}
    
    public All(region: IRegion, element: HTMLElement, options?: IProcessorOptions): void{
        if (!this.Check(element, options)){//Check failed -- ignore
            return;
        }

        let tagName = element.tagName.toUpperCase(), isTemplate = (tagName === 'TEMPLATE');
        if (!isTemplate && options?.checkTemplate && element.closest('template')){//Inside template -- ignore
            return;
        }

        this.Pre(region, element);
        if (this.One(region, element) != DirectiveHandlerReturn.QuitAll && !isTemplate){//Process children
            Array.from(element.children).forEach(child => this.All(region, (child as HTMLElement)));
        }

        this.Post(region, element);
    }
    
    public One(region: IRegion, element: HTMLElement, options?: IProcessorOptions): DirectiveHandlerReturn{
        if (!this.Check(element, options)){//Check failed -- ignore
            return DirectiveHandlerReturn.Nil;
        }

        let tagName = element.tagName.toUpperCase(), isTemplate = (tagName === 'TEMPLATE');
        if (!isTemplate && options?.checkTemplate && element.closest('template')){//Inside template -- ignore
            return DirectiveHandlerReturn.Nil;
        }
        
        let state = region.GetState(), elementContextKey = state.ElementContextKey();
        state.PushContext(elementContextKey, element);

        let result = this.TraverseDirectives(element, (directive: IDirective): DirectiveHandlerReturn => {
            return this.DispatchDirective(region, element, directive);
        });

        state.PopContext(elementContextKey);
        return result;
    }

    public Pre(region: IRegion, element: HTMLElement){
        this.PreOrPost(region, element, 'preProcessCallbacks', 'Pre');
    }

    public Post(region: IRegion, element: HTMLElement){
        this.PreOrPost(region, element, 'postProcessCallbacks', 'Post');
    }

    public PreOrPost(region: IRegion, element: HTMLElement, scopeKey: string, name: string){
        let scope = region.GetElementScope(element);
        if (scope){
            (scope[scopeKey] as Array<() => void>).splice(0).forEach((callback) => {
                try{
                    callback();
                }
                catch (err){
                    region.GetState().ReportError(err, `InlineJs.Region<${region.GetId()}>.Processor.${name}(Element@${element.nodeName})`);
                }
            });
        }
    }
    
    public DispatchDirective(region: IRegion, element: HTMLElement, directive: IDirective): DirectiveHandlerReturn{
        let result: DirectiveHandlerReturn;
        try{
            result = this.directiveManager_.Handle(region, element, directive);
            if (result == DirectiveHandlerReturn.Nil){
                region.GetState().Warn('Handler not found for directive. Skipping...', `InlineJs.Region<${region.GetId()}>.Processor.DispatchDirective(Element@${element.nodeName}, ${directive.original})`);
            }
        }
        catch (err){
            result = DirectiveHandlerReturn.Nil;
            region.GetState().ReportError(err, `InlineJs.Region<${region.GetId()}>.Processor.DispatchDirective(Element@${element.nodeName}, ${directive.original})`);
        }

        if (result != DirectiveHandlerReturn.Rejected && result != DirectiveHandlerReturn.QuitAll){
            element.removeAttribute(directive.original);
        }
        
        return result;
    }
    
    public Check(element: HTMLElement, options: IProcessorOptions): boolean{
        if (element?.nodeType !== 1){//Not an HTMLElement
            return false;
        }
        
        if (options?.checkDocument && !document.contains(element)){//Node is not contained inside the document
            return false;
        }

        return true;
    }
    
    public TraverseDirectives(element: HTMLElement, callback: (directive: IDirective) => DirectiveHandlerReturn): DirectiveHandlerReturn{
        let result = DirectiveHandlerReturn.Nil, attributes = Array.from(element.attributes);
        for (let i = 0; i < attributes.length; ++i){//Traverse attributes
            let directive = this.GetDirectiveWith(attributes[i].name, attributes[i].value);
            if (directive){
                let thisResult = callback(directive);
                if (thisResult != DirectiveHandlerReturn.Nil){
                    result = thisResult;
                    if (thisResult == DirectiveHandlerReturn.Rejected || thisResult == DirectiveHandlerReturn.QuitAll){
                        break;
                    }
                }
            }
        }

        return result;
    }
    
    public GetDirective(attribute: Attr){
        return this.GetDirectiveWith(attribute.name, attribute.value);
    }
    
    public GetDirectiveWith(name: string, value: string): IDirective{
        if (!name || !(name = name.trim())){
            return null;
        }

        if ((value = value.trim()) === name){
            value = '';
        }

        let expanded = name;
        switch (name[0]){
        case ':':
            expanded = `${this.config_.GetDirectiveName('attr')}${name}`;
            break;
        case '.':
            expanded = `${this.config_.GetDirectiveName('class')}:${name.substr(1)}`;
            break;
        case '@':
            expanded = `${this.config_.GetDirectiveName('on')}:${name.substr(1)}`;
            break;
        }
        
        let matches = expanded.match(this.config_.GetDirectiveRegex());
        if (!matches || matches.length != 3 || !matches[2]){//Not a directive
            return null;
        }

        let raw: string = matches[2], arg: IDirectiveArg = {
            key: '',
            options: new Array<string>(),
        };

        let colonIndex = raw.indexOf(':'), options: Array<string>;
        if (colonIndex != -1){
            options = raw.substring(colonIndex + 1).split('.');
            arg.key = options[0];
            raw = raw.substring(0, colonIndex);
        }
        else{//No args
            options = raw.split('.');
            raw = options[0];
        }

        for (let i = 1; i < options.length; ++i){
            if (options[i] === 'camel'){
                arg.key = this.GetCamelCaseDirectiveName(arg.key);
            }
            else if (options[i] === 'capitalize'){
                arg.key = this.GetCamelCaseDirectiveName(arg.key, true);
            }
            else if (options[i] === 'join'){
                arg.key = arg.key.split('-').join('.');
            }
            else{
                arg.options.push(options[i]);
            }
        }
        
        return {
            original: name,
            expanded: expanded,
            parts: raw.split('-'),
            raw: raw,
            key: raw.split('-').join('.'),
            arg: arg,
            value: value,
        };
    }
    
    public GetCamelCaseDirectiveName(name: string, ucfirst = false): string{
        let converted = name.replace(/-([^-])/g, (...args) => (args[1].charAt(0).toUpperCase() + args[1].slice(1)));
        return ((ucfirst && 0 < converted.length) ? (converted.charAt(0).toUpperCase() + converted.slice(1)) : converted);
    }
}
