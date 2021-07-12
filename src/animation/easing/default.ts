import { AnimationEase } from './generic';

export class DefaultEase extends AnimationEase{
    public constructor(){
        super('default', (time, duration) => ((time < duration) ? (-1 * Math.cos((time / duration) * (Math.PI / 2)) + 1) : 1));
    }
}
