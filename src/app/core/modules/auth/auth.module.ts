import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";

import { LayoutComponent } from "./components/layout/layout.component";
import { PasswordFormFieldComponent } from "./components/password-form-field/password-form-field.component";

import { RegisterComponent } from "./pages/register/register.component";
import { LoginComponent } from "./pages/login/login.component";


@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    LayoutComponent,
    PasswordFormFieldComponent
  ],
  imports: [
    SharedModule
  ]
})
export class AuthModule { }
