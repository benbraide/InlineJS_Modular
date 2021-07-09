import { AnimationEase } from './generic';

export class LinearEase extends AnimationEase{
    public constructor(){
        super('linear', (time, duration) => ((duration == 0) ? 0 : (time / duration)));
    }
}
