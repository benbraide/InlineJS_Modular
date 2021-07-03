import { IAnimationEase } from '../../typedefs';
export declare class LinearEase implements IAnimationEase {
    Run(time: number, duration: number): number;
}
