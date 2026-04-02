import { provideZoneChangeDetection } from "@angular/core";
import { register } from 'swiper/element/bundle';
register();
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch(err => console.error(err));

ModuleRegistry.registerModules([AllCommunityModule]); 