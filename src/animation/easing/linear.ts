import { IAnimationEase } from '../../typedefs'

export class LinearEase implements IAnimationEase{
    public Run(time: number, duration: number): number{
        return (time / duration);
    }
}
