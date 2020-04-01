/**
 * LocalstorageService provider module
 * To perform local-storage related functionalities
 */

/*--------------------Angular related components---------------*/
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

    /*
     * Method to set an item in local-storage 
     * @param: key
     * @param: value
     * */
    set( key: any, value: any ) {
        localStorage.setItem( key, value )
    }

    /*
     * Method to get an item from local-storage 
     * @param: key
     * @param: defaultValue
     * */
    get( key: any, defaultValue?: any ) {
        return localStorage.getItem( key ) || defaultValue;
    }

    /*
     * Method to set an item(of type array) in local-storage 
     * @param: key
     * @param: value
     * */
    setArray( key: any, value: any ) {
        localStorage.setItem( key, JSON.stringify( value ) );
    }

    /*
     * Method to get an item(of type array) from local-storage 
     * @param: key
     * */
    getArray( key: any ) {
        if ( localStorage.getItem( key ) != undefined ) {
            return JSON.parse( localStorage.getItem( key ) );
        } else {
            return [];
        }
    }

    /*
     * Method to set an item(of type Object) in local-storage 
     * @param: key
     * @param: value
     * */
    setObj( key: any, value: any ) {
        localStorage.setItem( key, JSON.stringify( value ) );
    }

    /*
     * Method to get an item(of type Object) in local-storage 
     * @param: key
     * */
    getObj( key: any ) {
        if ( localStorage.getItem( key ) != undefined && localStorage.getItem( key ) != 'undefined') {
            return JSON.parse( localStorage.getItem( key ) );
        } else {
            return undefined;
        }
    }

    /*
     * Method to remove specific data from local storage 
     * @param: key
     * */
    removeObj( key: any ) {
        if ( localStorage.getItem( key ) != undefined ) {
            localStorage.removeItem( key );
        }
    }

    /*
     * Method to remove all data from local storage 
     * */
    clearAllLocalStorage() {
        localStorage.clear();
    }

}