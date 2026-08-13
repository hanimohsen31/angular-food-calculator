import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-input',
  templateUrl: './input.component.html',
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
  // a list here turns the field into a dropdown of those values
  @Input() options: any[] = [];

  // a value saved before this list existed is not dropped from the dropdown,
  // it is offered beside the options so editing does not silently blank it
  get selectOptions(): any[] {
    let value = this.dataPrivate;
    if (value === null || value === undefined || value === '') {
      return this.options;
    }
    return this.options.includes(value) ? this.options : [value, ...this.options];
  }

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

  // a disabled control is still read, it just cannot be typed in
  disabled: boolean = false;

  // This function is called by the forms API when the control status changes to or from 'DISABLED'.
  // Depending on the status, it enables or disables the appropriate DOM element.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
