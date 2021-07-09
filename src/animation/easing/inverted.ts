import { IAnimationEase } from '../../typedefs'
import { AnimationEase } from './generic';

export class InvertedEase extends AnimationEase{
    public constructor(private targetEase_: IAnimationEase){
        super(`${targetEase_}#inverted`, (time: number, duration: number) => (1 - this.targetEase_.Run(time, duration)));
    }
}
