import { GlobalHandler } from './generic'

export class WindowGlobalHandler extends GlobalHandler{
    public constructor(){
        super('window', window);
    }
}

export class DocumentGlobalHandler extends GlobalHandler{
    public constructor(){
        super('document', document);
    }
}

export class ConsoleGlobalHandler extends GlobalHandler{
    public constructor(){
        super('console', console);
    }
}

export class AlertGlobalHandler extends GlobalHandler{
    public constructor(){
        super('alert', () => window.alert.bind(window));
    }
}
