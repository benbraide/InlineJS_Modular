import { AnimationEase } from './generic';

export class ElasticEase extends AnimationEase{
    public constructor(){
        super('elastic', (time, duration) => {
            let fraction = (time / duration);
            if (fraction == 0 || fraction == 1){
                return fraction;
            }

            return (Math.pow(2, (-10 * fraction)) * Math.sin(((fraction * 10) - 0.75) * ((2 * Math.PI) / 3)) + 1);
        });
    }
}

export class ElasticInEase extends AnimationEase{
    public constructor(){
        super('elastic.in', (time, duration) => {
            const c4 = (2 * Math.PI) / 3;
            let fraction = (time / duration);
            return ((fraction == 0) ? 0 : ((fraction == 1) ? 1 : -Math.pow(2, 10 * fraction - 10) * Math.sin((fraction * 10 - 10.75) * c4)));
        });
    }
}

export class ElasticOutEase extends ElasticEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class ElasticInOutEase extends AnimationEase{
    public constructor(){
        super('elastic.in.out', (time, duration) => {
            let fraction = (time / duration);
            if (fraction == 0 || fraction == 1){
                return fraction;
            }
            
            const c5 = (2 * Math.PI) / 4.5;
            if (fraction < 0.5){
                return (-(Math.pow(2, 20 * fraction - 10) * Math.sin((20 * fraction - 11.125) * c5)) / 2);
            }
            
            return ((Math.pow(2, -20 * fraction + 10) * Math.sin((20 * fraction - 11.125) * c5)) / 2 + 1);
        });
    }
}
