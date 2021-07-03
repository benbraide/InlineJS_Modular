"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayAnimation = void 0;
const generic_1 = require("./generic");
const inverted_1 = require("./easing/inverted");
class DisplayAnimation extends generic_1.Animation {
    constructor(actors, ease, duration) {
        super(actors, ease, duration, false, 0);
        this.showEase_ = ease;
        this.hideEase_ = new inverted_1.InvertedEase(ease);
    }
    BindShow(target) {
        this.ease_ = this.showEase_;
        return this.Bind(target);
    }
    BindHide(target) {
        this.ease_ = this.hideEase_;
        return this.Bind(target);
    }
}
exports.DisplayAnimation = DisplayAnimation;
