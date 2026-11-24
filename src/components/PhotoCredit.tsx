// Very light credit line under a dish photo, as the photo licences require.
// Unsplash: "Photo by <name> on Unsplash". Wikimedia Commons: "Photo: <name> · <licence>".
import React from 'react';
import { Linking } from 'react-native';
import { palette as p } from '../design/palette';
import { UTM } from '../domain/photoPick';
import type { PhotoCreditInfo } from '../lib/dishImage';
import { Text } from './Text';

const UNSPLASH_HOME = `https://unsplash.com/?${UTM}`;
const style = { color: p.inkWhisper, fontSize: 10 } as const;
const link = { ...style, textDecorationLine: 'underline' } as const;

export function PhotoCredit({ credit }: { credit: PhotoCreditInfo }) {
  const open = (url: string) => { void Linking.openURL(url); };
  if (credit.kind === 'commons') {
    return (
      <Text style={style} numberOfLines={1} onPress={() => open(credit.pageUrl)}>
        {`Photo: ${credit.author} · ${credit.license}`}
      </Text>
    );
  }
  return (
    <Text style={style} numberOfLines={1}>
      {'Photo by '}
      <Text style={link} onPress={() => open(credit.authorUrl)}>{credit.author}</Text>
      {' on '}
      <Text style={link} onPress={() => open(UNSPLASH_HOME)}>Unsplash</Text>
    </Text>
  );
}
