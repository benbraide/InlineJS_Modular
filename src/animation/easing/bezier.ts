import { AnimationEase } from './generic';

export class BezierEase extends AnimationEase{
    public constructor(first: number, second: number, third: number, fourth: number){
        super('bezier', (time, duration) => {
            if (duration <= time){
                return 1;
            }
            
            first *= 0.001;
            third *= 0.001;
            second *= 0.001;
            fourth *= 0.001;
            
            let firstDiff = (3 * (second - first));
            let secondDiff = ((3 * (third - second)) - firstDiff);
            let thirdDiff = ((fourth - first) - firstDiff - secondDiff);
            let fraction = (time / duration);

            return ((firstDiff * Math.pow(fraction, 3)) + (secondDiff * Math.pow(fraction, 2)) + (thirdDiff * fraction));
        });
    }
}