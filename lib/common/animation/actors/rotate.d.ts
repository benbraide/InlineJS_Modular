import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";
export declare enum RotateAxis {
    X = 0,
    Y = 1,
    Z = 2
}
export declare enum RotateDirection {
    Clockwise = 0,
    CounterClockwise = 1
}
export declare enum RotateOrigin {
    Nil = 0,
    Top = 1,
    TopRight = 2,
    Right = 3,
    BottomRight = 4,
    Bottom = 5,
    BottomLeft = 6,
    Left = 7,
    TopLeft = 8,
    Center = 9
}
export declare class RotateAnimationActor extends AnimationActor {
    private axis_;
    private direction_;
    private angle_;
    protected origin_: RotateOrigin;
    protected computedOrigin_: string;
    constructor(key: string, axis_: RotateAxis, direction_: RotateDirection, angle_?: number, origin_?: RotateOrigin, preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number);
}
