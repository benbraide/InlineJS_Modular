import { IAuthGlobalHandler, IProduct } from "../typedefs";
import { CollectionGlobalHandler, CollectionItem } from "./collection";

interface OffsetInfo{
    value: number | ((subTotal?: number) => number);
    isFixed: boolean;
    computed: number;
}

export class CartGlobalHandler extends CollectionGlobalHandler<IProduct>{
    private offsets_: Record<string, OffsetInfo> = {};
    
    private subTotal_ = 0;
    private total_ = 0;
    
    public constructor(auth: IAuthGlobalHandler){
        super('cart', auth, {
            idKey: 'sku',
            idKeyPlural: 'skus',
            entryName: 'product',
            entryNamePlural: 'products',
            afterUpdate: (items) => this.AfterUpdate_(items),
            caches: {
                subTotal: () => this.subTotal_,
                total: () => this.total_,
            },
            props: {
                setOffset: (key: string, value: number, isFixed: boolean) => this.SetOffset(key, value, isFixed),
                removeOffset: (key: string) => this.RemoveOffset(key),
            },
        });
    }

    private ComputeSubTotal_(items: Array<CollectionItem<IProduct>>){
        return items.reduce((value, item) => ((item.entry.price * item.quantity) + value), 0);
    }

    private AfterUpdate_(items: Array<CollectionItem<IProduct>>){
        this.subTotal_ = this.ComputeSubTotal_(items);

        let added = 0, getValue = (value: number | ((subTotal?: number) => number)) => {
            return ((typeof value === 'number') ? value : value(this.subTotal_));
        };

        Object.values(this.offsets_).forEach((info) => {
            info.computed = (this.subTotal_ + (info.isFixed ? getValue(info.value) : (this.subTotal_ * getValue(info.value))));
            added += info.computed;
        });

        this.total_ = (this.subTotal_ + added);
    }

    public SetOffset(key: string, value: number | ((subTotal?: number) => number), isFixed: boolean){
        if (key === 'subTotal' || key === 'total'){
            return;
        }
        
        this.offsets_[key] = {
            value: value,
            isFixed: isFixed,
            computed: 0,
        };

        this.options_.caches[key] = () => this.offsets_[key].computed;
    }

    public RemoveOffset(key: string){
        if (key in this.offsets_ && key !== 'subTotal' && key !== 'total'){
            delete this.offsets_[key];
            delete this.options_.caches[key];
        }
    }
}
