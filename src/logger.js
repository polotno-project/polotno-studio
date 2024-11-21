import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DNS,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  shouldSendCallback: function (data) {
    // only send 10% of errors
    var sampleRate = 100;
    return Math.random() * 100 <= sampleRate;
  },
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
    // Generic error code from errors outside the security sandbox
    // You can delete this if using raven.js > 1.0, which ignores these automatically.
    'Script error.',
    // Avast extension error
    '_avast_submit',
  ],
  denyUrls: [
    // Google Adsense
    /pagead\/js/i,
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  ],
});

function base64ToUint8Array(base64DataUrl) {
  // Remove the metadata prefix from the data URL
  const base64String = base64DataUrl.split(',')[1];
  // Decode the base64 string
  const binaryString = atob(base64String);
  // Create a Uint8Array to hold the decoded data
  const buffer = new Uint8Array(binaryString.length);

  // Fill the buffer with the decoded data
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  return buffer;
}

// Sentry.addGlobalEventProcessor(function (event, hint) {
//   if (window.store) {
//     const data = JSON.stringify(window.store.toJSON());
//     if (data.length < 30000) {
//       hint.attachments = [
//         { filename: 'store.json', data: JSON.stringify(window.store.toJSON()) },
//       ];
//     }
//     if (window.__failedImage) {
//       hint.attachments = [
//         {
//           filename: 'failedImage.png',
//           data: base64ToUint8Array(window.__failedImage),
//           contentType: 'image/png',
//         },
//       ];
//     }
//   }
//   return event;
// });

window.Sentry = Sentry;
