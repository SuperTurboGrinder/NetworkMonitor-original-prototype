import { Injectable } from "@angular/core";

export enum Sorting {
    ByNameA,
    ByNameD,
    ByIPA,
    ByIPD,
    ByMinPingA,
    ByMinPingD,
    ByAvgPingA,
    ByAvgPingD,
    ByMaxPingA,
    ByMaxPingD
}

@Injectable()
export class PersistentViewDataService {
    type:string = "All";
    sorting:Sorting = Sorting.ByIPD;
    filter:string = "";
    currentTreeNodeID = null;
    private protocol:string = "http";
    private hostname:string = location.hostname;
    private port:number = 5000;


    setProtocolToHttp() {
        this.protocol = "http";
    }

    setProtocolToHttps() {
        this.protocol = "https";
    }

    setHostname(host:string) {
        this.hostname = host;
    }

    setPort(port:number) {
        this.port = port;
    }

    getBaseUrl():string {
        return `${this.protocol}://${this.hostname}:${this.port}`;
    }
}