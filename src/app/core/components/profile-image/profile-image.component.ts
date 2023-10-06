import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { Subscription } from "rxjs";

import { ProfileImageService } from "../../services/profile-image.service";

@Component({
  selector: "core-profile-image",
  templateUrl: "./profile-image.component.html",
  styleUrls: ["./profile-image.component.scss"]
})
export class ProfileImageComponent implements OnInit, OnDestroy {
  private readonly profileImage = inject(ProfileImageService);
  private readonly subscriptions: Subscription[] = [];
  isLoading = true;
  src? : string;

  ngOnInit(){
    this.subscriptions.push(this.profileImage.$upload.subscribe(bool => this.isLoading = bool));
    this.subscriptions.push(this.profileImage.$src.subscribe(src => this.src = src));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
