import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed',
})
export class ToFixedPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value == 'number') {
      return value.toFixed(2);
    } else if (typeof value == 'string' && value.length > 3) {
      return value.slice(0, 2);
    } else {
      return value;
    }
  }
}
