import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  // chrome and edge hand over a prompt we can fire on a click of our own
  private promptEvent: any = null;
  private canInstall = new BehaviorSubject<boolean>(false);
  canInstall$ = this.canInstall.asObservable();

  constructor(private zone: NgZone) {
    const w: any = window;
    // the event may already have fired before angular was up, index.html keeps it
    this.promptEvent = w.deferredInstallPrompt || null;
    this.canInstall.next(!!this.promptEvent && !this.isInstalled);

    window.addEventListener('pwa-installable', () => {
      this.zone.run(() => {
        this.promptEvent = w.deferredInstallPrompt;
        this.canInstall.next(!this.isInstalled);
      });
    });

    window.addEventListener('pwa-installed', () => {
      this.zone.run(() => {
        this.promptEvent = null;
        this.canInstall.next(false);
      });
    });
  }

  // an installed app runs standalone, there is nothing left to offer there
  get isInstalled(): boolean {
    const w: any = window;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      w.navigator?.standalone === true
    );
  }

  // safari on iphone and ipad has no prompt, it only has the share sheet
  get isIos(): boolean {
    const ua = window.navigator.userAgent;
    const iOsDevice = /iPad|iPhone|iPod/.test(ua);
    // an ipad on a recent ipados reports itself as a mac with a touch screen
    const iPadOs =
      /Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1;
    return (iOsDevice || iPadOs) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
  }

  // returns whether the browser prompt was actually shown
  async install(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }
    this.promptEvent.prompt();
    const choice = await this.promptEvent.userChoice;
    // the event can only be used once, chrome hands over a fresh one if declined
    this.promptEvent = null;
    (window as any).deferredInstallPrompt = null;
    this.canInstall.next(false);
    return choice?.outcome === 'accepted';
  }
}
