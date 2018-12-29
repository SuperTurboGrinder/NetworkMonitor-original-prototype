import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

@Injectable()
export class AppsService {
    constructor(private httpClient:HttpClient) {}

    public openTelnet(nodeID:number) {
        this.openApp(nodeID, "telnet");
    }

    public openSSH(nodeID:number) {
        this.openApp(nodeID, "ssh");
    }

    public openWeb(nodeID:number) {
        this.openApp(nodeID, "web");
    }

    private openApp(nodeID:number, appName:string) {
        const PROTOCOL = "http";
        const PORT = 5000;
        let url:string = 
            `${PROTOCOL}://${location.hostname}:${PORT}/nodes/${nodeID}/${appName}`;
        this.httpClient.get(url).subscribe(()=>{}, err => console.log(err));
    }
}