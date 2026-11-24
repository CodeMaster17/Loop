// Text and TextInput that always render in Poppins. Custom fonts on Android ignore
// fontWeight, so the weight is turned into the matching Poppins family instead.
import React from 'react';
import {
  Text as RNText, TextInput as RNTextInput, StyleSheet, type TextInputProps, type TextProps, type TextStyle,
} from 'react-native';

export const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

export function fontFor(weight: TextStyle['fontWeight']): string {
  switch (String(weight ?? '400')) {
    case '800': case '900': return FONT.extrabold;
    case '700': case 'bold': return FONT.bold;
    case '600': return FONT.semibold;
    case '500': return FONT.medium;
    default: return FONT.regular;
  }
}

function poppins(style: TextProps['style']): TextStyle {
  const { fontWeight, fontFamily, ...rest } = StyleSheet.flatten(style) ?? {};
  return { ...rest, fontFamily: fontFamily ?? fontFor(fontWeight) };
}

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={poppins(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={poppins(style)} />;
}
