import { DirectiveHandlerReturn } from './typedefs';
export class Processor {
    constructor(config_, directiveManager_) {
        this.config_ = config_;
        this.directiveManager_ = directiveManager_;
    }
    All(region, element, options) {
        if (!this.Check(element, options)) { //Check failed -- ignore
            return;
        }
        let isTemplate = (element.tagName == 'TEMPLATE');
        if (!isTemplate && (options === null || options === void 0 ? void 0 : options.checkTemplate) && element.closest('template')) { //Inside template -- ignore
            return;
        }
        this.Pre(region, element);
        if (this.One(region, element) != DirectiveHandlerReturn.QuitAll && !isTemplate) { //Process children
            Array.from(element.children).forEach(child => this.All(region, child));
        }
        this.Post(region, element);
    }
    One(region, element, options) {
        if (!this.Check(element, options)) { //Check failed -- ignore
            return DirectiveHandlerReturn.Nil;
        }
        let isTemplate = (element.tagName == 'TEMPLATE');
        if (!isTemplate && (options === null || options === void 0 ? void 0 : options.checkTemplate) && element.closest('template')) { //Inside template -- ignore
            return DirectiveHandlerReturn.Nil;
        }
        region.GetState().PushElementContext(element);
        let result = this.TraverseDirectives(element, (directive) => {
            return this.DispatchDirective(region, element, directive);
        });
        region.GetState().PopElementContext();
        return result;
    }
    Pre(region, element) {
        this.PreOrPost(region, element, 'preProcessCallbacks', 'Pre');
    }
    Post(region, element) {
        this.PreOrPost(region, element, 'postProcessCallbacks', 'Post');
    }
    PreOrPost(region, element, scopeKey, name) {
        let scope = region.GetElementScope(element);
        if (scope) {
            scope[scopeKey].splice(0).forEach((callback) => {
                try {
                    callback();
                }
                catch (err) {
                    region.GetState().ReportError(err, `InlineJs.Region<${region.GetId()}>.Processor.${name}(Element@${element.nodeName})`);
                }
            });
        }
    }
    DispatchDirective(region, element, directive) {
        let result;
        try {
            result = this.directiveManager_.Handle(region, element, directive);
            if (result == DirectiveHandlerReturn.Nil) {
                region.GetState().Warn('Handler not found for directive. Skipping...', `InlineJs.Region<${region.GetId()}>.Processor.DispatchDirective(Element@${element.nodeName}, ${directive.original})`);
            }
        }
        catch (err) {
            result = DirectiveHandlerReturn.Nil;
            region.GetState().ReportError(err, `InlineJs.Region<${region.GetId()}>.Processor.DispatchDirective(Element@${element.nodeName}, ${directive.original})`);
        }
        if (result != DirectiveHandlerReturn.Rejected && result != DirectiveHandlerReturn.QuitAll) {
            element.removeAttribute(directive.original);
        }
        return result;
    }
    Check(element, options) {
        if ((element === null || element === void 0 ? void 0 : element.nodeType) !== 1) { //Not an HTMLElement
            return false;
        }
        if ((options === null || options === void 0 ? void 0 : options.checkDocument) && !document.contains(element)) { //Node is not contained inside the document
            return false;
        }
        return true;
    }
    TraverseDirectives(element, callback) {
        let result = DirectiveHandlerReturn.Nil, attributes = Array.from(element.attributes);
        for (let i = 0; i < attributes.length; ++i) { //Traverse attributes
            let directive = this.GetDirectiveWith(attributes[i].name, attributes[i].value);
            if (directive) {
                let thisResult = callback(directive);
                if (thisResult != DirectiveHandlerReturn.Nil) {
                    result = thisResult;
                    if (thisResult == DirectiveHandlerReturn.Rejected || thisResult == DirectiveHandlerReturn.QuitAll) {
                        break;
                    }
                }
            }
        }
        return result;
    }
    GetDirective(attribute) {
        return this.GetDirectiveWith(attribute.name, attribute.value);
    }
    GetDirectiveWith(name, value) {
        if (!name || !(name = name.trim())) {
            return null;
        }
        let expanded = name;
        switch (name.substr(0, 1)) {
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
        if (!matches || matches.length != 3 || !matches[2]) { //Not a directive
            return null;
        }
        let raw = matches[2], arg = {
            key: '',
            options: new Array(),
        };
        let colonIndex = raw.indexOf(':'), options;
        if (colonIndex != -1) {
            options = raw.substr(colonIndex + 1).split('.');
            arg.key = options[0];
            raw = raw.substr(0, colonIndex);
        }
        else { //No args
            options = raw.split('.');
            raw = options[0];
        }
        for (let i = 1; i < options.length; ++i) {
            if (options[i] === 'camel') {
                arg.key = this.GetCamelCaseDirectiveName(arg.key);
            }
            else if (options[i] === 'capitalize') {
                arg.key = this.GetCamelCaseDirectiveName(arg.key, true);
            }
            else if (options[i] === 'join') {
                arg.key = arg.key.split('-').join('.');
            }
            else {
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
    GetCamelCaseDirectiveName(name, ucfirst = false) {
        let converted = name.replace(/-([^-])/g, (...args) => (args[1].charAt(0).toUpperCase() + args[1].slice(1)));
        return ((ucfirst && 0 < converted.length) ? (converted.charAt(0).toUpperCase() + converted.slice(1)) : converted);
    }
}
