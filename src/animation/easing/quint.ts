import { AnimationEase } from './generic';

export class QuintEase extends AnimationEase{
    public constructor(){
        super('quint', (time, duration) => {
            return (1 - Math.pow((1 - (time / duration)), 5));
        });
    }
}

export class QuintInEase extends AnimationEase{
    public constructor(){
        super('quint.in', (time, duration) => {
            return Math.pow((1 - (time / duration)), 5);
        });
    }
}

export class QuintOutEase extends QuintEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class QuintInOutEase extends AnimationEase{
    public constructor(){
        super('quint.in.out', (time, duration) => {
            let fraction = (time / duration);
            return ((fraction < 0.5) ? (16 * Math.pow(fraction, 5)) : (1 - (Math.pow(((-2 * fraction) + 2), 5) / 2)));
        });
    }
}
