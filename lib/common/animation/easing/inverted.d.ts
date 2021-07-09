import { IAnimationEase } from '../../typedefs';
import { AnimationEase } from './generic';
export declare class InvertedEase extends AnimationEase {
    private targetEase_;
    constructor(targetEase_: IAnimationEase);
}
