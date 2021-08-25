import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler, CollectionItem } from "./collection";
export declare type OffsetHandlerType = (subTotal?: number, items?: Array<CollectionItem<IProduct>>, offsets?: Record<string, OffsetInfo>) => any;
interface OffsetInfo {
    value: number | OffsetHandlerType;
    isFixed: boolean | null;
    computed: any;
}
export declare class CartGlobalHandler extends CollectionGlobalHandler<IProduct> {
    private offsets_;
    private subTotal_;
    private total_;
    constructor(auth: IAuthGlobalHandler);
    private ComputeSubTotal_;
    private AfterUpdate_;
    SetOffset(key: string, value: number | OffsetHandlerType, isFixed?: boolean | null, init?: any): void;
    RemoveOffset(key: string): void;
}
export {};
