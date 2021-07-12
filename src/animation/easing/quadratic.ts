import { AnimationEase } from './generic';

export class QuadraticEase extends AnimationEase{
    public constructor(){
        super('quadratic', (time, duration) => {
            return (1 - Math.pow((1 - (time / duration)), 2));
        });
    }
}

export class QuadraticInEase extends AnimationEase{
    public constructor(){
        super('quadratic.in', (time, duration) => {
            return Math.pow((time / duration), 2);
        });
    }
}

export class QuadraticOutEase extends QuadraticEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class QuadraticInOutEase extends AnimationEase{
    public constructor(){
        super('quadratic.in.out', (time, duration) => {
            let fraction = (time / duration);
            return ((fraction < 0.5) ? (2 * Math.pow(fraction, 2)) : (1 - (Math.pow(((-2 * fraction) + 2), 2) / 2)));
        });
    }
}
