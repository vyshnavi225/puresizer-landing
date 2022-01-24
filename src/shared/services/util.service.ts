/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

  constructor() { }

  public getDataInDropdownFormat(list: any[], options?: { labelProp: string, valueProp: string }): {
    label: any;
    value: any;
  }[] {
    if (list instanceof Array && list.length) {
      return options ? list.map(listItem => ({
        label: listItem[options.labelProp],
        value: listItem[options.valueProp]
      })) : list.map(listItem => ({
        label: listItem,
        value: listItem
      }));
    }
    return [];
  }

  public getElementByProp(srcList: any[], propName: string, propValue: string): any {
    if (srcList && srcList.length && propValue !== undefined) {
      return srcList.find((item) => {
        return item[propName] === propValue;
      });
    }

    return null;
  }

  public getClone(srcData: any): any {
    return srcData ? JSON.parse(JSON.stringify(srcData)) : srcData;
    // if (srcData instanceof Array) {
    //   return srcData ? JSON.parse(JSON.stringify(srcData)) : srcData;
    // } else {
    //   return Object.assign({}, srcData);
    // }
  }

  public getUniqueList(list: any[], prop?: string): any[] {
    const obj = {};
    if (prop) {
      list.forEach(item => { obj[item[prop]] = item; });
      return Object.keys(obj).map(key => obj[key]);
    } else {
      list.forEach(item => { obj[item] = item; });
      return Object.keys(obj);
    }
  }

  public containsText(str: string = '', searchStr: string = ''): boolean {
    return str.indexOf(searchStr) !== -1;
  }

  public startsWith(str: string, searchStr: string): boolean {
    return str.substr(0, searchStr.length) === searchStr;
  }

  public endsWith(str: string, searchStr: string): boolean {
    return str.substr(str.length - searchStr.length, str.length) === searchStr;
  }

  public trim(str: string): string {
    if (str && typeof str === 'string') {
      return str.replace(/(^\s+|\s+$)/g, '');
    }
    return str;
  }

  public listToMap(list: any[], keyProp: string, valueProp: string): any {
    return list.reduce((prevValue, listItem) => {
      return {
        ...prevValue,
        [listItem[keyProp]]: listItem[valueProp]
      };
    }, {});
  }

  mapToList(mapObject, propKeyName: string = 'key', valueKeyName: string = 'value'): {
    [x: string]: any;
  }[] {
    if (!mapObject) {
      return [];
    }
    return Object.keys(mapObject).map(paramName => ({
      [propKeyName]: paramName,
      [valueKeyName]: mapObject[paramName]
    }));
  }

  public reloadTheApp(): void {
    const { protocol, host } = window.location;
    const appUrl = `${protocol}//${host}`;
    window.location.href = appUrl;
  }

  public deepCopy(obj: any): any {
    if (typeof obj !== 'object' || !obj) {
      return obj;
    }
    if (Array.isArray(obj)) {
      const newObject = obj.map(i => this.deepCopy(i));
      return newObject;
    }
    const newObj = {};
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        newObj[i] = this.deepCopy(obj[i]);
      }
    }
    return newObj;
  }

}
