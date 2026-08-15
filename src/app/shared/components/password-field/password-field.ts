import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-field',
  imports: [FormsModule],
  templateUrl: './password-field.html',
  styleUrl: './password-field.scss',
})
export class PasswordField {
// ვიღებთ password-ს parent component-იდან
  @Input() password = '';

  // parent component-ს ვატყობინებთ password-ის ცვლილებას
  @Output() passwordChange = new EventEmitter<string>();

  // ველის ტიპის შეცვლა:
  // false -> password დამალულია
  // true -> password ჩანს
  public showPassword = false;


  // Password-ის strength
  public get passwordStrength(): number {

    let strength = 0;

    if (this.password.length >= 6) {
      strength++;
    }

    if (/[A-Z]/.test(this.password)) {
      strength++;
    }

    if (/[0-9]/.test(this.password)) {
      strength++;
    }

    if (/[^A-Za-z0-9]/.test(this.password)) {
      strength++;
    }

    return strength;
  }


  // Password-ის ტექსტიდან strength-ის სახელის მიღება
  public get strengthText(): string {

    switch (this.passwordStrength) {
      case 1:
        return 'Weak';

      case 2:
        return 'Fair';

      case 3:
        return 'Good';

      case 4:
        return 'Strong';

      default:
        return '';
    }
  }


  // Password input-ის ცვლილება
  onPasswordChange(value: string): void {
    this.password = value;

    this.passwordChange.emit(value);
  }


  // Password-ის ჩვენება / დამალვა
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
