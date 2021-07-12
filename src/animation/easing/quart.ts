import { AnimationEase } from './generic';

export class QuartEase extends AnimationEase{
    public constructor(){
        super('quart', (time, duration) => {
            return (1 - Math.pow((1 - (time / duration)), 4));
        });
    }
}

export class QuartInEase extends AnimationEase{
    public constructor(){
        super('quart.in', (time, duration) => {
            return Math.pow((1 - (time / duration)), 4);
        });
    }
}

export class QuartOutEase extends QuartEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class QuartInOutEase extends AnimationEase{
    public constructor(){
        super('quart.in.out', (time, duration) => {
            let fraction = (time / duration);
            return ((fraction < 0.5) ? (8 * Math.pow(fraction, 4)) : (1 - (Math.pow(((-2 * fraction) + 2), 4) / 2)));
        });
    }
}
