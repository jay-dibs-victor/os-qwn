import { Platform } from 'react-native';

let PlatformMap: any;

if (Platform.OS === 'web') {
  PlatformMap = require('./PlatformMap.web').PlatformMap;
} else {
  PlatformMap = require('./PlatformMap.native').PlatformMap;
}

export { PlatformMap };
