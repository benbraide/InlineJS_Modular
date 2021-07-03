"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animation = void 0;
class Animation {
    constructor(actors_, ease_, duration_, isInfinite_ = false, interval_ = 0) {
        this.actors_ = actors_;
        this.ease_ = ease_;
        this.duration_ = duration_;
        this.isInfinite_ = isInfinite_;
        this.interval_ = interval_;
    }
    Bind(target) {
        let info = {
            target: target,
            actors: this.actors_,
            ease: this.ease_,
            duration: (this.duration_ || 300),
            isInfinite: this.isInfinite_,
            interval: (this.interval_ || 0),
            startTimestamp: null,
            isActive: false,
            beforeHandlers: new Array(),
            afterHandlers: new Array(),
        };
        let pass = (timestamp) => {
            if (!info.isActive) {
                return;
            }
            if (info.startTimestamp === null) { //First entry
                info.startTimestamp = timestamp;
                if (info.target && info.target instanceof HTMLElement) {
                    info.actors.forEach((actor) => {
                        try {
                            actor.Prepare(info.target);
                        }
                        catch (_a) { }
                        ;
                    });
                }
                else if (info.target && typeof info.target === 'function') {
                    try {
                        info.target(null);
                    }
                    catch (_a) { }
                }
            }
            let ellapsed = (timestamp - info.startTimestamp);
            if (ellapsed < info.duration) {
                let fraction = info.ease.Run(ellapsed, info.duration);
                if (info.target && info.target instanceof HTMLElement) {
                    info.actors.forEach((actor) => {
                        try {
                            actor.Step(fraction, info.target);
                        }
                        catch (_a) { }
                        ;
                    });
                }
                else if (info.target && typeof info.target === 'function') {
                    try {
                        info.target(fraction);
                    }
                    catch (_b) { }
                    ;
                }
                requestAnimationFrame(pass); //Request next frame
            }
            else { //Step to final frame
                end();
            }
        };
        let end = (canceled = false) => {
            if (!info.isActive) {
                return;
            }
            info.startTimestamp = null;
            let fraction = info.ease.Run(info.duration, info.duration);
            if (info.target && info.target instanceof HTMLElement) {
                info.actors.forEach((actor) => {
                    try {
                        actor.Step(fraction, info.target);
                    }
                    catch (_a) { }
                    ;
                });
            }
            else if (info.target && typeof info.target === 'function') {
                try {
                    info.target(fraction);
                }
                catch (_a) { }
                ;
            }
            if (!canceled && info.isInfinite) {
                setTimeout(() => {
                    requestAnimationFrame(pass);
                }, info.interval);
            }
            else {
                info.isActive = false;
            }
        };
        return {
            run: () => {
                if (info.isActive) {
                    return;
                }
                info.isActive = true;
                setTimeout(() => {
                    end();
                }, (info.duration + 72));
                requestAnimationFrame(pass);
            },
            cancel: (graceful = true) => {
                if (!graceful) {
                    info.isActive = false;
                    info.startTimestamp = null;
                }
                else {
                    end(true);
                }
            },
            addBeforeHandler: (handler) => {
                info.beforeHandlers.push(handler);
            },
            removeBeforeHandler: (handler) => {
                info.beforeHandlers.splice(info.beforeHandlers.findIndex(item => (item === handler)));
            },
            addAfterHandler: (handler) => {
                info.afterHandlers.push(handler);
            },
            removeAfterHandler: (handler) => {
                info.afterHandlers.splice(info.afterHandlers.findIndex(item => (item === handler)));
            },
        };
    }
}
exports.Animation = Animation;
