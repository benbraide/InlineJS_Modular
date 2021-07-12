import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class JelloAnimationActor extends SceneAnimationActor{
    public constructor(private factor_ = 12.5, private divisor_ = 2){
        super('jello', [{
            ranges: { from: 11.1, to: 22.2 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 1),
        }, {
            ranges: { from: 22.2, to: 33.3 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 2),
        }, {
            ranges: { from: 33.3, to: 44.4 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 3),
        }, {
            ranges: { from: 44.4, to: 55.5 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 4),
        }, {
            ranges: { from: 55.5, to: 66.6 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 5),
        }, {
            ranges: { from: 66.6, to: 77.7 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 6),
        }, {
            ranges: { from: 77.7, to: 88.8 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 7),
        }, {
            ranges: { from: 88.8, to: 100 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 8),
        }], (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0), new SineEase(), 650);
    }

    private CustomComputeAndApply_(element: HTMLElement, fraction: number, count: number){
        element.style.transform = element.style.transform.replace(/[ ]?skew[XY]\(.+?\)/g, '');
        element.style.transform = element.style.transform.replace(/[ ]?translate3d\(.+?\)/g, '');

        if (count > 0){
            let from = ((count == 1) ? 0 : (this.factor_ / Math.pow(this.divisor_, (count - 1)))), to = (this.factor_ / Math.pow(this.divisor_, count));
            if ((count % 2) == 0){
                from = -from;
            }
            else{
                to = -to;
            }

            let value = SceneAnimationActor.Advance(from, to, fraction);
            element.style.transform += ` skewX(${value}deg) skewY(${value}deg)`;
        }
        else{
            element.style.transform += ` translate3d(0, 0, 0)`;
        }
    }
}
