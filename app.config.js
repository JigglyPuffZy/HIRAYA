const appJson = require('./app.json');

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const allowCleartext =
  process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true' ||
  apiUrl.startsWith('http://');

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      // Needed only when ML API uses http:// (LAN). Prefer https:// for public release.
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
    // Bake public config into the binary so APK auth works even if Metro
    // process.env inlining is incomplete.
    extra: {
      ...(appJson.expo.extra || {}),
      supabaseUrl,
      supabaseAnonKey,
      apiUrl,
      allowCleartext,
    },
  },
};
