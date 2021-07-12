import { IAnimationEase } from "../../typedefs";
import { SceneAnimationActor } from "./scene";
export declare enum DisplaceAxis {
    X = 0,
    Y = 1,
    Z = 2
}
export declare enum DisplaceAction {
    Translate = 0,
    Rotate = 1
}
export declare class DisplaceAnimationActor extends SceneAnimationActor {
    protected axis_: DisplaceAxis;
    protected action_: DisplaceAction;
    protected displacement_: number;
    constructor(key: string, axis_: DisplaceAxis, action_: DisplaceAction, displacement_?: number, preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number, prepare?: (element: HTMLElement) => void);
}
