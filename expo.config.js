import { ExpoConfig } from 'expo/config';

export default (() => {
  const config: ExpoConfig = {
    name: '企业内部移动助手',
    slug: 'corp-assistant-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: [
      '**/*',
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.corp.assistant',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'com.corp.assistant',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-font',
      'expo-splash-screen',
      'expo-status-bar',
      [
        'expo-linear-gradient',
        {
          orientation: 'bottom',
          colors: ['#FF0000', '#0000FF'],
        }
      ]
    ],
    extra: {
      eas: {
        projectId: 'corp-assistant-project'
      }
    }
  };

  return config;
})();