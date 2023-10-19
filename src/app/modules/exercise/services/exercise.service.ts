import { Injectable, inject } from "@angular/core";
import { DocumentData, DocumentReference, Firestore, collection, collectionData, deleteDoc, doc, docData, setDoc, updateDoc } from "@angular/fire/firestore";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable, map } from "rxjs";

import { MessageService } from "src/app/shared/services/message.service";
import { DetailComponent } from "../components/detail/detail.component";
import { Exercise } from "src/app/shared/interfaces/exercise";

interface Category {
  _id: string
  name: string
  icon: string
}

@Injectable({
  providedIn: "root"
})
export class ExerciseService {
  private readonly firestore = inject(Firestore);
  private readonly collection = collection(this.firestore, "exercises");
  private readonly dialog = inject(MatDialog);
  private readonly message = inject(MessageService);

  readonly categories : Category[] = [
    { _id: "TRAINING", name: "Entrenamiento", icon: "fitness_center" },
    { _id: "WARM_UP", name: "Calentamiento", icon: "directions_run" }
  ];

  readonly $list = collectionData(this.collection, { idField: "_id" }).pipe(
    map(exercises => exercises as Exercise[])
  );

  getIcon(categoryName?: string) : string{
    const category = this.categories.find(category => category._id === categoryName);
    return category ? category.icon : "category";
  }

  ref(exercise: Exercise) : DocumentReference<DocumentData> {
    return doc(this.collection, exercise._id);
  }


  detail(_id: string) : Observable<Exercise | undefined>{
    return docData(doc(this.collection, _id), { idField: "_id" }).pipe(
      map(exercise => exercise as Exercise | undefined)
    );
  }


  openExercise(mode: 1 | 2 | 3 = 3, exercise?: Exercise) : MatDialogRef<DetailComponent> {
    return this.dialog.open(DetailComponent, {
      disableClose: true,
      data: { mode, exercise }
    });
  }

  async upload(fields: Exercise) : Promise<void> {
    try {
      const { _id, ...exercise } = fields;

      if(!_id){
        await setDoc(doc(this.collection), { ...exercise });
        this.message.success("Ejercicio creado correctamente");
      } else{
        await updateDoc(doc(this.collection, _id), { ...exercise });
        this.message.success("Ejercicio actualizado correctamente");
      }

    } catch (error) {
      if(error instanceof Error){ this.message.error(error); }
      throw error;
    }
  }

  async delete(_id: string) : Promise<void> {
    try {
      await deleteDoc(doc(this.collection, _id));
      this.message.success("Ejercicio borrado correctamente");
    } catch (error) {
      this.message.error(error as Error); throw error;
    }
  }
}
