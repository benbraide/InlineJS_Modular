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
        if (!target) {
            return null;
        }
        let info = {
            target: target,
            actors: this.actors_,
            ease: this.ease_,
            duration: (this.duration_ || 300),
            isInfinite: this.isInfinite_,
            interval: (this.interval_ || 0),
            startTimestamp: null,
            isActive: false,
            checkpoint: 0,
            beforeHandlers: new Array(),
            afterHandlers: new Array(),
            data: null,
        };
        let callBeforeHandlers = () => {
            info.beforeHandlers.forEach((handler) => {
                try {
                    handler(info.data);
                }
                catch (_a) { }
            });
        };
        let callAfterHandlers = (canceled) => {
            info.afterHandlers.forEach((handler) => {
                try {
                    handler(canceled, info.data);
                }
                catch (_a) { }
            });
        };
        let bindPass = (checkpoint) => pass.bind(null, checkpoint);
        let pass = (checkpoint, timestamp) => {
            if (!info.isActive || checkpoint != info.checkpoint) {
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
                requestAnimationFrame(bindPass(checkpoint)); //Request next frame
            }
            else { //Step to final frame
                end(false, checkpoint);
            }
        };
        let runEnd = (canceled = false) => {
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
            callAfterHandlers(canceled);
            info.isActive = false;
        };
        let end = (canceled = false, checkpoint) => {
            if (!info.isActive || ((checkpoint || checkpoint === 0) && checkpoint != info.checkpoint)) {
                return;
            }
            info.startTimestamp = null;
            runEnd(canceled);
            if (!canceled && info.isInfinite && (checkpoint || checkpoint === 0)) { //Schedule next run with the specified interval
                info.isActive = true;
                setTimeout(() => {
                    if (info.isActive) {
                        checkpoint = ++info.checkpoint;
                        callBeforeHandlers();
                        requestAnimationFrame(bindPass(checkpoint));
                    }
                }, info.interval);
            }
        };
        return {
            run: (data, endOnly = false) => {
                if (info.isActive) {
                    return;
                }
                info.isActive = true;
                info.data = data;
                callBeforeHandlers();
                if (endOnly) {
                    runEnd();
                    return;
                }
                let checkpoint = ++info.checkpoint;
                setTimeout(() => {
                    end(false, checkpoint);
                }, (info.duration + 72));
                requestAnimationFrame(bindPass(checkpoint));
            },
            cancel: (graceful = true) => {
                ++info.checkpoint;
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
            getTarget: () => info.target,
        };
    }
}
exports.Animation = Animation;
