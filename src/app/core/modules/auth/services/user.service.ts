import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "@angular/fire/auth";
import { Firestore, collection, doc, docSnapshots, setDoc, updateDoc } from "@angular/fire/firestore";
import { catchError, firstValueFrom, map, of, switchMap } from "rxjs";

import { DialogService } from "src/app/shared/services/dialog.service";
import { MessageService } from "src/app/shared/services/message.service";
import { AuthService } from "./auth.service";

import { UserDoc } from "src/app/shared/interfaces/user";

@Injectable({
  providedIn: "root"
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly collection = collection(this.firestore, "users");
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogService);
  private readonly message = inject(MessageService);

  readonly $data = this.auth.$user.pipe(
    switchMap(user => docSnapshots(doc(this.collection, user?.uid))),
    catchError(() => of(undefined)),
    map(user => {
      if(user === undefined) return undefined;
      const data = user.data();
      if(!data) return null;
      data["birthday"] = data["birthday"].toDate();
      return { ...data, _id: user?.id } as UserDoc;
    })
  );

  constructor(){
    this.$data.subscribe(data => {
      if(data === null){
        this.dialog.showWelcome();
        this.router.navigate(["profile"]);
      }
      console.debug(data); //TODO add UserTracking
    });
  }

  async upload(fields: UserDoc, isNew: boolean){
    const extra = { _admin: false };

    try {
      const { uid } = await firstValueFrom(this.auth.$user) as User;
      if(isNew){
        await setDoc(doc(this.collection, uid), { ...extra, ...fields });
        this.message.success("Perfil generado correctamente");
      } else{
        await updateDoc(doc(this.collection, uid), { ...fields });
        this.message.success("Perfil actualizado correctamente");
      }
    } catch (error) { this.message.error(error as Error); throw error; }
  }
}
