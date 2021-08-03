import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler } from "./collection";

export class FavoritesGlobalHandler extends CollectionGlobalHandler<IProduct>{
    public constructor(auth: IAuthGlobalHandler){
        super('favorites', auth, {
            idKey: 'sku',
            idKeyPlural: 'skus',
            entryName: 'product',
            entryNamePlural: 'products',
        });
    }
}
