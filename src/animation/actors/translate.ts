import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";

export enum TranslateDirection{
    Up,
    Right,
    Down,
    Left,
}

export enum TranslateMode{
    Nil,
    Reversed,
}

export class TranslateAnimationActor extends AnimationActor{
    public constructor(key: string, protected direction_: TranslateDirection, protected displacement_ = 9999, protected mode_ = TranslateMode.Nil,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number){
        super(key, (fraction, element) => {
            if (this.mode_ === TranslateMode.Reversed){
                fraction = (1 - fraction);
            }
            
            let displacement = (fraction * ((this.displacement_ <= 0) ? 9999 : this.displacement_)), value = '';
            if (this.direction_ === TranslateDirection.Up){
                value = `translateY(${-displacement}px)`;
            }
            else if (this.direction_ === TranslateDirection.Right){
                value = `translateX(${displacement}px)`;
            }
            else if (this.direction_ === TranslateDirection.Down){
                value = `translateY(${displacement}px)`;
            }
            else if (this.direction_ === TranslateDirection.Left){
                value = `translateX(${-displacement}px)`;
            }

            if (value){
                element.style.transform = element.style.transform.replace(/[ ]?translate[XY]?\(.+?\)/g, '');
                element.style.transform += ` ${value}`;
            }
        }, (element) => {
            element.style.transform = '';
        }, preferredEase, preferredDuration);
    }
}
