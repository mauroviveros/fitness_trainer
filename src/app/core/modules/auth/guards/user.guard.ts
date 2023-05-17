import { Injectable, inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { Observable, catchError, map, of } from "rxjs";
import { UserService } from "../services/user.service";

@Injectable({
  providedIn: "root"
})
export class UserGuard {
  private user = inject(UserService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.user.data.pipe(
      map(() => true),
      catchError(() => { return of(this.router.createUrlTree(["profile"])); })
    );
  }
  
}
