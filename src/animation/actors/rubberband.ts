import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class RubberbandAnimationActor extends SceneAnimationActor{
    public constructor(private factor_ = 1.25, private subtractor_ = 0.10){
        super('rubberband', [{
            ranges: { from: 0, to: 30 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, -2, 0, -2, 5),
        }, {
            ranges: { from: 30, to: 40 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0, 5, 5, 0),
        }, {
            ranges: { from: 40, to: 50 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 5, 1, 0, 4),
        }, {
            ranges: { from: 50, to: 65 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 1, 3, 4, 2),
        }, {
            ranges: { from: 65, to: 75 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 3, 2, 2, 3),
        }, {
            ranges: { from: 75, to: 100 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 2, -2, 3, -2),
        }], (fraction, element) => this.CustomComputeAndApply_(element, fraction, null, 1, null, 1), new SineEase(), 650);
    }

    private CustomComputeAndApply_(element: HTMLElement, fraction: number, fromX: number, toX: number, fromY: number, toY: number){
        element.style.transform = element.style.transform.replace(/[ ]?scale3d\(.+?\)/g, '');

        let xValue = ((fromX === null) ? toX : SceneAnimationActor.Advance(this.GetSubtractingFactor_(fromX), this.GetSubtractingFactor_(toX), fraction));
        let yValue = ((fromY === null) ? toY : SceneAnimationActor.Advance(this.GetSubtractingFactor_(fromY), this.GetSubtractingFactor_(toY), fraction));
        
        element.style.transform += ` scale3d(${xValue}, ${yValue}, 1)`;
    }

    private GetSubtractingFactor_(value: number){
        return ((0 <= value) ? (this.factor_ - (this.subtractor_ * value)) : -(value + 1));
    }
}
