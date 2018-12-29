import { Injectable } from "@angular/core";
import { Http, Request, RequestMethod } from "@angular/http";
import "rxjs/Rx";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/retry";

import { NtwkNode, ParentData } from "./ntwkNode.model";
import { PersistentViewDataService } from "./persistentViewData.service"
import { nodeChildrenAsMap } from "@angular/router/src/utils/tree";

const PROTOCOL = "http";
const PORT = 5000;

@Injectable()
export class RestDataSource {
    constructor(private http: Http, private pvd:PersistentViewDataService) {
    }

    getNodesTypes(): Observable<string[]> {
        return this.sendRequest<string[]>(RequestMethod.Get, "types");
    }

    getNode(id: number): Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Get, `${id}`);
    }

    getNodes(): Observable<NtwkNode[]> {
        return this.sendRequest<NtwkNode[]>(RequestMethod.Get, "all");
    }

    getNodeParent(id: number): Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Get, `${id}/parent`);
    }

    getNodeChildren(id: number): Observable<NtwkNode[]> {
        return this.sendRequest<NtwkNode[]>(RequestMethod.Get, `${id}/children`);
    }

    getRootChildren(id: number): Observable<NtwkNode[]> {
        return this.sendRequest<NtwkNode[]>(RequestMethod.Get, "root/children");
    }

    getNodesByType(id: number): Observable<NtwkNode[]> {
        return this.sendRequest<NtwkNode[]>(RequestMethod.Get, `byType/${id}`);
    }

    createNodeOnRoot(node:NtwkNode):Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Post, "create", node);
    }

    createWithParent(node:NtwkNode, parentID:number):Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Post, `createWithParent/${parentID}`, node);
    }

    updateNode(node:NtwkNode, parentID:number = 0):Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Put, `update/${node.id}/withParent/${parentID}`, node);
    }

    removeNode(nodeId:number):Observable<NtwkNode> {
        return this.sendRequest<NtwkNode>(RequestMethod.Delete, `remove/${nodeId}`);
    }

    private sendRequest<T>(verb: RequestMethod,
        url:string, body?: T,
        auth: boolean = false
    ): Observable<T> {
        let request = new Request({
            method: verb,
            url: `${this.pvd.getBaseUrl()}/nodes/data/` + url,
            body: body
        });
        return this.http.request(request).retry(10).catch(err => {
            console.log(err);
            return Observable.of(null);
        })
        .map(response => response.json());
    }
}