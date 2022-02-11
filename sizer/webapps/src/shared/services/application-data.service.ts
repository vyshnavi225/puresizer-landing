import { Injectable, EventEmitter } from '@angular/core';

export interface IAppDataChagneEvent {
    key: string;
    value: any;
}

export const APP_DATA_KEYS = {
  AUTH_DATA: 'auth_data',
  USER_INFO: 'user_info',
  SELECTED_WORKLOAD_DATA: 'selected_workload_data',
  HAS_UNAUTHORIZED_ERROR: 'has_unauthorized_error',
  BASE_HREF: 'landing-app'
};

@Injectable()
export class ApplicationDataService {

  private storage = window.localStorage;
  private inMemoryData = {};
  private appDataChangeEvent: EventEmitter<IAppDataChagneEvent> = new EventEmitter();
  private inMemoryDataChangeEvent: EventEmitter<IAppDataChagneEvent> = new EventEmitter();

  constructor() { }

  getAppData(dataName: string) {
    return this.inMemoryData[dataName];
  }

  setAppData(dataName: string, dataValue: any) {
    this.inMemoryData[dataName] = dataValue;
    this.appDataChangeEvent.emit({
        key: dataName,
        value: dataValue
    });
  }

  deleteAppData(dataName: string = '*') {
    if (dataName === '*') {
      this.inMemoryData = {};
    } else {
      delete this.inMemoryData[dataName];
    }
  }

  setStorageData(property: string, val) {
    val = (typeof val === 'string') ? val : JSON.stringify(val);
    this.storage.setItem(property, val);
    this.inMemoryDataChangeEvent.emit({
      key: property,
      value: val
    });
  }

  getStorageData(property: string) {
    return this.storage.getItem(property);
  }

  deleteStorageData(property: string = '*') {
    if (property === '*') {
      this.storage.clear();
    } else {
      this.storage.removeItem(property);
    }
  }

  getAppDataChangeEvent() {
    return this.appDataChangeEvent;
  }

  getInMemoryDataChangeEvent() {
    return this.inMemoryDataChangeEvent;
  }

}
