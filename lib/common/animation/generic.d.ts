import { IAnimation, IAnimationActor, IAnimationEase, AnimationBindInfo, AnimationTargetType } from '../typedefs';
export declare class Animation implements IAnimation {
    protected actors_: Array<IAnimationActor>;
    protected ease_: IAnimationEase;
    protected duration_: number;
    protected isInfinite_: boolean;
    protected interval_: number;
    constructor(actors_: Array<IAnimationActor>, ease_: IAnimationEase, duration_: number, isInfinite_?: boolean, interval_?: number);
    Bind(target: AnimationTargetType): AnimationBindInfo;
}
