import { AnimationEase } from './generic';

export class CubicEase extends AnimationEase{
    public constructor(){
        super('cubic', (time, duration) => {
            return (1 - Math.pow((1 - (time / duration)), 3));
        });
    }
}

export class CubicInEase extends AnimationEase{
    public constructor(){
        super('cubic.in', (time, duration) => {
            return Math.pow((time / duration), 3);
        });
    }
}

export class CubicOutEase extends CubicEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class CubicInOutEase extends AnimationEase{
    public constructor(){
        super('cubic.in.out', (time, duration) => {
            let fraction = (time / duration);
            return ((fraction < 0.5) ? (4 * Math.pow(fraction, 3)) : (1 - (Math.pow(((-2 * fraction) + 2), 3) / 2)));
        });
    }
}
