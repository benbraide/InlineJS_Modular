import { AnimationActor } from "./generic";
export declare enum ScaleDirection {
    In = 0,
    Out = 1
}
export declare enum ScaleOrientation {
    Nil = 0,
    Reversed = 1,
    Horizontal = 2,
    ReversedHorizontal = 3,
    Vertical = 4,
    ReversedVertical = 5
}
export declare enum ScaleOrigin {
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
export declare class ScaleAnimationActor extends AnimationActor {
    protected direction_: ScaleDirection;
    protected orientation_: ScaleOrientation;
    protected origin_: ScaleOrigin;
    protected scale_: number;
    constructor(key: string, direction_: ScaleDirection, orientation_: ScaleOrientation, origin_?: ScaleOrigin, scale_?: number);
}
