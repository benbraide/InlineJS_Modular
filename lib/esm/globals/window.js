import { GlobalHandler } from './generic';
export class WindowGlobalHandler extends GlobalHandler {
    constructor() {
        super('window', window);
    }
}
export class DocumentGlobalHandler extends GlobalHandler {
    constructor() {
        super('document', document);
    }
}
export class ConsoleGlobalHandler extends GlobalHandler {
    constructor() {
        super('console', console);
    }
}
export class AlertGlobalHandler extends GlobalHandler {
    constructor() {
        super('alert', () => window.alert.bind(window));
    }
}
