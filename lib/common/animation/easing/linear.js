"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearEase = void 0;
class LinearEase {
    Run(time, duration) {
        return (time / duration);
    }
}
exports.LinearEase = LinearEase;
