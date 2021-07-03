"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvertedEase = void 0;
class InvertedEase {
    constructor(targetEase_) {
        this.targetEase_ = targetEase_;
    }
    Run(time, duration) {
        return (1 - this.targetEase_.Run(time, duration));
    }
}
exports.InvertedEase = InvertedEase;
