import { IDatabase } from '../typedefs'

export class Database implements IDatabase{
    private handle_: IDBDatabase = null;
    private attempted_ = false;
    private attempting_ = false;
    private queued_ = new Array<() => void>();

    public constructor(private name_: string){}

    public Open(){
        if (this.handle_){
            return;
        }

        this.attempting_ = true;
        let openRequest = window.indexedDB.open(this.name_);

        openRequest.addEventListener('error', (e) => {
            this.attempted_ = true;
            this.attempting_ = false;
        });
        
        openRequest.addEventListener('success', () => {
            this.attempted_ = true;
            this.attempting_ = false;
            
            this.handle_ = openRequest.result;
            this.queued_.forEach((callback) => {
                try{
                    callback();
                }
                catch{}
            });

            this.queued_ = new Array<() => void>();
        });

        openRequest.addEventListener('upgradeneeded', () => {
            let db = openRequest.result, store = db.createObjectStore(this.name_);
            db.addEventListener('error', (e) => {
                this.attempted_ = true;
                this.attempting_ = false;
            });
        });
    }

    public Close(){
        if (this.handle_){
            this.handle_.close();
            this.handle_ = null;
            this.attempted_ = false;
        }
        else if (this.attempting_){
            this.queued_.push(() => this.Close());
        }
    }
    
    public Read(key: string, successHandler?: (data: any) => void, errorHandler?: () => void): Promise<any>{
        if (!this.handle_ || this.attempted_){
            return null;
        }
        
        let promise: Promise<any> = null;
        if (!successHandler){
            promise = new Promise<any>((resolve, reject) => {
                let transact = () => {
                    let transaction = this.handle_.transaction(this.name_, 'readonly');
                    let store = transaction.objectStore(this.name_);

                    let request = store.get(key);
                    request.addEventListener('success', () => {
                        resolve(request.result);
                    });

                    request.addEventListener('error', (e) => {
                        reject();
                    });
                };
                
                if (!this.handle_){
                    this.queued_.push(() => {
                        transact();
                    });
                }
                else{//Database initialized
                    transact();
                }
            });
        }
        else{//Bind with handlers
            let transact = () => {
                let transaction = this.handle_.transaction(this.name_, 'readonly');
                let store = transaction.objectStore(this.name_);

                let request = store.get(key);
                request.addEventListener('success', () => {
                    successHandler(request.result);
                });

                if (errorHandler){
                    request.addEventListener('error', (e) => {
                        errorHandler();
                    });
                }
            };

            if (!this.handle_){
                this.queued_.push(() => {
                    transact();
                });
            }
            else{//Database initialized
                transact();
            }
        }

        return promise;
    }

    public Write(key: string, data: any, successHandler?: () => void, errorHandler?: () => void): Promise<void>{
        if (!this.handle_ || this.attempted_){
            return null;
        }
        
        let promise: Promise<void> = null;
        if (!successHandler){
            promise = new Promise<void>((resolve, reject) => {
                let transact = () => {
                    let transaction = this.handle_.transaction(this.name_, 'readwrite');
                    let store = transaction.objectStore(this.name_);

                    let request = store.put(data, key);
                    request.addEventListener('success', () => {
                        resolve();
                    });

                    request.addEventListener('error', (e) => {
                        reject();
                    });
                };
                
                if (!this.handle_){
                    this.queued_.push(() => {
                        transact();
                    });
                }
                else{//Database initialized
                    transact();
                }
            });
        }
        else{//Bind with handlers
            let transact = () => {
                let transaction = this.handle_.transaction(this.name_, 'readwrite');
                let store = transaction.objectStore(this.name_);

                let request = store.put(data, key);
                request.addEventListener('success', () => {
                    successHandler();
                });

                if (errorHandler){
                    request.addEventListener('error', (e) => {
                        errorHandler();
                    });
                }
            };

            if (!this.handle_){
                this.queued_.push(() => {
                    transact();
                });
            }
            else{//Database initialized
                transact();
            }
        }

        return promise;
    }
}
