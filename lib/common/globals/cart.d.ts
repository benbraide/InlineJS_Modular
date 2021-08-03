import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler } from "./collection";
export declare class CartGlobalHandler extends CollectionGlobalHandler<IProduct> {
    private offsets_;
    private subTotal_;
    private total_;
    constructor(auth: IAuthGlobalHandler);
    private ComputeSubTotal_;
    private AfterUpdate_;
    SetOffset(key: string, value: number | ((subTotal?: number) => number), isFixed: boolean): void;
    RemoveOffset(key: string): void;
}
