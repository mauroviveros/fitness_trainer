import { Injectable, inject } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, User, user } from "@angular/fire/auth";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { filter, map } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);


  user = user(this.auth).pipe(
    filter(user => user !== null),
    map(user => user as User)
  );

  private catchError(error: Error){
    if(!error) error = new Error("ERROR: catchError");

    if(error.message.includes("(auth/email-already-in-use)")) error.message = "Ya existe ese email";
    if(error.message.includes("(auth/invalid-email)")) error.message = "Ingresa un email valido";
    if(error.message.includes("(auth/weak-password)")) error.message = "La contraseña es muy debil";
    if(error.message.includes("(auth/user-not-found)") || error.message.includes("(auth/wrong-password)")){
      error.message = "Usuario o contraseña incorrecta";
    }

    this.snackBar.open(`❌ ${error.message}`, "cerrar", { duration: 3000 });
    throw error;
  }

  async sendEmailVerification(user: User){
    try {
      await sendEmailVerification(user);
      this.snackBar.open("✅ Se ha enviado un correo para validar tu email");
    } catch (error) { this.catchError(error as Error); }
  }

  async register(email: string, password: string){
    try {
      await createUserWithEmailAndPassword(this.auth, email, password).catch(error => this.catchError(error));
      this.snackBar.open("✅ Cuenta creada correctamente");
      this.router.navigate([""]);
    } catch (error) { this.catchError(error as Error); }
  }

  async login(email: string, password: string){
    try {
      await signInWithEmailAndPassword(this.auth, email, password).catch(error => this.catchError(error));
      this.router.navigate([""]);
    } catch (error) { this.catchError(error as Error); }
  }

  async logout(){
    try {
      await signOut(this.auth);
      this.router.navigate(["login"]);
    } catch (error) { this.catchError(error as Error); }
  }
}
