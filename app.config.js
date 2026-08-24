const appJson = require('./app.json');

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
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
  },
};
