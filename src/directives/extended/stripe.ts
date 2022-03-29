import { IDirective, DirectiveHandlerReturn, IRegion, IResource } from '../../typedefs'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from '../extended/generic'

interface StripeField{
    name: string;
    mount: HTMLElement;
    element?: stripe.elements.Element;
    ready?: boolean;
    complete?: boolean;
    focused?: boolean;
    error?: string;
}

export interface StripeStyle{
    base?: stripe.elements.Style;
    complete?: stripe.elements.Style;
    empty?: stripe.elements.Style;
    invalid?: stripe.elements.Style;
    paymentRequestButton?: stripe.elements.PaymentRequestButtonStyleOptions;
}

export interface StripeClass{
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    invalid?: string;
    webkitAutofill?: string;
}

export interface StripeBillingDetails{
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class StripeDirectiveHandler extends ExtendedDirectiveHandler{
    private static specialFields_ = ['submit', 'save', 'name', 'email', 'phone', 'address'];
    private static fields_ = {
        'number': 'cardNumber',
        'expiry': 'cardExpiry',
        'cvc': 'cardCvc',
        'postal': 'postalCode',
        'zip': 'postalCode',
    };
    
    public constructor(resource: IResource, publicKey?: string, styles?: StripeStyle, classes?: StripeClass, url = 'https://js.stripe.com/v3/'){
        super('stripe', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'success', ['error', 'before', 'after', 'ready', 'focus', 'complete']);
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            if (StripeDirectiveHandler.specialFields_.includes(directive.arg.key) || (directive.arg.key in StripeDirectiveHandler.fields_)){//Bind field
                region.GetLocal(element, `\$${this.key_}`, true)?.addField(directive.arg.key, element);
                return DirectiveHandlerReturn.Handled;
            }

            let stripeInstance: stripe.Stripe = null, elements: stripe.elements.Elements = null, backlog = new Array<() => void>(), init = () => {
                stripeInstance = Stripe(region.GetEvaluator().Evaluate(region.GetId(), element, directive.value) || publicKey);
                if (!stripeInstance){
                    region.GetState().ReportError('Failed to initialize stripe', element);
                    return;
                }

                elements = stripeInstance.elements();
                if (!elements){
                    region.GetState().ReportError('Failed to initialize stripe', element);
                    return;
                }

                backlog.splice(0).forEach(callback => callback());
            };

            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), id = 0;
            let elementScope = region.AddElement(element, true), fields = new Array<StripeField>(), specialMounts = {
                submit: (null as HTMLElement),
                save: (null as HTMLElement),
                name: (null as HTMLElement),
                email: (null as HTMLElement),
                phone: (null as HTMLElement),
                address: (null as HTMLElement),
            };

            if (`\$${this.key_}` in elementScope.locals){
                return DirectiveHandlerReturn.Handled;
            }

            let options = ExtendedDirectiveHandler.GetOptions({
                autofocus: false,
                alert: false,
                nexttick: false,
                manual: false,
            }, directive.arg.options);

            let addField = (name: string, mount: HTMLElement, parent: HTMLElement, onChange: () => void) => {
                let myRegion = Region.Get(regionId), mountScope = myRegion.AddElement(mount, true);
                if (`\$${this.key_}` in mountScope.locals){
                    return;
                }
                
                if (name in specialMounts){
                    specialMounts[name] = mount;
                    mountScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                        if (prop === 'parent'){
                            let myRegion = Region.Get(regionId);
                            return (myRegion ? myRegion.GetLocal(parent, `\$${this.key_}`, true) : null);
                        }
                    }, ['parent']);

                    return;
                }
                
                if (!(name in StripeDirectiveHandler.fields_)){
                    return;
                }
                
                if (!myRegion){
                    return;
                }

                let mountId = ++id, field: StripeField = {
                    name: name,
                    mount: mount,
                    element: elements.create(StripeDirectiveHandler.fields_[name], {
                        style: styles,
                        classes: classes,
                    }),
                    ready: false,
                    complete: false,
                    error: null,
                };

                field.element.mount(mount);
                fields.push(field);

                mountScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                    if (prop === 'complete'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${mountId}.${prop}`);
                        return field.complete;
                    }

                    if (prop === 'focused'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${mountId}.${prop}`);
                        return field.focused;
                    }

                    if (prop === 'error'){
                        Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${mountId}.${prop}`);
                        return field.error;
                    }
                    
                    if (prop === 'parent'){
                        let myRegion = Region.Get(regionId);
                        return (myRegion ? myRegion.GetLocal(parent, `\$${this.key_}`, true) : null);
                    }

                    if (prop === 'clear'){
                        return () => {
                            if (field.element){
                                field.element.clear();
                            }
                        };
                    }

                    if (prop === 'focus'){
                        return () => {
                            if (field.element){
                                field.element.focus();
                            }
                        };
                    }

                    if (prop === 'blur'){
                        return () => {
                            if (field.element){
                                field.element.blur();
                            }
                        };
                    }

                    if (prop === 'addField'){//Forward to parent
                        return (name: string, mount: HTMLElement) => {
                            let myRegion = Region.Get(regionId);
                            return (myRegion ? myRegion.GetLocal(parent, `\$${this.key_}`, true)?.addField(name, mount) : null);
                        };
                    }
                }, ['complete', 'focused', 'error', 'parent', 'clear', 'focus', 'blur', 'addField']);

                mountScope.uninitCallbacks.push(() => {
                    field.element.destroy();
                    fields.splice(fields.indexOf(field), 1);
                });

                field.element.on('ready', () => {
                    if (!field.ready){
                        field.ready = true;
                        field.mount.dispatchEvent(new CustomEvent(`${this.key_}.ready`));
                        onReadyHandler();
                    }
                });

                field.element.on('change', (e) => {
                    if (e.complete === field.complete){
                        return;
                    }

                    field.complete = e.complete;
                    field.mount.dispatchEvent(new CustomEvent(`${this.key_}.complete`, {
                        detail: {
                            completed: e.complete,
                        },
                    }));
                    
                    if (field.complete){
                        if (field.error){
                            field.error = null;
                            Region.Get(regionId).GetChanges().AddComposed('error', `${scopeId}.${mountId}`);
                        }

                        let index = fields.indexOf(field);
                        if (index != -1 && index < (fields.length - 1)){//Focus next
                            let nextField = fields[index + 1];
                            if (nextField.element){
                                nextField.element.focus();
                            }
                            else if ('focus' in nextField.mount && typeof nextField.mount.focus === 'function'){
                                nextField.mount.focus();
                            }
                        }
                        else if (specialMounts.submit){
                            specialMounts.submit.focus();
                        }
                    }
                    else if (e.error && e.error.message !== field.error){
                        field.error = e.error.message;
                        Region.Get(regionId).GetChanges().AddComposed('error', `${scopeId}.${mountId}`);

                        field.mount.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                            detail: {
                                message: e.error.message,
                            },
                        }));
                    }

                    onChange();
                });

                field.element.on('focus', () => {
                    if (!field.focused){
                        field.focused = true;
                        Region.Get(regionId).GetChanges().AddComposed('focused', `${scopeId}.${mountId}`);
                        field.mount.dispatchEvent(new CustomEvent(`${this.key_}.focus`, {
                            detail: {
                                focused: true,
                            },
                        }));
                    }
                });

                field.element.on('blur', () => {
                    if (field.focused){
                        field.focused = false;
                        Region.Get(regionId).GetChanges().AddComposed('focused', `${scopeId}.${mountId}`);
                        field.mount.dispatchEvent(new CustomEvent(`${this.key_}.focus`, {
                            detail: {
                                focused: false,
                            },
                        }));
                    }
                });
            };

            let active = false, complete = false, errorCount = 0, setComplete = (value: boolean) => {
                if (value != complete){
                    complete = value;
                    Region.Get(regionId).GetChanges().AddComposed('complete', scopeId);
                }
            };

            let setActive = (value: boolean) => {
                if (value != active){
                    active = value;
                    Region.Get(regionId).GetChanges().AddComposed('active', scopeId);
                }
            };

            let onReadyHandler = () => {
                Region.Get(regionId).GetChanges().AddComposed('readyCount', scopeId);
            };

            let onChangeHandler = () => {
                setComplete(!fields.find(field => !field.complete));

                let currentErrorCount = fields.reduce((prev, field) => (prev + (field.error ? 1 : 0)), 0);
                if (currentErrorCount != errorCount){//Error list changed
                    errorCount = currentErrorCount;
                    Region.Get(regionId).GetChanges().AddComposed('errors', scopeId);
                }
            };

            let onSuccess = (response: stripe.PaymentIntentResponse) => {
                if (!response.error){
                    element.dispatchEvent(new CustomEvent(`${this.key_}.success`, {
                        detail: {
                            intent: response.paymentIntent,
                        },
                    }));
                    
                    element.dispatchEvent(new CustomEvent(`${this.key_}.after`));
                    setActive(false);

                    let myRegion = Region.Get(regionId);
                    if (options.nexttick && myRegion){
                        myRegion.AddNextTickCallback(() => ExtendedDirectiveHandler.BlockEvaluate(Region.Get(regionId), element, directive.value));
                    }
                    else{
                        ExtendedDirectiveHandler.BlockEvaluate(myRegion, element, directive.value);
                    }
                }
                else{//Error
                    onError(response.error.message);
                }
            };

            let onError = (err: string) => {
                element.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                    detail: {
                        type: 'host',
                        message: err,
                    },
                }));

                reportError('host', err);
                element.dispatchEvent(new CustomEvent(`${this.key_}.after`));
                setActive(false);
            };

            let reportError = (type: string, message: string) => {
                element.dispatchEvent(new CustomEvent(`${this.key_}.error`, {
                    detail: { type, message },
                }));

                if (options.alert){
                    Region.GetAlertHandler().Alert({
                        type: 'error',
                        title: 'Payment Error',
                        text: message,
                    });
                }
            };

            let getPaymentDetails = (paymentMethod: string | StripeBillingDetails, save: boolean): stripe.ConfirmCardPaymentData => {
                if (paymentMethod && typeof paymentMethod === 'string'){
                    return {
                        payment_method: paymentMethod,
                        setup_future_usage: (save ? 'off_session' : undefined),
                    };
                }

                let billingDetails: stripe.BillingDetails = {}, getBillingDetail = (key: string) => {
                    if (paymentMethod){
                        return (paymentMethod[key] || (specialMounts[key] ? specialMounts[key].value : undefined));
                    }
                    return (specialMounts[key] ? specialMounts[key].value : undefined);
                };

                ['name', 'email', 'phone', 'address'].forEach((key) => {
                    if (key === 'address'){
                        billingDetails.address = {
                            line1: getBillingDetail(key),
                        };
                    }
                    else{
                        billingDetails[key] = getBillingDetail(key);
                    }
                });

                if (!save && specialMounts.save && specialMounts.save instanceof HTMLInputElement){
                    save = specialMounts.save.checked;
                }
                
                return {
                    payment_method: {
                        card: fields.find(field => (field.name === 'number')).element,
                        billing_details: billingDetails,
                    },
                    setup_future_usage: (save ? 'off_session' : undefined),
                };
            };

            let payOrSetup = (callback: () => void, hasPaymentMethod = false) => {
                if (hasPaymentMethod || (complete && !fields.find(field => !!field.error))){
                    setActive(true);
                    element.dispatchEvent(new CustomEvent(`${this.key_}.before`));
                    callback();
                }
                else{//Error
                    reportError('incomplete', 'Please fill in all required fields.');
                }
            };
            
            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) => {
                if (prop === 'bind'){
                    return () => {
                        if (!stripeInstance){
                            bind();
                        }
                    };
                }
                
                if (prop === 'active'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return active;
                }

                if (prop === 'readyCount'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return fields.reduce((prev, field) => (prev + (field.ready ? 1 : 0)), 0);
                }

                if (prop === 'complete'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return complete;
                }

                if (prop === 'errors'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return fields.filter(field => !!field.error).map(field => field.error);
                }

                if (prop === 'instance'){
                    return stripeInstance;
                }
                
                if (prop === 'addField'){
                    return (name: string, mount: HTMLElement) => {
                        if (elements){
                            addField(name, mount, element, onChangeHandler);
                        }
                        else{//Add to backlog
                            backlog.push(() => addField(name, mount, element, onChangeHandler));
                        }
                    };
                }

                if (prop === 'pay'){
                    return (clientSecret: string, paymentMethod?: string | StripeBillingDetails, save = false) => {
                        payOrSetup(() => {
                            stripeInstance.confirmCardPayment(clientSecret, getPaymentDetails(paymentMethod, save)).then(onSuccess).catch(onError);
                        }, (paymentMethod && typeof paymentMethod === 'string'));
                    };
                }

                if (prop === 'setup'){
                    return (clientSecret: string, paymentMethod?: string | StripeBillingDetails, save = false) => {
                        payOrSetup(() => {
                            stripeInstance.confirmCardSetup(clientSecret, getPaymentDetails(paymentMethod, save)).then(onSuccess).catch(onError);
                        }, (paymentMethod && typeof paymentMethod === 'string'));
                    };
                }

                if (prop === 'publicKey'){
                    return publicKey;
                }

                if (prop === 'styles'){
                    return styles;
                }

                if (prop === 'classes'){
                    return classes;
                }

                if (prop === 'url'){
                    return url;
                }
            }, ['bind', 'active', 'readyCount', 'complete', 'errors', 'instance', 'addField', 'pay', 'setup', 'publicKey', 'styles', 'classes', 'url'], (prop, value) => {
                if (prop === 'publicKey'){
                    publicKey = value;
                }
                else if (prop === 'styles'){
                    styles = value;
                }
                else if (prop === 'classes'){
                    classes = value;
                }
                else if (prop === 'url'){
                    url = value;
                }

                return true;
            });
            
            let bind = () => {
                if (resource && url){
                    resource.GetScript(url, init);
                }
                else{//Resource not provided
                    init();
                }
            }

            if (!options.manual){
                bind();
            }
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}
