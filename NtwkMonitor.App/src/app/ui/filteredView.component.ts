import { Component, OnInit } from "@angular/core"
import { AsyncPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router"
import { Observable } from "rxjs/Observable";

import { NodesRepository } from "../model/ntwkNodes.repository";
import { NtwkNode, ParentData } from "../model/ntwkNode.model";
import { PingCache, PingData } from "../model/pingCache.model";
import { AppsService } from "../model/apps.service";
import { SoundService } from "../model/sound.service";
import { PersistentViewDataService, Sorting } from "../model/persistentViewData.service";

import { MenuComponent } from "./menu.component";

@Component({
    selector: "filteredView",
    moduleId: module.id,
    templateUrl: "filteredView.component.html"
})
export class FilteredViewComponent implements OnInit {
    private selectedType = "All";
    private nameFilter = "";
    private types:string[] = ["All"];
    private currentNodes:NtwkNode[] = [];
    private currentPingIndexes:number[] = [];
    private nameFilterValuesForCurrentNodes:boolean[] = [];
    private sortedNodeIndexes:number[] = [];
    private currentSorting:Sorting = Sorting.ByNameD;

    constructor(
        private repository: NodesRepository,
        private pingCache: PingCache,
        private appsService: AppsService,
        private soundService: SoundService,
        private pvd: PersistentViewDataService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.selectedType = this.pvd.type;
        this.currentSorting = this.pvd.sorting;
        this.nameFilter = this.pvd.filter;
        this.repository.getTypes().subscribe(types => types.forEach(t=>this.types.push(t)));
        this.pingCache.setUpdateCallback(()=>this.sortIndexes());
        this.updateNodesData();
    }

    numberOfChildren(index:number): Observable<number> {
        let id = this.currentNodes[index].id;
        return this.repository.numberOfChildren(id);
        //return this.currentNodes.some(n => n.parent != null && n.parent.id == id);
    }

    getTypes():string[] {
        return this.types;
    }

    getNameFilter():string {
        return this.nameFilter;
    }

    setNameFilter(filter:string) {
        this.nameFilter = filter.toLowerCase();
        this.pvd.filter = this.nameFilter;
        this.updateNodesData();
    }

    get sortedIndexes():number[] {
        return this.sortedNodeIndexes;
    }

    node(nodeIndex:number): NtwkNode {
        return this.currentNodes[nodeIndex];
    }

    ping(nodeIndex:number): PingData {
        return this.pingCache.getByIndex(this.currentPingIndexes[nodeIndex]);
    }

    setRepeatPingOnFailure(value:boolean) {
        this.pingCache.setRepeatOnFailure(value);
    }

    isRepeatingPingOnFailure():boolean {
        return this.pingCache.isRepeatingOnFailure();
    }

    updatePing(nodeIndex:number) {
        this.pingCache.updateByIndex(this.currentPingIndexes[nodeIndex]);
    }

    isRunningUpadateForFilter():boolean {
        return this.pingCache.isUpdatingRange();
    }

    updatePingForFilter() {
        let sortedPingIndexes:number[]=this.sortedIndexes.map(i=>this.currentPingIndexes[i]);
        this.pingCache.updateRange(sortedPingIndexes);
    }

    stopUpdateForFilter() {
        this.pingCache.stopUpdatingRange();
    }

    changeType(newType: string) {
        this.selectedType = newType;
        this.pvd.type = this.selectedType;
        this.updateNodesData();
    }

    updateNodesData() {
        this.repository.getCurrentTypeCache(this.selectedType).subscribe(data => {
            this.currentPingIndexes = [];
            this.currentNodes = data.nodes.filter((n,i) => {
                if(n.name.toLowerCase().indexOf(this.nameFilter) >= 0) {
                    this.currentPingIndexes.push(data.pingIndexes[i])
                    return true;
                }
                return false;
            });
            this.sortIndexes();
        });
    }

    private setSortBy(Ascending:Sorting, Descending:Sorting) {
        if(this.currentSorting == Descending) {
            this.currentSorting = Ascending;
        }
        else {
            this.currentSorting = Descending;
        }
        this.pvd.sorting = this.currentSorting;
        this.sortIndexes();
    }

    setSortByName() {
        this.setSortBy(Sorting.ByNameA, Sorting.ByNameD);
    }

    setSortByIP() {
        this.setSortBy(Sorting.ByIPA, Sorting.ByIPD);
    }

    setSortByMinPing() {
        this.setSortBy(Sorting.ByMinPingA, Sorting.ByMinPingD);
    }

    setSortByAvgPing() {
        this.setSortBy(Sorting.ByAvgPingA, Sorting.ByAvgPingD);
    }

    setSortByMaxPing() {
        this.setSortBy(Sorting.ByMaxPingA, Sorting.ByMaxPingD);
    }

    private isSortedBy(Ascending:Sorting, Descending:Sorting):number {
        if(this.currentSorting == Ascending) {
            return 1;
        }
        if(this.currentSorting == Descending) {
            return 2
        }
        return 0;
    }

    isSortedByName():number {
        return this.isSortedBy(Sorting.ByNameA, Sorting.ByNameD);
    }

    isSortedByIP():number {
        return this.isSortedBy(Sorting.ByIPA, Sorting.ByIPD);
    }

    isSortedByMinPing():number {
        return this.isSortedBy(Sorting.ByMinPingA, Sorting.ByMinPingD);
    }

    isSortedByAvgPing():number {
        return this.isSortedBy(Sorting.ByAvgPingA, Sorting.ByAvgPingD);
    }

    isSortedByMaxPing():number {
        return this.isSortedBy(Sorting.ByMaxPingA, Sorting.ByMaxPingD);
    }

    private compareNamesDescending(nodeIndex1:number, nodeIndex2:number):number {
        return this.currentNodes[nodeIndex1].name.localeCompare(
            this.currentNodes[nodeIndex2].name);
    }

    private compareDisabledPing(nodeIndex1:number, nodeIndex2:number):
        { result:number, isDisabled:boolean }
    {
        let node1 = this.currentNodes[nodeIndex1];
        let node2 = this.currentNodes[nodeIndex2];
        let result = 0;
        let isDisabled = false;
        if(node1.isBlackBox ||
            node2.isBlackBox ||
            !node1.isOpenPing ||
            !node2.isOpenPing
        ) {
            isDisabled = true;
            if(node1.isBlackBox && node2.isBlackBox) {
                result = 0;
            }
            else if(!node1.isOpenPing && !node2.isOpenPing) {
                if(node1.isBlackBox) {
                    result = 1;
                }
                else if(node2.isBlackBox) {
                    result = -1;
                }
                else {
                    result = 0;
                }
            }
            else {
                if(node1.isBlackBox && !node2.isBlackBox) {
                    result = 1;
                }
                else if(!node1.isBlackBox && node2.isBlackBox) {
                    result = -1;
                }
                else if(!node1.isOpenPing && node2.isOpenPing) {
                    result = 1;
                }
                else { //if(node1.isOpenPing && !node2.isOpenPing) {
                    result = -1;
                }
            }
        }
        if(!isDisabled) {
            let pingData1 = this.pingCache.getByIndex(this.currentPingIndexes[nodeIndex1]);
            let pingData2 = this.pingCache.getByIndex(this.currentPingIndexes[nodeIndex2]);
            if(!pingData1.init || !pingData2.init) {
                isDisabled = true;
                if(!pingData1.init && !pingData2.init) {
                    result = 0;
                }
                else if(!pingData1.init && pingData2.init) {
                    result = 1;
                }
                else if(pingData1.init && !pingData2.init) {
                    result = -1;
                }
            }

            let pd1n0 = pingData1.num == 0;
            let pd2n0 = pingData2.num == 0;
            if(!isDisabled && (pd1n0 || pd2n0)) {
                isDisabled = true;
                if(pd1n0 && pd2n0) {
                    result = 0;
                }
                else if(pd1n0 && !pd2n0) {
                    result = -1;
                }
                else if(!pd1n0 && pd2n0) {
                    result = 1;
                }
            }
        }
        return {result:result,isDisabled:isDisabled};
    }

    private compareByIPDisabled(nodeIndex1:number, nodeIndex2:number):{result:number, isDisabled:boolean} {
        let node1 = this.currentNodes[nodeIndex1];
        let node2 = this.currentNodes[nodeIndex2];
        if(node1.isBlackBox && node2.isBlackBox) {
            return {result:0, isDisabled:true};
        }
        else if(node1.isBlackBox) {
            return {result:1, isDisabled:true};
        }
        else if(node2.isBlackBox) {
            return {result:-1, isDisabled:true};
        }
        return {result:0, isDisabled:false};
    }

    //https://gist.github.com/9point6/6988755
    private compareByIPDescending(nodeIndex1:number, nodeIndex2:number):number {
        let node1 = this.currentNodes[nodeIndex1];
        let node2 = this.currentNodes[nodeIndex2];
        let ip1Parts = node1.ipStr.split( '.' ).map(s => parseInt(s));
        let ip2Parts = node2.ipStr.split( '.' ).map(s => parseInt(s));
		for( let i = 0; i < ip1Parts.length; i++ )
		{
			if( ip1Parts[i] < ip2Parts[i])
				return -1;
			else if( ip1Parts[i] > ip2Parts[i] )
				return 1;
		}
		return 0;
    }

    private compareByPingDescending(nodeIndex1:number, nodeIndex2:number,
        pingSelector:(n:PingData)=>number
    ):number {
        let pingData1 = this.pingCache.getByIndex(this.currentPingIndexes[nodeIndex1]);
        let pingData2 = this.pingCache.getByIndex(this.currentPingIndexes[nodeIndex2]);
        let ping1 = pingSelector(pingData1);
        let ping2 = pingSelector(pingData2);
        if( ping1 < ping2)
            return -1;
        if( ping1 > ping2 )
            return 1;
        return 0;
    }

    private sortIndexes() {
        this.sortedNodeIndexes = Array.apply(null, 
            {length:this.currentNodes.length}).map(Number.call, Number);
        this.sortedIndexes.sort((a, b) => {
            switch(this.currentSorting) {
                case Sorting.ByNameA:
                    return 0- this.compareNamesDescending(a,b);
                case Sorting.ByNameD:
                    return this.compareNamesDescending(a,b);
                case Sorting.ByIPA:
                case Sorting.ByIPD: {
                    let sortDisabled = this.compareByIPDisabled(a,b);
                    if(sortDisabled.isDisabled == true) {
                        return sortDisabled.result;
                    }
                    else {
                        if(this.currentSorting==Sorting.ByIPA)
                            return 0- this.compareByIPDescending(a, b);
                        else
                            return this.compareByIPDescending(a, b);
                    }
                }
                default: {
                    //sorting by ping
                    let disabledSort = this.compareDisabledPing(a, b);
                    if(disabledSort.isDisabled) {
                        return disabledSort.result;
                    }
                    switch(this.currentSorting) {
                        case Sorting.ByMinPingA:
                            return 0- this.compareByPingDescending(a, b, n=>n.min);
                        case Sorting.ByMinPingD:
                            return this.compareByPingDescending(a, b, n=>n.min);
                        case Sorting.ByAvgPingA:
                            return 0- this.compareByPingDescending(a, b, n=>n.avg);
                        case Sorting.ByAvgPingD:
                            return this.compareByPingDescending(a, b, n=>n.avg);
                        case Sorting.ByMaxPingA:
                            return 0- this.compareByPingDescending(a, b, n=>n.max);
                        case Sorting.ByMaxPingD:
                            return this.compareByPingDescending(a, b, n=>n.max);
                    }
                }
            }
        });
    }

    runTelnetApp(nodeID:number) {
        this.appsService.openTelnet(nodeID);
    }

    runSSHApp(nodeID:number) {
        this.appsService.openSSH(nodeID);
    }

    runWebApp(nodeID:number) {
        this.appsService.openWeb(nodeID);
    }

    isSoundEnabled():boolean {
        return this.soundService.isEnabled();
    }

    enableSound() {
        this.soundService.enable();
    }

    disableSound() {
        this.soundService.disable();
    }
}