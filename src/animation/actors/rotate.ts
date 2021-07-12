import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";

export enum RotateAxis{
    X,
    Y,
    Z,
}

export enum RotateDirection{
    Clockwise,
    CounterClockwise,
}

export enum RotateOrigin{
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

export class RotateAnimationActor extends AnimationActor{
    protected computedOrigin_: string;
    
    public constructor(key: string, private axis_: RotateAxis, private direction_: RotateDirection, private angle_ = 360, protected origin_ = RotateOrigin.Nil,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number){
        super(key, (fraction, element) => {
            if (this.direction_ == RotateDirection.CounterClockwise){
                fraction = (1 - fraction);
            }
            
            let displacement = (fraction * ((this.angle_ <= 0 || this.angle_ > 360) ? 360 : this.angle_)), value = '';
            if (this.axis_ === RotateAxis.X){
                value = `rotateX(${displacement}deg)`;
            }
            else if (this.axis_ === RotateAxis.Y){
                value = `rotateY(${displacement}deg)`;
            }
            else if (this.axis_ === RotateAxis.Z){
                value = `rotateZ(${displacement}deg)`;
            }

            if (value){
                element.style.transform = element.style.transform.replace(/[ ]?rotate[XYZ]?\(.+?\)/g, '');
                element.style.transform += ` ${value}`;
            }
        }, (element) => {
            element.style.transformOrigin = this.computedOrigin_;
            element.style.transform = '';
        }, preferredEase, preferredDuration);

        if (this.origin_ == RotateOrigin.Top){
            this.computedOrigin_ = '50% 0%';
        }
        else if (this.origin_ == RotateOrigin.TopRight){
            this.computedOrigin_ = '100% 0%';
        }
        else if (this.origin_ == RotateOrigin.Right){
            this.computedOrigin_ = '100% 50%';
        }
        else if (this.origin_ == RotateOrigin.BottomRight){
            this.computedOrigin_ = '100% 100%';
        }
        else if (this.origin_ == RotateOrigin.Bottom){
            this.computedOrigin_ = '50% 100%';
        }
        else if (this.origin_ == RotateOrigin.BottomLeft){
            this.computedOrigin_ = '0% 100%';
        }
        else if (this.origin_ == RotateOrigin.Left){
            this.computedOrigin_ = '0% 50%';
        }
        else if (this.origin_ == RotateOrigin.TopLeft){
            this.computedOrigin_ = '0% 0%';
        }
        else{
            this.computedOrigin_ = '50% 50%';
        }
    }
}
