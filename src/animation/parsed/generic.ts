import { IAnimationActor, IAnimationEase, IParsedAnimation, AnimationBindInfo, AnimationTargetType } from "../../typedefs";
import { OpacityAnimationActor } from "../actors/opacity";
import { InvertedEase } from "../easing/inverted";
import { LinearEase } from "../easing/linear";
import { MultiAnimation } from "../multi";

export enum ParsedElementAnimationMode{
    Nil,
    ShowOnly,
    HideOnly,
}

export interface ParsedElementAnimationOptions{
    actors: Array<IAnimationActor>;
    eases: Array<IAnimationEase>;
    durations: Array<number>;
    target?: AnimationTargetType;
}

interface ParsedElementAnimationActors{
    show: IAnimationActor;
    hide: IAnimationActor;
}

interface ParsedElementAnimationEases{
    show: IAnimationEase;
    hide: IAnimationEase;
}

interface ParsedElementAnimationDurations{
    show: number;
    hide: number;
}

export class ParsedAnimation implements IParsedAnimation{
    private multi_: MultiAnimation;
    private bounds_ = new Array<AnimationBindInfo>();
    
    private actors_: ParsedElementAnimationActors;
    private eases_: ParsedElementAnimationEases;
    private durations_: ParsedElementAnimationDurations;
    private target_: AnimationTargetType;

    private beforeHandlers_ = new Array<() => void>();
    private afterHandlers_ = new Array<(isCanceled?: boolean) => void>();
    
    public constructor(options: ParsedElementAnimationOptions, private mode_ = ParsedElementAnimationMode.Nil){
        let showActor = (((options.actors.length > 0) ? options.actors[0] : null) || new OpacityAnimationActor());
        this.actors_ = {
            show: showActor,
            hide: (((options.actors.length > 1) ? options.actors[1] : null) || showActor),
        };

        let showEase = (((options.eases.length > 0) ? options.eases[0] : null) || this.actors_.show.GetPreferredEase(true) || new LinearEase());
        this.eases_ = {
            show: showEase,
            hide: new InvertedEase(((options.eases.length > 1) ? options.eases[1] : null) || this.actors_.show.GetPreferredEase(false) || showEase),
        };

        let showDuration = (((options.durations.length > 0) ? options.durations[0] : 0) || this.actors_.show.GetPreferredDuration(true) || 300);
        this.durations_ = {
            show: showDuration,
            hide: (((options.durations.length > 1) ? options.durations[1] : 0) || this.actors_.show.GetPreferredDuration(false) || showDuration),
        };

        this.multi_ = new MultiAnimation({
            show: [this.actors_.show],
            hide: [this.actors_.hide],
        }, {
            show: this.eases_.show,
            hide: this.eases_.hide,
        }, {
            show: this.durations_.show,
            hide: this.durations_.hide,
        });

        this.target_ = options.target;
    }

    public Run(show: boolean, target?: AnimationTargetType, afterHandler?: (isCanceled?: boolean, show?: boolean) => void, beforeHandler?: (show?: boolean) => void): void{
        target = (target || this.target_);
        if (!target){
            this.RunNoAnimation_(show, beforeHandler, afterHandler);
            return;
        }

        let isNoAnimation = this.IsNoAnimation_(show), bound = this.ExtractExisting_(target);
        if (bound){
            bound.cancel(isNoAnimation);
        }

        if (isNoAnimation){
            this.RunNoAnimation_(show, beforeHandler, afterHandler);
            return;
        }

        this.multi_.SetActive(show ? 'show' : 'hide');
        bound = this.multi_.Bind(target);

        if (!bound){
            this.RunNoAnimation_(show, beforeHandler, afterHandler);
            return;
        }

        if (typeof target !== 'function'){
            bound.addBeforeHandler(() => {
                (target as HTMLElement).dispatchEvent(new CustomEvent('animation.enter', {
                    detail: { show: show },
                }));
            });

            bound.addAfterHandler((isCanceled) => {
                if (isCanceled){
                    (target as HTMLElement).dispatchEvent(new CustomEvent('animation.canceled', {
                        detail: { show: show },
                    }));
                }

                (target as HTMLElement).dispatchEvent(new CustomEvent('animation.leave', {
                    detail: { show: show },
                }));
            });
        }

        if (beforeHandler){
            bound.addBeforeHandler(beforeHandler);
        }

        if (afterHandler){
            bound.addAfterHandler(afterHandler);
        }

        this.beforeHandlers_.forEach(handler => bound.addBeforeHandler(handler));
        this.afterHandlers_.forEach(handler => bound.addAfterHandler(handler));

        this.bounds_.push(bound);
        bound.run();
    }

    public Cancel(target?: AnimationTargetType): void{
        let bound = this.ExtractExisting_(target);
        if (bound){
            bound.cancel(true);
        }
    }

    public Bind(target: HTMLElement): AnimationBindInfo{
        return null;
    }

    public BindOne(show: boolean, target?: AnimationTargetType): AnimationBindInfo{
        return null;
    }

    public AddBeforeHandler(handler: () => void): void{
        this.beforeHandlers_.push(handler);
    }

    public RemoveBeforeHandler(handler: () => void): void{
        this.beforeHandlers_.splice(this.beforeHandlers_.findIndex(item => (item === handler)), 1);
    }

    public AddAfterHandler(handler: (isCanceled?: boolean) => void): void{
        this.afterHandlers_.push(handler);
    }

    public RemoveAfterHandler(handler: (isCanceled?: boolean) => void): void{
        this.afterHandlers_.splice(this.afterHandlers_.findIndex(item => (item === handler)), 1);
    }

    private ExtractExisting_(target: AnimationTargetType){
        let index = this.bounds_.findIndex(bound => (bound.getTarget() === target));
        return ((index == -1) ? null : this.bounds_.splice(index, 1)[0]);
    }

    private RunNoAnimation_(show: boolean, beforeHandler: (show?: boolean) => void, afterHandler: (isCanceled?: boolean, show?: boolean) => void){
        if (beforeHandler){
            try{
                beforeHandler(show);
            }
            catch{}
        }

        if (afterHandler){
            try{
                afterHandler(false, show);
            }
            catch{}
        }
    }

    private IsNoAnimation_(show: boolean){
        return (show ? (this.mode_ == ParsedElementAnimationMode.HideOnly) : (this.mode_ == ParsedElementAnimationMode.ShowOnly));
    }
}
