import { SceneAnimationActor } from "./scene";
export declare class RubberbandAnimationActor extends SceneAnimationActor {
    private factor_;
    private subtractor_;
    constructor(factor_?: number, subtractor_?: number);
    private CustomComputeAndApply_;
    private GetSubtractingFactor_;
}
