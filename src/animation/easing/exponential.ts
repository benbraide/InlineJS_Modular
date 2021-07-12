import { AnimationEase } from './generic';

export class ExponentialEase extends AnimationEase{
    public constructor(){
        super('exponential', (time, duration) => {
            let fraction = (time / duration);
            if (fraction == 1){
                return fraction;
            }

            return (1 - Math.pow(2, (-10 * fraction)));
        });
    }
}

export class ExponentialInEase extends AnimationEase{
    public constructor(){
        super('exponential.in', (time, duration) => {
            let fraction = (time / duration);
            return ((fraction == 0) ? 0 : Math.pow(2, ((10 * fraction) - 10)));
        });
    }
}

export class ExponentialOutEase extends ExponentialEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class ExponentialInOutEase extends AnimationEase{
    public constructor(){
        super('exponential.in.out', (time, duration) => {
            let fraction = (time / duration);
            if (fraction == 1){
                return fraction;
            }

            return (1 - Math.pow(2, (-10 * fraction)));
        });
    }
}
