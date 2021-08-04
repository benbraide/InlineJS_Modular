"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowAlertGlobalHandler = exports.ConsoleGlobalHandler = exports.BodyGlobalHandler = exports.DocumentGlobalHandler = exports.WindowGlobalHandler = void 0;
const generic_1 = require("./generic");
class WindowGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('window', window);
    }
}
exports.WindowGlobalHandler = WindowGlobalHandler;
class DocumentGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('document', document);
    }
}
exports.DocumentGlobalHandler = DocumentGlobalHandler;
class BodyGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('body', document.body);
    }
}
exports.BodyGlobalHandler = BodyGlobalHandler;
class ConsoleGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('console', console);
    }
}
exports.ConsoleGlobalHandler = ConsoleGlobalHandler;
class WindowAlertGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('windowAlert', () => window.alert.bind(window));
    }
}
exports.WindowAlertGlobalHandler = WindowAlertGlobalHandler;
