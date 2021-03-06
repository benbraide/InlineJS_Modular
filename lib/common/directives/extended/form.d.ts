import { IRegion } from '../../typedefs';
import { ExtendedDirectiveHandler } from '../extended/generic';
export interface IFormMiddleware {
    GetKey(): string;
    Handle(data?: any, region?: IRegion, element?: HTMLElement): void | boolean | Promise<void | boolean>;
}
export declare class ConfirmFormMiddleware implements IFormMiddleware {
    GetKey(): string;
    Handle(data?: any): void | boolean | Promise<void | boolean>;
}
export declare class FormDirectiveHandler extends ExtendedDirectiveHandler {
    private middlewares_;
    constructor(key?: string);
    AddMiddleware(middleware: IFormMiddleware): void;
    RemoveMiddleware(key: string): void;
}
