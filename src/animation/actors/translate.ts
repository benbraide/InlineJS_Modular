import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";

export enum TranslateDirection{
    Up,
    Right,
    Down,
    Left,
}

export class TranslateAnimationActor extends AnimationActor{
    public constructor(key: string, protected direction_: TranslateDirection, protected displacement_ = 9999,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number){
        super(key, (fraction, element) => {
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
