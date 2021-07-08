import { IConfig } from './typedefs'

export class Config implements IConfig{
    private enableOptimizedBinds_ = true;
    private directivePrefix_ = 'x';
    private directiveRegex_ = /^(data-)?x-(.+)$/;

    private keyMap_: Record<string, string> = {
        Ctrl: 'Control',
        Return: 'Enter',
        Esc: 'Escape',
        Space: ' ',
        Menu: 'ContextMenu',
        Del: 'Delete',
        Ins: 'Insert',
        Plus: '+',
        Minus: '-',
        Star: '*',
        Slash: '/',
    };

    private booleanAttributes_ = new Array<string>(
        'allowfullscreen', 'allowpaymentrequest', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
        'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'ismap', 'itemscope', 'loop', 'multiple', 'muted',
        'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected',
    );

    public constructor (private appName_ = ''){}

    public SetAppName(name: string): void{
        this.appName_ = name;
    }

    public GetAppName(): string{
        return this.appName_;
    }
    
    public SetDirectivePrefix(value: string){
        this.directivePrefix_ = value;
        this.directiveRegex_ = new RegExp(`^(data-)?${value}-(.+)$`);
    }

    public GetDirectivePrefix(){
        return this.directivePrefix_;
    }

    public GetDirectiveRegex(){
        return this.directiveRegex_;
    }

    public GetDirectiveName(value: string, addDataPrefix = false){
        return (addDataPrefix ? `data-${this.directivePrefix_}-${value}` : `${this.directivePrefix_}-${value}`);
    }

    public AddKeyEventMap(key: string, target: string){
        this.keyMap_[key] = target;
    }

    public RemoveKeyEventMap(key: string){
        delete this.keyMap_[key];
    }

    public MapKeyEvent(key: string){
        return ((key in this.keyMap_) ? this.keyMap_[key] : null);
    }

    public AddBooleanAttribute(name: string){
        this.booleanAttributes_.push(name);
    }

    public RemoveBooleanAttribute(name: string){
        let index = this.booleanAttributes_.indexOf(name);
        if (index < this.booleanAttributes_.length){
            this.booleanAttributes_.splice(index, 1);
        }
    }

    public IsBooleanAttribute(name: string){
        return this.booleanAttributes_.includes(name);
    }

    public SetOptimizedBindsState(enabled: boolean){
        this.enableOptimizedBinds_ = enabled;
    }

    public IsOptimizedBinds(){
        return this.enableOptimizedBinds_;
    }
}
