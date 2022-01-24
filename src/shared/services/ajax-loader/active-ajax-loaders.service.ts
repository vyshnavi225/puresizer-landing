/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


import { EventEmitter, Injectable } from '@angular/core';
import { ActiveXHRsListService } from '../http/active-xhrs-list.services';

export enum XHR_REQUEST_STATE {
    PROGRESS = 'PROGRESS',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    CANCELED = 'CANCELED',
    NONE = 'NONE'
}

export interface IXHRStateChangeEventData {
    id: string;
    state: XHR_REQUEST_STATE;
    data: any;
}

interface XHRStatus {
    id: string;
    status: XHR_REQUEST_STATE;
}

@Injectable({
    providedIn: 'root'
})
export class ActiveAjaxLoadersService {

    private xhrStateChangeEvent: EventEmitter<any> = new EventEmitter();
    /*
    *   Request will be the 'key' of the dictionary
    *   Current Request state will be the 'value' of the dictinoary
    */
    private activeAjaxLoaders: object = {};

    constructor(private activeXHRsService: ActiveXHRsListService) {
        this.activeXHRsService.events.cancelAll.subscribe(() => {
            const eventData = { error: 'Request is Canceled' };
            Object.keys(this.activeAjaxLoaders).forEach(xhrLoaderId => {
                this.emitXHRStateChangeEvent(xhrLoaderId, XHR_REQUEST_STATE.CANCELED, eventData);
                this.deleteLoader(xhrLoaderId);
            });
        });
    }

    public getXHRStateChangeEvent(): EventEmitter<any> {
        return this.xhrStateChangeEvent;
    }

    // add or updates the loader with the current request state
    public updateLoaderState(loaderId: string, requestCurrentState: XHR_REQUEST_STATE, eventData = null): void {
        const requestPrevState = this.activeAjaxLoaders[loaderId];
        // if the loader is not there or laoder state is updated, then add/update the loader state
        // emit the change event, so that the listener will represent the change
        if (!requestPrevState || requestPrevState !== requestCurrentState) {
            this.activeAjaxLoaders[loaderId] = requestCurrentState;
            // emit state change event
            this.emitXHRStateChangeEvent(loaderId, requestCurrentState, eventData);
            // deleting the loader from the list, if the XHR request is completed ( either success or error )
            if (requestPrevState === XHR_REQUEST_STATE.ERROR || requestPrevState === XHR_REQUEST_STATE.SUCCESS) {
                this.deleteLoader(loaderId);
            }
        }
    }

    private deleteLoader(xhrLoaderId: string): void {
        delete this.activeAjaxLoaders[xhrLoaderId];
    }

    private emitXHRStateChangeEvent(xhrLoaderId: string, xhrState: XHR_REQUEST_STATE, eventData: any): void {
        const eventObj: IXHRStateChangeEventData = {
            id: xhrLoaderId,
            state: xhrState,
            data: eventData
        };
        this.xhrStateChangeEvent.emit(eventObj);
    }

}
