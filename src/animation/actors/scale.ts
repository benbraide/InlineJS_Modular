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
    public constructor(key: string, protected direction_: ScaleDirection, protected orientation_: ScaleOrientation, protected origin_ = ScaleOrigin.Nil, protected scale_ = 1){
        super(key, (fraction, element) => {
            if (this.scale_ != 1 && this.scale_ != 0){
                if (this.direction_ === ScaleDirection.Out){
                    let scale = (1 / this.scale_);
                    fraction = ((fraction * scale) + scale);
                }
                else{//Grow
                    fraction = ((fraction * (this.scale_ - 1)) + 1);
                }
            }

            if (this.orientation_ == ScaleOrientation.Nil || this.orientation_ == ScaleOrientation.Reversed){
                element.style.transform += ` scale(${fraction}, ${fraction})`;
            }
            else if (this.orientation_ == ScaleOrientation.Horizontal || this.orientation_ == ScaleOrientation.ReversedHorizontal){
                element.style.transform += ` scaleX(${fraction})`;
            }
            else if (this.orientation_ == ScaleOrientation.Vertical || this.orientation_ == ScaleOrientation.ReversedVertical){
                element.style.transform += ` scaleY(${fraction})`;
            }
        }, (element) => {
            let isReversed = (this.orientation_ == ScaleOrientation.Reversed || this.orientation_ == ScaleOrientation.ReversedHorizontal ||
                this.orientation_ == ScaleOrientation.ReversedVertical), isNilOrigin = (this.origin_ == ScaleOrigin.Nil);

            if (this.orientation_ == ScaleOrientation.Nil || this.orientation_ == ScaleOrientation.Reversed){
                if (this.origin_ == ScaleOrigin.Top){
                    element.style.transformOrigin = (isReversed ? '50% 100%' : '50% 0%');
                }
                else if (this.origin_ == ScaleOrigin.TopRight){
                    element.style.transformOrigin = (isReversed ? '0% 100%' : '100% 0%');
                }
                else if (this.origin_ == ScaleOrigin.Right){
                    element.style.transformOrigin = (isReversed ? '0% 50%' : '100% 50%');
                }
                else if (this.origin_ == ScaleOrigin.BottomRight){
                    element.style.transformOrigin = (isReversed ? '0% 0%' : '100% 100%');
                }
                else if (this.origin_ == ScaleOrigin.Bottom){
                    element.style.transformOrigin = (isReversed ? '50% 0%' : '50% 100%');
                }
                else if (this.origin_ == ScaleOrigin.BottomLeft){
                    element.style.transformOrigin = (isReversed ? '100% 0%' : '0% 100%');
                }
                else if (this.origin_ == ScaleOrigin.Left){
                    element.style.transformOrigin = (isReversed ? '100% 50%' : '0% 50%');
                }
                else if (this.origin_ == ScaleOrigin.TopLeft){
                    element.style.transformOrigin = (isReversed ? '100% 100%' : '0% 0%');
                }
                else if (this.origin_ == ScaleOrigin.Center){
                    element.style.transformOrigin = '50% 50%';
                }
                else{
                    element.style.transformOrigin = '';
                }
            }
            else if (!isNilOrigin && (this.orientation_ == ScaleOrientation.Horizontal || this.orientation_ == ScaleOrientation.ReversedHorizontal)){
                element.style.transformOrigin = (isReversed ? '100% 50%' : '0% 50%');
            }
            else if (!isNilOrigin && (this.orientation_ == ScaleOrientation.Vertical || this.orientation_ == ScaleOrientation.ReversedVertical)){
                element.style.transformOrigin = (isReversed ? '50% 100%' : '50% 0%');
            }
            else{
                element.style.transformOrigin = '';
            }
            
            element.style.transform = '';
        });
    }
}
