export class Config {
    constructor() {
        this.enableOptimizedBinds_ = true;
        this.directivePrefix_ = 'x';
        this.directiveRegex_ = /^(data-)?x-(.+)$/;
        this.keyMap_ = {
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
        this.booleanAttributes_ = new Array('allowfullscreen', 'allowpaymentrequest', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected');
    }
    SetDirectivePrefix(value) {
        this.directivePrefix_ = value;
        this.directiveRegex_ = new RegExp(`^(data-)?${value}-(.+)$`);
    }
    GetDirectivePrefix() {
        return this.directivePrefix_;
    }
    GetDirectiveRegex() {
        return this.directiveRegex_;
    }
    GetDirectiveName(value, addDataPrefix = false) {
        return (addDataPrefix ? `data-${this.directivePrefix_}-${value}` : `${this.directivePrefix_}-${value}`);
    }
    AddKeyEventMap(key, target) {
        this.keyMap_[key] = target;
    }
    RemoveKeyEventMap(key) {
        delete this.keyMap_[key];
    }
    MapKeyEvent(key) {
        return ((key in this.keyMap_) ? this.keyMap_[key] : null);
    }
    AddBooleanAttribute(name) {
        this.booleanAttributes_.push(name);
    }
    RemoveBooleanAttribute(name) {
        let index = this.booleanAttributes_.indexOf(name);
        if (index < this.booleanAttributes_.length) {
            this.booleanAttributes_.splice(index, 1);
        }
    }
    IsBooleanAttribute(name) {
        return this.booleanAttributes_.includes(name);
    }
    SetOptimizedBindsState(enabled) {
        this.enableOptimizedBinds_ = enabled;
    }
    IsOptimizedBinds() {
        return this.enableOptimizedBinds_;
    }
}
