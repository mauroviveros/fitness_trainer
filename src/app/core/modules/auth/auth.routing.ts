import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { LayoutComponent } from "./components/layout/layout.component";

import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/register/register.component";
import { AuthGuard, redirectLoggedInTo } from "@angular/fire/auth-guard";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo([""]) },
    children: [
      {
        path: "login",
        title: "Fitness - Trainer | Identifícate",
        component: LoginComponent,
        data: {
          loading: false,
          title: "Iniciar sesión",
          footer: {
            label: "¿No tienes cuenta?",
            button: "Registrate aqui",
            link: "register"
          }
        }
      },
      {
        path: "register",
        title: "Fitness - Trainer | Crea tu cuenta",
        component: RegisterComponent,
        data: {
          title: "Registrarse",
          footer: {
            label: "¿Ya tienes cuenta?",
            button: "Ingresa aqui",
            link: "login"
          }
        }
      },
      // {
      //   path: "",
      //   pathMatch: "full",
      //   redirectTo: "login"
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
