import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export class TadaAnimationActor extends SceneAnimationActor{
    public constructor(private rotateFactor_ = 3, private scaleToFactor_ = 1.1, private scaleFromFactor_ = 0.9){
        super('tada', [{
            ranges: { from: 0, to: 10},
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0, this.rotateFactor_, 1, this.scaleFromFactor_, true),
        }, {
            ranges: { from: 10, to: 20 },
            handler: (fraction, element) => {},
        }, {
            ranges: { from: 20, to: 30 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, -this.rotateFactor_, this.rotateFactor_, this.scaleFromFactor_, this.scaleToFactor_),
        }, {
            ranges: [{ from: 40, to: 50 }, { from: 60, to: 70 }, { from: 80, to: 90 }],
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, -this.rotateFactor_, this.rotateFactor_, null, this.scaleToFactor_),
        }, {
            ranges: [{ from: 50, to: 60 }, { from: 70, to: 80 }],
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, this.rotateFactor_, -this.rotateFactor_, null, this.scaleToFactor_),
        }, {
            ranges: { from: 90, to: 100 },
            handler: (fraction, element) => this.CustomComputeAndApply_(element, fraction, this.rotateFactor_, 0, this.scaleToFactor_, 1),
        }], (fraction, element) => this.CustomComputeAndApply_(element, fraction, 0, 0, null, 1), new SineEase(), 650);
    }

    private CustomComputeAndApply_(element: HTMLElement, fraction: number, rotateFrom: number, rotateTo: number, scaleFrom: number, scaleTo: number, pivot = false){
        let scaleValue = ((scaleFrom === null) ? scaleTo : SceneAnimationActor.Advance(scaleFrom, scaleTo, fraction));
        let rotateValue = SceneAnimationActor.Advance(rotateFrom, rotateTo, fraction);
        let rotateTranslateValue = (pivot ? SceneAnimationActor.Advance(0, 1, fraction) : 1);

        element.style.transform = element.style.transform.replace(/[ ]?scale3d\(.+?\)/g, '');
        element.style.transform = element.style.transform.replace(/[ ]?rotate3d\(.+?\)/g, '');
        element.style.transform += ` scale3d(${scaleValue}, ${scaleValue}, ${scaleValue}) rotate3d(0, 0, ${rotateTranslateValue}, ${rotateValue}deg)`;
    }
}
