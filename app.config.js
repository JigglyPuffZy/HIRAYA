const appJson = require('./app.json');
const easJson = require('./eas.json');

// Prefer process.env (EAS injects these). Fall back to eas.json preview.env so
// APK builds always bake Supabase config even if env injection timing differs.
const previewEnv = (easJson.build && easJson.build.preview && easJson.build.preview.env) || {};

function readPublic(name) {
  const fromEnv = (process.env[name] || '').trim();
  if (fromEnv) return fromEnv;
  return String(previewEnv[name] || '').trim();
}

const apiUrl = readPublic('EXPO_PUBLIC_API_URL');
const supabaseUrl = readPublic('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = readPublic('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const allowCleartext =
  readPublic('EXPO_PUBLIC_ALLOW_CLEARTEXT') === 'true' ||
  apiUrl.startsWith('http://');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[HIRAYA] Missing Supabase public config. Login/register will fail in this build.',
  );
}

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      usesCleartextTraffic: allowCleartext,
    },
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...(appJson.expo.ios.infoPlist || {}),
        NSAppTransportSecurity: allowCleartext
          ? { NSAllowsLocalNetworking: true, NSAllowsArbitraryLoads: true }
          : { NSAllowsLocalNetworking: false },
      },
    },
    extra: {
      ...(appJson.expo.extra || {}),
      supabaseUrl,
      supabaseAnonKey,
      apiUrl,
      allowCleartext,
    },
  },
};
