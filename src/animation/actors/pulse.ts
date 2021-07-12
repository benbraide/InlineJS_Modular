import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class PulseAnimationActor extends SceneAnimationActor{
    public constructor(private factor_ = 1.27){
        super('pulse', [{
            ranges: { from: 0, to: 50},
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, 1, this.factor_, false, 3),
        }, {
            ranges: { from: 50, to: 100 },
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, this.factor_, 1, false, 3),
        }], (fraction, element) => this.OnlyApply_(element, 1, false, 3), new SineEase(), 650);

        this.actionText_ = 'scale3d';
        this.actionRegex_ = /[ ]?scale3d?\(.+?\)/g;
    }
}
