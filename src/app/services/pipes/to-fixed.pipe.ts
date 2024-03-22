import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed',
})
export class ToFixedPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value == 'number') {
      return value.toFixed(2);
    } else if (typeof +value == 'number') {
      return value.slice(0, 2);
    } else if (typeof value == 'string') {
      console.log("toFixed: ",value)
      let values = value.split(".")
      return values[0] + values[1].slice(0,2)
    } else {
      return value;
    }
  }
}
