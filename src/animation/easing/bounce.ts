import { AnimationEase } from './generic';

export class BounceEase extends AnimationEase{
    public constructor(){
        super('bounce', (time, duration) => {
            let fraction = (time / duration);
            if (fraction < (1 / 2.75)){
                return (7.5625 * fraction * fraction);
            }

			if (fraction < (2 / 2.75)){
				fraction -= (1.5 / 2.75);
				return ((7.5625 * fraction * fraction) + 0.75);
			}

			if (fraction < (2.5 / 2.75)){
				fraction -= (2.25 / 2.75);
				return ((7.5625 * fraction * fraction) + 0.9375);
			}
            
            fraction -= (2.625 / 2.75);
			return ((7.5625 * fraction * fraction) + 0.984375);
        });
    }
}

export class BounceInEase extends AnimationEase{
    private bounceEase_ = new BounceEase();
    
    public constructor(){
        super('bounce.in', (time, duration) => {
            return (1 - this.bounceEase_.Run((1 - (time / duration)), 1));
        });
    }

    public GetBounceEase(){
        return this.bounceEase_;
    }
}

export class BounceOutEase extends BounceEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class BounceInOutEase extends AnimationEase{
    private bounceInEase_ = new BounceInEase();
    
    public constructor(){
        super('bounce.in.out', (time, duration) => {
            let fraction = (time / duration);
            if (fraction < 0.5){
                return ((1 - this.bounceInEase_.Run((1 - (2 * fraction)), 1)) / 2);
            }
            
            return ((1 + this.bounceInEase_.GetBounceEase().Run(((2 * fraction) - 1), 1)) / 2);
        });
    }
}
