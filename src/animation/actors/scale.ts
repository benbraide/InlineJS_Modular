import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";

export enum ScaleDirection{
    In,
    Out,
}

export enum ScaleOrientation{
    Nil,
    Reversed,
    Horizontal,
    ReversedHorizontal,
    Vertical,
    ReversedVertical,
}

export enum ScaleOrigin{
    Nil,
    Top,
    TopRight,
    Right,
    BottomRight,
    Bottom,
    BottomLeft,
    Left,
    TopLeft,
    Center,
}

export class ScaleAnimationActor extends AnimationActor{
    protected computedOrigin_: string;
    
    public constructor(key: string, protected direction_: ScaleDirection, protected orientation_: ScaleOrientation, protected origin_ = ScaleOrigin.Nil, protected scale_ = 1,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number){
        super(key, (fraction, element) => {
            if (this.scale_ != 1 && this.scale_ != 0){
                if (this.direction_ === ScaleDirection.Out){
                    let scale = (1 / this.scale_);
                    fraction = (((1 - fraction) * scale) + scale);
                }
                else{//Grow
                    fraction = ((fraction * (this.scale_ - 1)) + 1);
                }
            }

            let value = '';
            if (this.orientation_ == ScaleOrientation.Nil || this.orientation_ == ScaleOrientation.Reversed){
                value = `scale(${fraction}, ${fraction})`;
            }
            else if (this.orientation_ == ScaleOrientation.Horizontal || this.orientation_ == ScaleOrientation.ReversedHorizontal){
                value = `scaleX(${fraction})`;
            }
            else if (this.orientation_ == ScaleOrientation.Vertical || this.orientation_ == ScaleOrientation.ReversedVertical){
                value = `scaleY(${fraction})`;
            }

            if (value){
                element.style.transform = element.style.transform.replace(/[ ]?scale[XY]?\(.+?\)/g, '');
                element.style.transform += ` ${value}`;
            }
        }, (element) => {
            element.style.transformOrigin = this.computedOrigin_;
            element.style.transform = '';
        }, preferredEase, preferredDuration);

        let isReversed = (this.orientation_ == ScaleOrientation.Reversed || this.orientation_ == ScaleOrientation.ReversedHorizontal ||
            this.orientation_ == ScaleOrientation.ReversedVertical), isNilOrigin = (this.origin_ == ScaleOrigin.Nil);

        if (this.orientation_ == ScaleOrientation.Nil || this.orientation_ == ScaleOrientation.Reversed){
            if (this.origin_ == ScaleOrigin.Top){
                this.computedOrigin_ = (isReversed ? '50% 100%' : '50% 0%');
            }
            else if (this.origin_ == ScaleOrigin.TopRight){
                this.computedOrigin_ = (isReversed ? '0% 100%' : '100% 0%');
            }
            else if (this.origin_ == ScaleOrigin.Right){
                this.computedOrigin_ = (isReversed ? '0% 50%' : '100% 50%');
            }
            else if (this.origin_ == ScaleOrigin.BottomRight){
                this.computedOrigin_ = (isReversed ? '0% 0%' : '100% 100%');
            }
            else if (this.origin_ == ScaleOrigin.Bottom){
                this.computedOrigin_ = (isReversed ? '50% 0%' : '50% 100%');
            }
            else if (this.origin_ == ScaleOrigin.BottomLeft){
                this.computedOrigin_ = (isReversed ? '100% 0%' : '0% 100%');
            }
            else if (this.origin_ == ScaleOrigin.Left){
                this.computedOrigin_ = (isReversed ? '100% 50%' : '0% 50%');
            }
            else if (this.origin_ == ScaleOrigin.TopLeft){
                this.computedOrigin_ = (isReversed ? '100% 100%' : '0% 0%');
            }
            else if (this.origin_ == ScaleOrigin.Center){
                this.computedOrigin_ = '50% 50%';
            }
            else{
                this.computedOrigin_ = '';
            }
        }
        else if (!isNilOrigin && (this.orientation_ == ScaleOrientation.Horizontal || this.orientation_ == ScaleOrientation.ReversedHorizontal)){
            this.computedOrigin_ = (isReversed ? '100% 50%' : '0% 50%');
        }
        else if (!isNilOrigin && (this.orientation_ == ScaleOrientation.Vertical || this.orientation_ == ScaleOrientation.ReversedVertical)){
            this.computedOrigin_ = (isReversed ? '50% 100%' : '50% 0%');
        }
        else{
            this.computedOrigin_ = '';
        }
    }
}
