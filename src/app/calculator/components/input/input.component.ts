import { Component, Injector, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';

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
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() inputClass: string = '';
  @Input() containerClass: string = '';
  @Input() labelClass: string = '';
  // a numeric field is never allowed below what the server stores, which is zero
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  // a line under the field, shown while there is nothing to correct
  @Input() hint: string = '';
  // a list here turns the field into a dropdown of those values
  @Input() options: any[] = [];

  // the control this field is bound to, read once the form has bound it. it is
  // pulled out of the injector rather than injected, the field is its own value
  // accessor and asking for the control directly would close that circle
  control: any = null;

  constructor(private Injector: Injector) {}

  ngOnInit(): void {
    let directive = this.Injector.get(NgControl, null);
    this.control = directive ? directive.control : null;
    // a field carrying the required rule says so without being told twice
    this.required = this.required || this.isRequired();
  }

  isRequired(): boolean {
    return !!this.control?.hasValidator?.(Validators.required);
  }

  // a field only complains once it has been visited or typed in, nothing is red
  // while it is still being filled in for the first time
  get showError(): boolean {
    return !!this.control?.invalid && (this.control.touched || this.control.dirty);
  }

  // what is wrong with the value, in the words of the rule that refused it
  get errorMessage(): string {
    let errors = this.control?.errors;
    if (!errors) {
      return '';
    }
    if (errors.required) {
      return `${this.label || 'This field'} is required`;
    }
    if (errors.maxlength) {
      return `${this.label || 'This field'} is longer than ${errors.maxlength.requiredLength} characters`;
    }
    if (errors.min) {
      return `${this.label || 'This field'} cannot be less than ${errors.min.min}`;
    }
    if (errors.max) {
      return `${this.label || 'This field'} cannot be more than ${errors.max.max}`;
    }
    if (errors.pattern) {
      return `${this.label || 'This field'} is not in the expected format`;
    }
    return `${this.label || 'This field'} is not valid`;
  }

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
  // a value written by the form is not a value somebody typed, so it is put on
  // the field directly. going through the setter would report it back as a
  // change and leave every patched field marked as touched and complaining
  writeValue(value: any): void {
    if (value !== undefined) {
      this.dataPrivate = value;
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
