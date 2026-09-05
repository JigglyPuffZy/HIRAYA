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

/** @param {{ config: Record<string, any> }} ctx */
module.exports = ({ config }) => {
  const plugins = [...(config.plugins || [])];

  plugins.push([
    'expo-build-properties',
    {
      android: {
        usesCleartextTraffic: allowCleartext,
      },
    },
  ]);

  return {
    ...config,
    plugins,
    ios: {
      ...(config.ios || {}),
      infoPlist: {
        ...((config.ios && config.ios.infoPlist) || {}),
        NSAppTransportSecurity: allowCleartext
          ? { NSAllowsLocalNetworking: true, NSAllowsArbitraryLoads: true }
          : { NSAllowsLocalNetworking: false },
      },
    },
    extra: {
      ...(config.extra || {}),
      supabaseUrl,
      supabaseAnonKey,
      apiUrl,
      allowCleartext,
    },
  };
};
