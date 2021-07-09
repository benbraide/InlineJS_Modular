import { IAnimationEase } from '../../typedefs'

export class AnimationEase implements IAnimationEase{
    public constructor(protected key_: string, private run_: (time: number, duration: number) => number){}

    public GetKey(){
        return this.key_;
    }
    
    public Run(time: number, duration: number): number{
        return this.run_(time, duration);
    }
}
