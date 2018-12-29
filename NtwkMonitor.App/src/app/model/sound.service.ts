import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { PersistentViewDataService } from "./persistentViewData.service"

@Injectable()
export class SoundService {
    private enabled:boolean = false;
    constructor(private httpClient:HttpClient, private pvd:PersistentViewDataService) {}

    isEnabled():boolean {
        return this.enabled;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    public playSound() {
        if(!this.enabled) return;
        let url:string = 
            `${this.pvd.getBaseUrl()}/beep`;
        this.httpClient.get(url).subscribe(()=>{}, err => console.log(err));
    }
}