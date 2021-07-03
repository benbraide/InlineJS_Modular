import { IAnimationEase } from '../../typedefs';
export declare class InvertedEase implements IAnimationEase {
    private targetEase_;
    constructor(targetEase_: IAnimationEase);
    Run(time: number, duration: number): number;
}
