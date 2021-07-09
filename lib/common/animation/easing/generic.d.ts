import { IAnimationEase } from '../../typedefs';
export declare class AnimationEase implements IAnimationEase {
    protected key_: string;
    private run_;
    constructor(key_: string, run_: (time: number, duration: number) => number);
    GetKey(): string;
    Run(time: number, duration: number): number;
}
