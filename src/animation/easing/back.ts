import { AnimationEase } from './generic';

export class BackEase extends AnimationEase{
    public constructor(){
        super('back', (time, duration) => {
            let fraction = (1 - (time / duration));
            return (1 - (fraction * fraction * ((2.70158 * fraction) - 1.70158)));
        });
    }
}

export class BackInEase extends AnimationEase{
    public constructor(){
        super('back.in', (time, duration) => {
            let fraction = (time / duration);
            return ((2.70158 * fraction * fraction * fraction) - (1.70158 * fraction * fraction));
        });
    }
}

export class BackOutEase extends BackEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class BackInOutEase extends AnimationEase{
    public constructor(){
        super('back.in.out', (time, duration) => {
            let fraction = (time / duration);
            
            const c1 = 1.70158;
            const c2 = c1 * 1.525;

            if (fraction < 0.5){
                return ((Math.pow(2 * fraction, 2) * ((c2 + 1) * 2 * fraction - c2)) / 2);
            }            
            
            return ((Math.pow(2 * fraction - 2, 2) * ((c2 + 1) * (fraction * 2 - 2) + c2) + 2) / 2);
        });
    }
}
