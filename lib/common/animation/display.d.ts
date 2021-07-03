import { IAnimationActor, IAnimationEase } from '../typedefs';
import { Animation } from './generic';
export declare class DisplayAnimation extends Animation {
    private showEase_;
    private hideEase_;
    constructor(actors: Array<IAnimationActor>, ease: IAnimationEase, duration: number);
    BindShow(target: HTMLElement): import("../typedefs").AnimationBindInfo;
    BindHide(target: HTMLElement): import("../typedefs").AnimationBindInfo;
}
