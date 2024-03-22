import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() inputClass: string = '';
  @Input() containerClass: string = '';
  @Input() labelClass: string = '';

  // Internal data model
  private dataPrivate: any = '';

  private onChange: (ignored: any) => void = () => {};
  private onTouched: () => void = () => {};

  // get/set accessor (including a setter that emits changes)
  get data(): any {
    return this.dataPrivate;
  }

  set data(val: any) {
    this.dataPrivate = val;
    this.onChange(val);
    this.onTouched();
  }

  onBlur() {
    this.onTouched();
  }

  // Method that is called by the forms API to write to the view when programmatic changes from model to view are requested
  writeValue(value: any): void {
    if (value !== undefined) {
      this.data = value;
    }
  }

  // Registers a callback function that should be called when the control's value changes in the UI
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registers a callback function that should be called when the control receives a blur event
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // This function is called by the forms API when the control status changes to or from 'DISABLED'.
  // Depending on the status, it enables or disables the appropriate DOM element.
  setDisabledState?(isDisabled: boolean): void {
    // Implement this method if you need to disable your custom component
  }
}
