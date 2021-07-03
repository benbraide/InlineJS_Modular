"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertGlobalHandler = exports.ConsoleGlobalHandler = exports.DocumentGlobalHandler = exports.WindowGlobalHandler = void 0;
const generic_1 = require("./generic");
class WindowGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('window', window);
    }
}
exports.WindowGlobalHandler = WindowGlobalHandler;
class DocumentGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('document', document);
    }
}
exports.DocumentGlobalHandler = DocumentGlobalHandler;
class ConsoleGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('console', console);
    }
}
exports.ConsoleGlobalHandler = ConsoleGlobalHandler;
class AlertGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('alert', () => window.alert.bind(window));
    }
}
exports.AlertGlobalHandler = AlertGlobalHandler;
