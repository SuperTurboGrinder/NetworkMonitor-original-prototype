import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { NtwkNode } from "./ntwkNode.model";
import { SoundService } from "../model/sound.service";
import { PersistentViewDataService } from "../model/persistentViewData.service";

class Ping {
    constructor(
    public num:number,
    public min:number,
    public avg:number,
    public max:number
    ) {}
}

export class PingData {
    public id:number;
    public num:number;
    public min:number;
    public avg:number;
    public max:number;
    public old:boolean;
    public init:boolean;

    constructor(id:number, ping:Ping = null) {
        this.id = id;
        if(ping == null) {
            this.num = this.min = this.avg = this.max = 0;
            this.old = false;
            this.init = false;
        }
        else {
            this.copyFromPing(ping);
        }
    }

    setOld() {
        this.old = true;
    }

    copyFromPing(ping:Ping) {
        this.num = ping.num;
        this.min = ping.min;
        this.avg = ping.avg;
        this.max = ping.max;
        this.old = false;
        this.init = true;
    }
}

@Injectable()
export class PingCache {
    private cache:PingData[] = [];
    private updaterCounter:number = 1;
    private currentUpdater:number = 0;
    private repeatOnFailre:boolean = false;
    private updateCallback:()=>void = null;
    
    constructor(private http: HttpClient, 
            private soundService: SoundService,
            private pvd:PersistentViewDataService) {}

    setUpdateCallback(newCallback:()=>void) {
        this.updateCallback = newCallback;
    }
    
    getCacheIndexes(nodes:NtwkNode[]) : number[] {
        let result: number[] = [];
        for(let i=0; i<nodes.length; i++) {
            if(!nodes[i].isBlackBox && nodes[i].isOpenPing) {
                let current_id:number = nodes[i].id;
                let index:number = this.cache.findIndex(
                    (d, i, _) => d.id == current_id
                );
                if(index != -1) {
                    result.push(index);
                }
                else {
                    this.cache.push(new PingData(current_id));
                    result.push(this.cache.length - 1);
                }
            }
            else {
                result.push(-1);
            }
        }
        if(result.length != nodes.length) {
            return null;
        }
        return result;
    }

    getByIndex(index:number): PingData {
        return this.cache[index];
    }

    setRepeatOnFailure(value:boolean) {
        this.repeatOnFailre = value;
    }

    isRepeatingOnFailure():boolean {
        return this.repeatOnFailre;
    }

    updateByIndex(index:number) {
        if(this.currentUpdater == 0 && this.cache.length > 0) {
            this.cache[index].setOld();
            let updating = this.getPing(this.cache[index].id);
            updating.subscribe(
                (ping) => {
                    let ind = index;
                    this.cache[ind].copyFromPing(ping);
                    if(this.updateCallback != null) {
                        this.updateCallback();
                    }
                    if(ping.num == 0) {
                        this.soundService.playSound();
                        if(this.repeatOnFailre === true) {
                            this.updateByIndex(ind);
                        }
                    }
                },
                (err) => console.log(err)
            );
        }
    }

    isUpdatingRange():boolean {
        return this.currentUpdater != 0;
    }

    updateRange(selectionIndexes:number[]) {
        if(this.currentUpdater == 0) {
            this.currentUpdater = this.updaterCounter++;
            this.updateNext(selectionIndexes, 0, this.currentUpdater);
        }
    }

    stopUpdatingRange() {
        this.currentUpdater = 0;
    }

    private updateNext(range:number[], index:number, updaterID:number) {
        range = range.filter(n => n != -1);
        if(this.currentUpdater == updaterID) {
            if(index < range.length) {
                let updating = this.getPing(
                    this.cache[range[index]].id);
                this.cache[range[index]].setOld();
                updating.subscribe(ping => {
                    this.cache[range[index]].copyFromPing(ping);
                    if(this.updateCallback != null) {
                        this.updateCallback();
                    }
                    if(ping.num == 0) {
                        this.soundService.playSound();
                        if(this.repeatOnFailre == true) {
                            this.updateNext(range, index, updaterID);
                            return;
                        }
                    }
                    this.updateNext(range, ++index, updaterID);
                });
            }
            else if(this.currentUpdater == updaterID) {
                this.currentUpdater = 0;
            }
        }
    }

    private getPing(nodeID:number):Observable<Ping> {
        let url:string = 
            `${this.pvd.getBaseUrl()}/nodes/${nodeID}/ping`;
        return this.http.get<Ping>(url);
    }
}