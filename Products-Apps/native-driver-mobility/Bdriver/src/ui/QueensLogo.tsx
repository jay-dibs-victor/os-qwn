import { Image, ImageStyle, View } from 'react-native';

type Props = {
  size?: number;
  style?: ImageStyle;
};

export function QueensLogo({ size = 72, style }: Props) {
  // Use the SVG logo directly
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={require('../../assets/logo.jpg')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    </View>
  );
}