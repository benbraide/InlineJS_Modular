import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler } from "./collection";

export class FavoritesGlobalHandler extends CollectionGlobalHandler<IProduct>{
    public constructor(auth: IAuthGlobalHandler, $idKey = 'sku', $pluralIdKey = 'skus'){
        super('favorites', auth, {
            idKey: $idKey,
            idKeyPlural: $pluralIdKey,
            entryName: 'product',
            entryNamePlural: 'products',
        });
    }
}
