import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class HeartbeatAnimationActor extends SceneAnimationActor{
    public constructor(private factor_ = 1.3){
        super('heartbeat', [{
            ranges: [{ from: 0, to: 14 }, { from: 28, to: 42 }],
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, 1, this.factor_, false),
        }, {
            ranges: [{ from: 14, to: 28 }, { from: 42, to: 70 }],
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, this.factor_, 1, false),
        }], (fraction, element) => this.OnlyApply_(element, 1, false), new SineEase(), 500);

        this.actionText_ = 'scale';
        this.actionRegex_ = /[ ]?scale[XY]?\(.+?\)/g;
    }
}
