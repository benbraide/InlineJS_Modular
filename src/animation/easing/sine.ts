import { AnimationEase } from './generic';

export class SineEase extends AnimationEase{
    public constructor(){
        super('sine', (time, duration) => {
            return Math.sin(((time / duration) * Math.PI) / 2);
        });
    }
}

export class SineInEase extends AnimationEase{
    public constructor(){
        super('sine.in', (time, duration) => {
            return (1 - Math.cos(((time / duration) * Math.PI) / 2));
        });
    }
}

export class SineOutEase extends SineEase{
    public constructor(){
        super();
        this.key_ = `${this.key_}.out`;
    }
}

export class SineInOutEase extends AnimationEase{
    public constructor(){
        super('sine.in.out', (time, duration) => {
            return (-(Math.cos(Math.PI * (time / duration)) - 1) / 2);
        });
    }
}
