import { IAnimation, IAnimationActor, IAnimationEase, AnimationBindInfo } from '../typedefs'

interface AnimationBindInternal{
    target: HTMLElement | ((fraction: number) => void);
    actors: Array<IAnimationActor>;
    ease: IAnimationEase;
    duration: number;
    isInfinite: boolean;
    interval: number;
    startTimestamp: DOMHighResTimeStamp;
    isActive: boolean;
    beforeHandlers: Array<() => void>;
    afterHandlers: Array<(isCanceled?: boolean) => void>;
}

export class Animation implements IAnimation{
    public constructor(protected actors_: Array<IAnimationActor>, protected ease_: IAnimationEase, protected duration_: number, protected isInfinite_ = false, protected interval_ = 0){}
    
    public Bind(target: HTMLElement | ((fraction: number) => void)): AnimationBindInfo{
        let info: AnimationBindInternal = {
            target: target,
            actors: this.actors_,
            ease: this.ease_,
            duration: (this.duration_ || 300),
            isInfinite: this.isInfinite_,
            interval: (this.interval_ || 0),
            startTimestamp: null,
            isActive: false,
            beforeHandlers: new Array<() => void>(),
            afterHandlers: new Array<(isCanceled?: boolean) => void>(),
        };

        let pass = (timestamp: DOMHighResTimeStamp) => {
            if (!info.isActive){
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
                
                requestAnimationFrame(pass);//Request next frame
            }
            else{//Step to final frame
                end();
            }
        };

        let end = (canceled = false) => {
            if (!info.isActive){
                return;
            }

            info.startTimestamp = null;
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

            if (!canceled && info.isInfinite){
                setTimeout(() => {//Schedule next run with the specified interval
                    requestAnimationFrame(pass);
                }, info.interval);
            }
            else{
                info.isActive = false;
            }
        };

        return {
            run: () => {
                if (info.isActive){
                    return;
                }
                
                info.isActive = true;
                setTimeout(() => {//Watcher - required if 'requestAnimationFrame' doesn't run
                    end();
                }, (info.duration + 72));
        
                requestAnimationFrame(pass);
            },
            cancel: (graceful = true) => {
                if (!graceful){
                    info.isActive = false;
                    info.startTimestamp = null;
                }
                else{
                    end(true);
                }
            },
            addBeforeHandler: (handler: () => void) => {
                info.beforeHandlers.push(handler);
            },
            removeBeforeHandler: (handler: () => void) => {
                info.beforeHandlers.splice(info.beforeHandlers.findIndex(item => (item === handler)));
            },
            addAfterHandler: (handler: (isCanceled?: boolean) => void) => {
                info.afterHandlers.push(handler);
            },
            removeAfterHandler: (handler: (isCanceled?: boolean) => void) => {
                info.afterHandlers.splice(info.afterHandlers.findIndex(item => (item === handler)));
            },
        };
    }
}
