import { IAnimationEase } from '../../typedefs'

export class InvertedEase implements IAnimationEase{
    public constructor(private targetEase_: IAnimationEase){}
    
    public Run(time: number, duration: number): number{
        return (1 - this.targetEase_.Run(time, duration));
    }
}
