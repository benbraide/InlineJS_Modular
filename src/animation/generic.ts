import { IAnimation, IAnimationActor, IAnimationEase, AnimationBindInfo, AnimationTargetType } from '../typedefs'

interface AnimationBindInternal{
    target: HTMLElement | ((fraction: number) => void);
    actors: Array<IAnimationActor>;
    ease: IAnimationEase;
    duration: number;
    isInfinite: boolean;
    interval: number;
    startTimestamp: DOMHighResTimeStamp;
    isActive: boolean;
    checkpoint: number;
    beforeHandlers: Array<(data?: any) => void>;
    afterHandlers: Array<(isCanceled?: boolean, data?: any) => void>;
    data?: any;
}

export class Animation implements IAnimation{
    public constructor(protected actors_: Array<IAnimationActor>, protected ease_: IAnimationEase, protected duration_: number, protected isInfinite_ = false, protected interval_ = 0){}
    
    public Bind(target: AnimationTargetType): AnimationBindInfo{
        if (!target){
            return null;
        }
        
        let info: AnimationBindInternal = {
            target: target,
            actors: this.actors_,
            ease: this.ease_,
            duration: (this.duration_ || 300),
            isInfinite: this.isInfinite_,
            interval: (this.interval_ || 0),
            startTimestamp: null,
            isActive: false,
            checkpoint: 0,
            beforeHandlers: new Array<() => void>(),
            afterHandlers: new Array<(isCanceled?: boolean) => void>(),
            data: null,
        };

        let callBeforeHandlers = () => {
            info.beforeHandlers.forEach((handler) => {
                try{
                    handler(info.data);
                }
                catch{}
            });
        };
        
        let callAfterHandlers = (canceled: boolean) => {
            info.afterHandlers.forEach((handler) => {
                try{
                    handler(canceled, info.data);
                }
                catch{}
            });
        };

        let bindPass = (checkpoint: number) => pass.bind(null, checkpoint);

        let pass = (checkpoint: number, timestamp: DOMHighResTimeStamp) => {
            if (!info.isActive || checkpoint != info.checkpoint){
                return;
            }
            
            if (info.startTimestamp === null){//First entry
                info.startTimestamp = timestamp;
                if (info.target && info.target instanceof HTMLElement){
                    info.actors.forEach((actor) => {
                        try{
                            actor.Prepare(info.target as HTMLElement);
                        }
                        catch{};
                    });
                }
                else if (info.target && typeof info.target === 'function'){
                    try{
                        info.target(null);
                    }
                    catch{}
                }
            }

            let ellapsed = (timestamp - info.startTimestamp);
            if (ellapsed < info.duration){
                let fraction = info.ease.Run(ellapsed, info.duration);
                if (info.target && info.target instanceof HTMLElement){
                    info.actors.forEach((actor) => {
                        try{
                            actor.Step(fraction, info.target as HTMLElement);
                        }
                        catch{};
                    });
                }
                else if (info.target && typeof info.target === 'function'){
                    try{
                        info.target(fraction);
                    }
                    catch{};
                }
                
                requestAnimationFrame(bindPass(checkpoint));//Request next frame
            }
            else{//Step to final frame
                end(false, checkpoint);
            }
        };

        let runEnd = (canceled = false) => {
            let fraction = info.ease.Run(info.duration, info.duration);
            if (info.target && info.target instanceof HTMLElement){
                info.actors.forEach((actor) => {
                    try{
                        actor.Step(fraction, info.target as HTMLElement);
                    }
                    catch{};
                });
            }
            else if (info.target && typeof info.target === 'function'){
                try{
                    info.target(fraction);
                }
                catch{};
            }

            callAfterHandlers(canceled);
            info.isActive = false;
        };

        let end = (canceled = false, checkpoint?: number) => {
            if (!info.isActive || ((checkpoint || checkpoint === 0) && checkpoint != info.checkpoint)){
                return;
            }

            info.startTimestamp = null;
            runEnd(canceled);

            if (!canceled && info.isInfinite && (checkpoint || checkpoint === 0)){//Schedule next run with the specified interval
                info.isActive = true;
                setTimeout(() => {
                    if (info.isActive){
                        checkpoint = ++info.checkpoint;
                        callBeforeHandlers();
                        requestAnimationFrame(bindPass(checkpoint));
                    }
                }, info.interval);
            }
        };

        return {
            run: (data?: any, endOnly = false) => {
                if (info.isActive){
                    return;
                }

                info.isActive = true;
                info.data = data;
                
                callBeforeHandlers();
                if (endOnly){
                    runEnd();
                    return;
                }

                let checkpoint = ++info.checkpoint;
                setTimeout(() => {//Watcher - required if 'requestAnimationFrame' doesn't run
                    end(false, checkpoint);
                }, (info.duration + 72));
        
                requestAnimationFrame(bindPass(checkpoint));
            },
            cancel: (graceful = true) => {
                ++info.checkpoint;
                if (!graceful){
                    info.isActive = false;
                    info.startTimestamp = null;
                }
                else{
                    end(true);
                }
            },
            addBeforeHandler: (handler: (data?: any) => void) => {
                info.beforeHandlers.push(handler);
            },
            removeBeforeHandler: (handler: (data?: any) => void) => {
                info.beforeHandlers.splice(info.beforeHandlers.findIndex(item => (item === handler)));
            },
            addAfterHandler: (handler: (isCanceled?: boolean, data?: any) => void) => {
                info.afterHandlers.push(handler);
            },
            removeAfterHandler: (handler: (isCanceled?: boolean, data?: any) => void) => {
                info.afterHandlers.splice(info.afterHandlers.findIndex(item => (item === handler)));
            },
            getTarget: () => info.target,
        };
    }
}
