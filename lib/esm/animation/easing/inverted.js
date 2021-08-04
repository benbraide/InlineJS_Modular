import { AnimationEase } from './generic';
export class InvertedEase extends AnimationEase {
    constructor(targetEase_) {
        super(`${targetEase_}#inverted`, (time, duration) => (1 - this.targetEase_.Run(time, duration)));
        this.targetEase_ = targetEase_;
    }
}
