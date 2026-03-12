const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const crashEndpoint = import.meta.env.VITE_CRASH_ENDPOINT;

function postTelemetry(url, payload) {
  if (!url) return;

  try {
    const serializedPayload = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, serializedPayload);
      return;
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedPayload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Telemetry must never block the app.
  }
}

export function trackEvent(eventName, properties = {}) {
  const payload = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  postTelemetry(analyticsEndpoint, payload);
}

export function reportError(error, context = {}) {
  const payload = {
    message: error?.message || 'Unknown error',
    stack: error?.stack || '',
    context,
    timestamp: new Date().toISOString(),
  };

  postTelemetry(crashEndpoint, payload);
}
