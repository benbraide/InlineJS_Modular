"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearEase = void 0;
const generic_1 = require("./generic");
class LinearEase extends generic_1.AnimationEase {
    constructor() {
        super('linear', (time, duration) => ((duration == 0) ? 0 : (time / duration)));
    }
}
exports.LinearEase = LinearEase;
