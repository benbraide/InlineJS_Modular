import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler } from "./collection";
export declare class FavoritesGlobalHandler extends CollectionGlobalHandler<IProduct> {
    constructor(auth: IAuthGlobalHandler, $idKey?: string, $pluralIdKey?: string);
}
