import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'searchPipe'
})
export class SearchPipe implements PipeTransform {
    constructor() {}
    public transform(value, key: string, term: string) {
        if (value && value.length != undefined && value.length > 0) {
            if (term) {
                term = term.trim().toLowerCase();
            }
            let data = value.filter((item) => {
                if (key == 'all') {
                    if (term) {
                        let itemFound = false;
                        for (var itemKey in item) {
                            let itemCheck;
                            if(itemKey != 'id' && itemKey != 'updated_at' && itemKey != 'total_price' && itemKey != 'quote_no' && itemKey != 'is_draft') {
                                if (itemKey == 'SalesMan' || itemKey == 'Identity') {                                    
                                    if (item[itemKey] && item[itemKey].User && item[itemKey].User.name) {
                                        itemCheck = item[itemKey].User.name.toLowerCase().includes(term);
                                    }
                                } else {
                                    item[itemKey] = item[itemKey].toString();
                                    itemCheck = item[itemKey].toLowerCase().includes(term);
                                }
                                if (itemCheck) {
                                    itemFound = true;
                                    break;
                                }
                            }                            
                        }
                        if (itemFound) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                } else if (key == 'SalesMan' || key == 'Identity') {
                    if (item.hasOwnProperty(key)) {
                        if (term) {
                            if (item[key] && item[key].User && item[key].User.name) {
                                return item[key].User.name.toLowerCase().includes(term);
                            }
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (item.hasOwnProperty(key)) {
                        if (term) {
                            item[key] = item[key].toString();
                            return item[key].toLowerCase().includes(term);
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
            });
            if (data && data.length > 0) {                           
                return data;
            }
        }
    }
}