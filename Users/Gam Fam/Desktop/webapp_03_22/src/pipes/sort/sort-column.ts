import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortingColumn'
})
export class SortingColumnsPipe implements PipeTransform {

  transform(array: Array<any>, path: string[], order: number): Array<string> {

    // Check if is not null
    if (!array || !path || !order) return array;

    return array.sort((a: any, b: any) => {
      // We go for each property followed by path
      path.forEach(property => {
        a = a[property]?a[property]:0;
        b = b[property]?b[property]:0;
      })

      // Order * (-1): We change our order
      return a > b ? order : order * (- 1);
    })
  }

}

/*
    <tr *ngFor="let obj of objects | orderby : ObjFieldName: OrderByType">
    
    ObjFieldName: object field name you want to sort;
    OrderByType: boolean; true: descending order; false: ascending;
*/