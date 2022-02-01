import { Injectable, EventEmitter } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class ActiveXHRsListService {

    private counter: number = 0;
    private prefix: string = '__req_id__';
    private requestsDict: any = {};
    private data: {} = {};
    events = {
        cancelAll: new EventEmitter()
    };

    constructor() { window['_data'] = this.data; }

    add(subscription: any): any {
        const reqId = (this.prefix + (++this.counter));
        this.requestsDict[reqId] = subscription;
        subscription[this.prefix] = reqId;
        return subscription;
    }

    delete(subscription: any): void {
        const reqId = subscription[this.prefix];
        delete this.requestsDict[reqId];
    }

    cancelAll(): void {
        Object.keys(this.requestsDict).forEach(subscriptionId => {
            const subscription = this.requestsDict[subscriptionId];
            if (subscription) {
                subscription.unsubscribe();
                this.delete(subscription);
            }
        });
        this.events.cancelAll.emit();
    }

}
