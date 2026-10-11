// Ambient type fallbacks for the Bdriver app.
//
// This environment is missing the pre-built `.d.ts` files for a number of
// packages (notably `expo-router`, `react-native-svg`, `@expo/vector-icons`).
// The runtime code is correct; we add lightweight ambient declarations here
// so `tsc` can validate the project without depending on the missing types.
// When the real types are restored upstream these declarations will be
// superseded automatically (TS prefers them over `declare module` fallbacks).

declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'expo-router' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const x: any;
  export = x;
  // Function-shaped exports are typed as `(...args) => any` so they can also
  // be called with generic type arguments (e.g. `useLocalSearchParams<T>()`).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Tabs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Stack: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const router: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Redirect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useRouter: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useLocalSearchParams: <T = unknown>(...args: any[]) => T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useFocusEffect: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Slot: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Link: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SplashScreen: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ErrorBoundary: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Href: any;
}

declare module 'expo-router/head' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const head: any;
  export = head;
}

declare module 'react-native-svg' {
  // Wildcard proxy — TS doesn't allow arbitrary named exports so we list the
  // ones used in the project explicitly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const x: any;
  export = x;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SvgUri: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Svg: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Circle: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Defs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Ellipse: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const G: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const LinearGradient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Path: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Rect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Stop: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Text: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Polygon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Polyline: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Line: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SvgXml: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const RadialGradient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Use: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ClipPath: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Mask: any;
}

declare module '@expo/vector-icons' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const x: any;
  export = x;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Ionicons: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const MaterialIcons: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const MaterialCommunityIcons: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Feather: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const FontAwesome: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const AntDesign: any;
}

declare module 'expo-router/build/index' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const x: any;
  export = x;
}
