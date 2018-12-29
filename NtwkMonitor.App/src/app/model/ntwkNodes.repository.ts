import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { NtwkNode } from "./ntwkNode.model";
import { RestDataSource } from "./rest.datasource";
import { PingCache } from "./pingCache.model"

export class NodesWithPingIndexes {
    constructor(
        public nodes:NtwkNode[],
        public pingIndexes:number[]
    ) {}
}

class PrimaryCache{
    private created:Date = new Date();
    private data: Observable<NodesWithPingIndexes> = null;

    setData(newData:Observable<NodesWithPingIndexes>) {
        this.data = newData
        this.created = new Date();
    }

    getData():Observable<NodesWithPingIndexes> {
        return this.data;
    }

    secondsFromCreated():number {
        return (Date.now() - this.created.getTime())/1000;
    }
}

@Injectable()
export class NodesRepository {
    private nodesCache: PrimaryCache = new PrimaryCache();
    private types: Observable<string[]> = null;
    private allTypes: string = "All";

    private numChildrenRoot: Observable<number> = null;
    private numChildrenMap: {id:number, numChildren:Observable<number>}[] = [];

    private childrenCacheFilter:number;
    private childrenCache: Observable<NodesWithPingIndexes> = null;

    private typeCacheFilter:string;
    private typeCache: Observable<NodesWithPingIndexes> = null;


    constructor(private dataSource: RestDataSource, 
        private pingCache: PingCache
    ) {
        this.types = dataSource.getNodesTypes();
    }

    private getCurrentNodesCache():Observable<NodesWithPingIndexes> {
        if(this.nodesCache.getData() == null ||
            this.nodesCache.secondsFromCreated()/60 > 3
        ) {
            this.childrenCache = null;
            this.typeCache = null;
            this.numChildrenMap = [];
            this.nodesCache.setData(
                this.dataSource.getNodes().map(data => {
                    let inds = this.pingCache.getCacheIndexes(data);
                    return new NodesWithPingIndexes(data, inds);
            }));
        }
        return this.nodesCache.getData();
    }

    getCurrentChildrenCache(id:number) :Observable<NodesWithPingIndexes> {
        let currentNodesCache = this.getCurrentNodesCache();
        if(this.childrenCache == null ||
            this.childrenCacheFilter != id
        ) {
            this.childrenCacheFilter=id;
            this.childrenCache = currentNodesCache.map(data => {
                let filteredIndexes:number[] = [];
                let filteredNodes:NtwkNode[] = null;
                if(id == null) { //root
                    filteredNodes = data.nodes.filter((n, i) => {
                        if(n.parent === null) {
                            filteredIndexes.push(data.pingIndexes[i]);
                            return true;
                        }
                        return false;
                    });
                } else {
                    filteredNodes = data.nodes.filter((n, i) => {
                        if(n.parent != null && n.parent.id === id) {
                            filteredIndexes.push(data.pingIndexes[i]);
                            return true;
                        }
                        return false;
                    });
                }
                return new NodesWithPingIndexes(filteredNodes, filteredIndexes);
            });
        }
        return this.childrenCache;
    }

    getCurrentTypeCache(type:string) :Observable<NodesWithPingIndexes> {
        let currentNodesCache = this.getCurrentNodesCache();
        if(this.typeCache == null ||
            this.typeCacheFilter != type
        ) {
            if(type === this.allTypes) {
                this.typeCache = currentNodesCache;
            }
            else {
                this.typeCache = this.types.flatMap(_types => {
                    return currentNodesCache.map(data => {
                        for(let ti=0; ti<_types.length; ti++) {
                            if(type === _types[ti]) {
                                let filteredIndexes:number[] = [];
                                let filteredNodes:NtwkNode[] = null;
                                filteredNodes = data.nodes.filter((n, i) => {
                                    if(n.type === ti) {
                                        filteredIndexes.push(data.pingIndexes[i]);
                                        return true;
                                    }
                                    return false;
                                });
                                return new NodesWithPingIndexes(filteredNodes, filteredIndexes);
                            }
                        }
                        return null;
                    });
                });
            }
        }
        return this.typeCache;
    }

    findNode(id: number) : Observable<NtwkNode> {
        let currentNodesCache = this.getCurrentNodesCache();
        return currentNodesCache.map(data => 
            data.nodes.find(n => n.id == id)
        );
    }

    numberOfChildren(id:number) : Observable<number> {
        let currentNodesCache = this.getCurrentNodesCache();
        if(id == null) {
            if(this.numChildrenRoot == null) {
                this.numChildrenRoot = currentNodesCache.map(data => {
                    return data.nodes.reduce((acc, current) => {
                        if(current.parent == null)
                            return acc+1;
                        else
                            return acc;
                    }, 0)
                });
            }
            return this.numChildrenRoot;
        }
        else {
            let index = this.numChildrenMap.findIndex(hc => hc.id == id);
            if(index == -1) {
                this.numChildrenMap.push({id:id, numChildren:
                    currentNodesCache.map(data => {
                        return data.nodes.reduce((acc, current) =>  {
                            if(current.parent != null && current.parent.id == id)
                                return acc+1;
                            else
                                return acc;
                        }, 0);
                    })
                });
                index = this.numChildrenMap.length-1;
            }
            return this.numChildrenMap[index].numChildren;
        }
    }
    
    createNode(node:NtwkNode, parentID:number = 0):Observable<NtwkNode> {
        this.nodesCache =  new PrimaryCache();
        if(parentID == 0) {
            return this.dataSource.createNodeOnRoot(node);
        }
        else {
            return this.dataSource.createWithParent(node, parentID);
        }
    }

    updateNode(node:NtwkNode, parentID:number = 0):Observable<NtwkNode> {
        this.nodesCache =  new PrimaryCache();
        return this.dataSource.updateNode(node, parentID);
    }

    removeNode(nodeID:number):Observable<NtwkNode> {
        this.nodesCache =  new PrimaryCache();
        return this.dataSource.removeNode(nodeID);
    }

    getTypes(): Observable<string[]> {
        return this.types;
    }
}