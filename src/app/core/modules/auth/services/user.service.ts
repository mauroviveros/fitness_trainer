import { Injectable, inject } from "@angular/core";
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore, collection, doc, docData, docSnapshots, setDoc, updateDoc } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { User } from "@angular/fire/auth";
import { Observable, filter, firstValueFrom, map, switchMap, tap } from "rxjs";

import { AuthService } from "./auth.service";
import { MessageService } from "src/app/shared/services/message.service";

import { UserDoc } from "src/app/shared/interfaces/user";

@Injectable({
  providedIn: "root"
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly collection = collection(this.firestore, "users");
  private readonly auth = inject(AuthService);
  private readonly message = inject(MessageService);
  private readonly router = inject(Router);

  readonly genres = [
    { value: 2, text: "HOMBRE" },
    { value: 1, text: "MUJER" },
    { value: 0, text: "PREFIERO NO DECIRLO" },
  ];

  getGender(value: number) : string | undefined {
    return this.genres.find(gender => gender.value === value)?.text;
  }

  readonly $snapshot : Observable<DocumentSnapshot<DocumentData>> = this.auth.$user.pipe(
    switchMap(user => docSnapshots(doc(this.collection, user.uid)))
  );

  readonly $data : Observable<UserDoc> = this.$snapshot.pipe(
    filter(user => user.exists()),
    map(user => this.convertSnapshot(user) as UserDoc),
  );

  constructor(){
    this.$snapshot.pipe(
      tap(user => user.exists() ? null : this.router.navigate(["profile"])),
    ).subscribe();
  }

  private convertSnapshot(snapshot: DocumentSnapshot<DocumentData>){
    const document = snapshot.data();
    if(!document) return undefined;

    document["_id"] = snapshot.id;
    return this.convert(document);
  }

  convert(document: DocumentData){
    if(document["birthday"]) document["birthday"] = document["birthday"].toDate();
    return document as UserDoc;
  }

  ref(user: UserDoc) : DocumentReference<DocumentData> {
    return doc(this.collection, user._id);
  }

  doc(reference: DocumentReference) : Observable<UserDoc> {
    return docData(reference, { idField: "_id" }).pipe(
      map(document => this.convert(document) as UserDoc)
    );
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
