import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler, CollectionItem } from "./collection";

export type OffsetHandlerType = (subTotal?: number, items?: Array<CollectionItem<IProduct>>, offsets?: Record<string, OffsetInfo>) => any;

interface OffsetInfo{
    value: number | OffsetHandlerType;
    isFixed: boolean | null;
    computed: any;
}

export class CartGlobalHandler extends CollectionGlobalHandler<IProduct>{
    private offsets_: Record<string, OffsetInfo> = {};
    
    private subTotal_ = 0;
    private total_ = 0;
    
    public constructor(auth: IAuthGlobalHandler, $idKey = 'sku', $pluralIdKey = 'skus'){
        super('cart', auth, {
            idKey: $idKey,
            idKeyPlural: $pluralIdKey,
            entryName: 'product',
            entryNamePlural: 'products',
            afterUpdate: (items) => this.AfterUpdate_(items),
            caches: {
                subTotal: () => this.subTotal_,
                total: () => this.total_,
            },
            props: {
                setOffset: (key: string, value: number | OffsetHandlerType, isFixed: boolean = true, init: any = 0) => this.SetOffset(key, value, isFixed, init),
                removeOffset: (key: string) => this.RemoveOffset(key),
            },
        });

        this.cached_['subTotal'] = 0;
        this.cached_['total'] = 0;
    }

    private ComputeSubTotal_(items: Array<CollectionItem<IProduct>>){
        return items.reduce((value, item) => ((item.entry.price * item.quantity) + value), 0);
    }

    private AfterUpdate_(items: Array<CollectionItem<IProduct>>){
        this.subTotal_ = this.ComputeSubTotal_(items);

        let added = 0, getValue = (value: number | OffsetHandlerType) => {
            return ((typeof value === 'function') ? value(this.subTotal_, items, this.offsets_) : value);
        };

        Object.values(this.offsets_).forEach((info) => {
            let value = getValue(info.value);
            if (info.isFixed !== null && typeof value === 'number'){
                info.computed = (info.isFixed ? value : (this.subTotal_ * value));
                added += info.computed;
            }
            else{//Exclusive value
                info.computed = value;
            }
        });

        this.total_ = (this.subTotal_ + added);
    }

    public SetOffset(key: string, value: number | OffsetHandlerType, isFixed: boolean | null = true, init: any = 0){
        if (key === 'subTotal' || key === 'total'){
            return;
        }
        
        this.offsets_[key] = {
            value: value,
            isFixed: isFixed,
            computed: init,
        };

        this.options_.caches[key] = () => this.offsets_[key].computed;
        this.cached_[key] = init;
    }

    public RemoveOffset(key: string){
        if (key in this.offsets_ && key !== 'subTotal' && key !== 'total'){
            delete this.offsets_[key];
            delete this.options_.caches[key];
        }
    }
}
