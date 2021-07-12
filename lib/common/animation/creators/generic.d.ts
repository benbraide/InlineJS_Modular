import { AnimationTargetType, IParsedCreator, IParsedCreatorReturn } from "../../typedefs";
export declare class ParsedCreator<T> implements IParsedCreator<T> {
    protected key_: string;
    protected create_: (options: Array<string>, index?: number, target?: AnimationTargetType) => IParsedCreatorReturn<T>;
    constructor(key_: string, create_: (options: Array<string>, index?: number, target?: AnimationTargetType) => IParsedCreatorReturn<T>);
    GetKey(): string;
    Create(options: Array<string>, index?: number, target?: AnimationTargetType): IParsedCreatorReturn<T>;
}
