"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvertedEase = void 0;
const generic_1 = require("./generic");
class InvertedEase extends generic_1.AnimationEase {
    constructor(targetEase_) {
        super(`${targetEase_.GetKey()}.inverted`, (time, duration) => (1 - this.targetEase_.Run(time, duration)));
        this.targetEase_ = targetEase_;
    }
}
exports.InvertedEase = InvertedEase;
