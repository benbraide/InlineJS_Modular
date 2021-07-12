import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";
export declare enum TranslateDirection {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3
}
export declare class TranslateAnimationActor extends AnimationActor {
    protected direction_: TranslateDirection;
    protected displacement_: number;
    constructor(key: string, direction_: TranslateDirection, displacement_?: number, preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number);
}
