import { AnimationEase } from './generic';

export class CircleEase extends AnimationEase{
    public constructor(){
        super('circle', (time, duration) => {
            let fraction = (time / duration);
            return Math.sqrt(1 - Math.pow((fraction - 1), 2));
        });
    }
}

export class CircleInEase extends AnimationEase{
    public constructor(){
        super('circle.in', (time, duration) => {
            let fraction = (time / duration);
            return (1 - Math.sqrt(1 - Math.pow(fraction, 2)));
        });
    }
}

export class CircleOutEase extends CircleEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class CircleInOutEase extends AnimationEase{
    public constructor(){
        super('circle.in.out', (time, duration) => {
            let fraction = (time / duration);
            return (fraction < 0.5) ? ((1 - Math.sqrt(1 - Math.pow((2 * fraction), 2))) / 2) : ((Math.sqrt(1 - Math.pow(((-2 * fraction) + 2), 2)) + 1) / 2);
        });
    }
}
