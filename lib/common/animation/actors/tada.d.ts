import { SceneAnimationActor } from "./scene";
export declare class TadaAnimationActor extends SceneAnimationActor {
    private rotateFactor_;
    private scaleToFactor_;
    private scaleFromFactor_;
    constructor(rotateFactor_?: number, scaleToFactor_?: number, scaleFromFactor_?: number);
    private CustomComputeAndApply_;
}
