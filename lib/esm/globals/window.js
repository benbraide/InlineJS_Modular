import { SimpleGlobalHandler } from './generic';
export class WindowGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('window', window);
    }
}
export class DocumentGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('document', document);
    }
}
export class BodyGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('body', document.body);
    }
}
export class ConsoleGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('console', console);
    }
}
export class WindowAlertGlobalHandler extends SimpleGlobalHandler {
    constructor() {
        super('windowAlert', () => window.alert.bind(window));
    }
}
