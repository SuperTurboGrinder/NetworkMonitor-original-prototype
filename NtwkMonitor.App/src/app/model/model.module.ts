import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from "@angular/common/http";

import { NodesRepository } from "./ntwkNodes.repository";
import { RestDataSource } from "./rest.datasource";
import { PingCache } from "./pingCache.model";
import { AppsService } from "./apps.service";
import { SoundService } from "./sound.service";
import { PersistentViewDataService } from "./persistentViewData.service"

@NgModule({
    imports: [HttpModule, HttpClientModule],
    providers: [
        NodesRepository,
        RestDataSource,
        PingCache,
        AppsService,
        SoundService,
        PersistentViewDataService
    ]
})
export class ModelModule {}