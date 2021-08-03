import { SimpleGlobalHandler } from './generic'

export class WindowGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('window', window);
    }
}

export class DocumentGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('document', document);
    }
}

export class BodyGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('body', document.body);
    }
}

export class ConsoleGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('console', console);
    }
}

export class AlertGlobalHandler extends SimpleGlobalHandler{
    public constructor(){
        super('alert', () => window.alert.bind(window));
    }
}
