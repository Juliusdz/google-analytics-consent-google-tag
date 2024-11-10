import { Inject, Injectable } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('Global window object', {
  factory: () => window
});

declare type CONSENT_ACTION = {
  'ad_storage': "denied" | "granted",
  'ad_user_data': "denied" | "granted",
  'ad_personalization': "denied" | "granted",
  'analytics_storage': "denied" | "granted"
}

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {

  gTag = "G-XXXXXXXX"

  constructor(@Inject(WINDOW) private window: Window) {
    // Order for defaultConsentScript and googleTagScript is important !
    this.defaultConsentScript();
    this.googleTagScript();
  }

  defaultConsentScript() {
    const ad_storage = localStorage.getItem('ad_storage') || 'denied';
    const ad_user_data = localStorage.getItem('ad_user_data') || 'denied';
    const ad_personalization = localStorage.getItem('ad_personalization') || 'denied';
    const analytics_storage = localStorage.getItem('analytics_storage') || 'denied';

    const defaultConsent = {
      'ad_storage': ad_storage,
      'ad_user_data': ad_user_data,
      'ad_personalization': ad_personalization,
      'analytics_storage': analytics_storage
    }

    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', ${JSON.stringify(defaultConsent)});
    `;
    document.body.appendChild(gtagScript);
  }

  googleTagScript() {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gTag}`;
    document.body.appendChild(script);

    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.gTag}', {
        'cookie_flags': 'SameSite=None;Secure'
      });   
    `;
    document.body.appendChild(gtagScript);    
  }

  updateGTagConsent(consent: CONSENT_ACTION) {
    if (typeof this.window.gtag !== 'undefined') {
      this.window.gtag('consent', 'update', {
        ad_storage: consent.ad_storage,
        ad_user_data: consent.ad_user_data,
        ad_personalization: consent.ad_personalization,
        analytics_storage: consent.analytics_storage
      })
    } else {
      console.error('gtag is not defined');
    }
  }
}
