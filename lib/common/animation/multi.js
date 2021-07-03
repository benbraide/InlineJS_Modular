"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAnimation = void 0;
const generic_1 = require("./generic");
class MultiAnimation extends generic_1.Animation {
    constructor(multiActors, multiEase, duration, isInfinite = false, interval = 0) {
        super(Object.values(multiActors)[0], Object.values(multiEase)[0], duration, isInfinite, interval);
    }
    Add(key, actors, ease) {
        this.AddActors(key, actors);
        this.AddEase(key, ease);
    }
    AddActors(key, actors) {
        this.multiActors_[key] = actors;
        if (!this.actors_) {
            this.actors_ = actors;
        }
    }
    AddEase(key, ease) {
        this.multiEase_[key] = ease;
        if (!this.ease_) {
            this.ease_ = ease;
        }
    }
    Remove(key) {
        this.RemoveActors(key);
        this.RemoveEase(key);
    }
    RemoveActors(key) {
        if (!(key in this.multiActors_)) {
            return;
        }
        if (this.actors_ === this.multiActors_[key]) {
            this.actors_ = null;
        }
        delete this.multiActors_[key];
        if (!this.actors_ && Object.keys(this.multiActors_).length > 0) {
            this.actors_ = Object.values(this.multiActors_)[0];
        }
    }
    RemoveEase(key) {
        if (!(key in this.multiEase_)) {
            return;
        }
        if (this.ease_ === this.multiEase_[key]) {
            this.ease_ = null;
        }
        delete this.multiEase_[key];
        if (!this.ease_ && Object.keys(this.multiEase_).length > 0) {
            this.ease_ = Object.values(this.multiEase_)[0];
        }
    }
    SetActive(key) {
        this.SetActiveActors(key);
        this.SetActiveEase(key);
    }
    SetActiveActors(key) {
        if (key in this.multiActors_) {
            this.actors_ = this.multiActors_[key];
        }
    }
    SetActiveEase(key) {
        if (key in this.multiEase_) {
            this.ease_ = this.multiEase_[key];
        }
    }
}
exports.MultiAnimation = MultiAnimation;
