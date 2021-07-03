export class InvertedEase {
    constructor(targetEase_) {
        this.targetEase_ = targetEase_;
    }
    Run(time, duration) {
        return (1 - this.targetEase_.Run(time, duration));
    }
}
