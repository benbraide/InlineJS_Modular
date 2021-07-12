import { IAnimationEase } from "../../typedefs";
import { SineEase } from "../easing/sine";
import { SceneAnimationActor } from "./scene";

export enum DisplaceAxis{
    X,
    Y,
    Z,
}

export enum DisplaceAction{
    Translate,
    Rotate,
}

export class DisplaceAnimationActor extends SceneAnimationActor{
    public constructor(key: string, protected axis_: DisplaceAxis, protected action_: DisplaceAction, protected displacement_ = 0,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number, prepare?: (element: HTMLElement) => void){
        super(key, [{
            ranges: { from: 0, to: 10 },
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, 0, this.displacement_, true),
        }, {
            ranges: [{ from: 10, to: 20 }, { from: 30, to: 40 }, { from: 50, to: 60 }, { from: 70, to: 80 }],
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, -this.displacement_, this.displacement_, false),
        }, {
            ranges: [{ from: 20, to: 30 }, { from: 40, to: 50 }, { from: 60, to: 70 }, { from: 80, to: 90 }],
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, this.displacement_, -this.displacement_, false),
        }, {
            ranges: { from: 90, to: 100 },
            handler: (fraction, element) => this.ComputeAndApply_(element, fraction, -this.displacement_, 0, false),
        }], (fraction, element) => this.OnlyApply_(element, 0, false), (preferredEase || new SineEase()), preferredDuration, prepare);            

        if (this.action_ == DisplaceAction.Translate){
            this.actionText_ = `translate${(this.axis_ == DisplaceAxis.Y) ? 'Y' : 'X'}`;
            this.actionRegex_ = /[ ]?translate[XY]?\(.+?\)/g;
            this.unit_ = 'px';
            this.displacement_ = ((!this.displacement_ || this.displacement_ <= 0) ? 10 : this.displacement_);
        }
        else{//Rotate
            this.actionText_ = `rotate${(this.axis_ == DisplaceAxis.Y) ? 'Y' : ((this.axis_ == DisplaceAxis.X) ? 'X' : 'Z')}`;
            this.actionRegex_ = /[ ]?rotate[XYZ]?\(.+?\)/g;
            this.unit_ = 'deg';
            this.displacement_ = ((!this.displacement_ || this.displacement_ <= 0) ? 4 : this.displacement_);
        }
    }
}
