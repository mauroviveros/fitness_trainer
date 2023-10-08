import { Injectable, inject } from "@angular/core";
import { DocumentData, Firestore, collection, collectionData, doc, docData, orderBy, query, setDoc } from "@angular/fire/firestore";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable, map } from "rxjs";

import { UserService } from "src/app/core/modules/auth/services/user.service";
import { MessageService } from "src/app/shared/services/message.service";
import { DetailDialogComponent } from "../components/detail-dialog/detail-dialog.component";

import { Routine } from "src/app/shared/interfaces/routine";
import { UserDoc } from "src/app/shared/interfaces/user";

@Injectable({
  providedIn: "root"
})
export class RoutineService {
  private readonly firestore = inject(Firestore);
  private readonly collection = collection(this.firestore, "routines");
  private readonly dialog = inject(MatDialog);
  private readonly user = inject(UserService);
  private readonly message = inject(MessageService);

  private userData?: UserDoc;

  readonly levels = ["Baja", "Media", "Intensa", "Muy intensa"];
  readonly $list : Observable<Routine[]> = collectionData(query(this.collection, orderBy("dateIN", "desc")), { idField: "_id" }).pipe(
    map(routines => routines.map(routine => this.convert(routine) as Routine))
  );

  constructor(){
    this.user.$data.subscribe(user => { this.userData = user; });
  }

  private convert(document: DocumentData) : Routine{
    if(document["dateIN"]) document["dateIN"] = document["dateIN"].toDate();
    if(document["dateOUT"]) document["dateOUT"] = document["dateOUT"].toDate();
    return document as Routine;
  }

  detail(_id: string){
    return docData(doc(this.collection, _id), { idField: "_id" }).pipe(
      map(routine => this.convert(routine) as Routine)
    );
  }

  openRoutine(mode: 1 | 2 | 3 = 3, routine?: Routine, customer?: UserDoc) : MatDialogRef<DetailDialogComponent> {
    const data = { mode, routine: routine || {} as Routine };

    if(!routine){
      if(this.userData) data.routine.admin = this.user.ref(this.userData);
      if(customer) data.routine.customer = this.user.ref(customer);
    }

    return this.dialog.open(DetailDialogComponent, { disableClose: true, data });
  }


  async upload(fields: Routine) : Promise<void> {
    try {
      const { admin, customer, ...routine } = fields;

      // const adminRef = this.user.ref(admin);
      // const customerRef = this.user.ref(customer);

      await setDoc(doc(this.collection), { admin, customer, ...routine });
      this.message.success("Rutina creada correctamente");
    } catch (error) {
      if(error instanceof Error){ this.message.error(error); }
      throw error;
    }
  }
}
