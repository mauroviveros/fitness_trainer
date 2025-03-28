import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/auth.service';
import { AuthWrapperComponent } from '@auth/auth.component';
import { ErrorPipe } from '@pipes/error.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { confirmPaswordValidator } from '@shared/validators/confirmPassword.validator';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule
];

@Component({
  selector: 'auth-register',
  imports: [MATERIAL_MODULES, ReactiveFormsModule, RouterLink, AuthWrapperComponent, ErrorPipe],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly isLoading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required, Validators.maxLength(320)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)]
    }),
    confirm: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, confirmPaswordValidator('password')]
    })
  });

  ngOnInit() {
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.confirm.updateValueAndValidity();
    });
  }

  submit() {
    const { email, password } = this.form.value;
    if (this.form.invalid) return;
    if (!email || !password) return;

    this.isLoading.set(true);
    this.auth.signUp(email, password).finally(() => {
      this.isLoading.set(false);
    });
  }
}
