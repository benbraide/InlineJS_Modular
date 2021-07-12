import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class SwingAnimationActor extends SceneAnimationActor{
    public constructor(private factor_ = 5){
        super('swing', [{
            ranges: { from: 0, to: 20 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0, 3),
        }, {
            ranges: { from: 20, to: 40 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 3, -2),
        }, {
            ranges: { from: 40, to: 60 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, -2, 1),
        }, {
            ranges: { from: 60, to: 80 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 1, -1),
        }, {
            ranges: { from: 80, to: 100 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, -1, 0),
        }], (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0, 0, 1), new SineEase(), 650);
    }

    private CustomComputeAndApply_(element: HTMLElement, fraction: number, from: number, to: number, y = 0){
        element.style.transform = element.style.transform.replace(/[ ]?rotate3d\(.+?\)/g, '');
        element.style.transform += ` rotate3d(0, ${y}, 1, ${SceneAnimationActor.Advance((from * this.factor_), (to * this.factor_), fraction)}deg)`;
    }
}
