import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { PlayerComponent } from './app/player.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(PlayerComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot([])),
  ]
})
.catch(err => console.error(err));
