// Dish details from the Menu card: add / remove from the weekly plan, and attach a
// YouTube recipe video that is sent along with this dish in the cook's WhatsApp message.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { Text, TextInput } from '../components/Text';
import { Btn, Sheet, VegMark } from '../components/ui';
import { getDb } from '../db/open';
import { type Dish, setDishYoutube } from '../db/repo';
import { palette as p } from '../design/palette';
import { parseYouTube } from '../domain/youtube';

export function DishSheet({ dish, onClose, onChanged, onToggle }: {
  dish: Dish | null;
  onClose: () => void;
  /** Called after the video was saved or removed, so the list can reload. */
  onChanged: () => void;
  onToggle: (dish: Dish) => void;
}) {
  return (
    <Sheet visible={!!dish} onClose={onClose}>
      {dish ? <DishBody key={dish.id} dish={dish} onClose={onClose} onChanged={onChanged} onToggle={onToggle} /> : null}
    </Sheet>
  );
}

function DishBody({ dish, onClose, onChanged, onToggle }: {
  dish: Dish;
  onClose: () => void;
  onChanged: () => void;
  onToggle: (dish: Dish) => void;
}) {
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const video = dish.youtubeUrl ? parseYouTube(dish.youtubeUrl) : null;

  const save = async () => {
    const parsed = parseYouTube(link);
    if (!parsed) { setError("That doesn't look like a YouTube video link."); return; }
    await setDishYoutube(await getDb(), dish.id, parsed);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLink('');
    setError(null);
    onChanged();
  };

  const remove = async () => {
    await setDishYoutube(await getDb(), dish.id, null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChanged();
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <VegMark veg={dish.veg} />
        <Text style={{ flex: 1, color: p.ink, fontSize: 19, fontWeight: '700' }} numberOfLines={2}>{dish.name}</Text>
      </View>
      <Text style={{ color: p.inkSoft, fontSize: 13, marginTop: 4 }}>
        {`${Math.round(dish.proteinG)} g protein per serving${dish.soak ? '  ·  soak overnight' : ''}`}
      </Text>

      <Btn
        label={dish.active ? 'Added to your weekly plan' : 'Add to your weekly plan'}
        kind={dish.active ? 'plain' : 'primary'}
        icon={dish.active ? 'checkmark-circle' : 'add'}
        onPress={() => onToggle(dish)}
        style={{ marginTop: 16 }}
      />

      <Text style={{ color: p.ink, fontSize: 15, fontWeight: '700', marginTop: 22 }}>Recipe video</Text>
      <Text style={{ color: p.inkSoft, fontSize: 12.5, marginTop: 2 }}>Sent to your cook with this dish on WhatsApp.</Text>

      {video ? (
        <View style={{ marginTop: 12 }}>
          <Pressable onPress={() => { void Linking.openURL(video.url); }} style={{ borderRadius: 12, overflow: 'hidden' }}>
            <Image source={{ uri: video.thumbnailUrl }} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: p.surface2 }} accessibilityIgnoresInvertColors />
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 54, height: 38, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play" size={22} color={p.white} />
              </View>
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ flex: 1, color: p.inkSoft, fontSize: 12.5 }} numberOfLines={1}>{video.url}</Text>
            <Pressable onPress={() => { void remove(); }} hitSlop={8}>
              <Text style={{ color: p.nonVeg, fontSize: 13, fontWeight: '600' }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: p.surface2, borderRadius: 10, paddingHorizontal: 12, height: 46 }}>
            <Ionicons name="logo-youtube" size={18} color="#FF0000" />
            <TextInput
              value={link}
              onChangeText={(t) => { setLink(t); setError(null); }}
              placeholder="Paste a YouTube link"
              placeholderTextColor={p.inkFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={() => { void save(); }}
              style={{ flex: 1, marginLeft: 8, color: p.ink, fontSize: 14, paddingVertical: 0 }}
            />
          </View>
          {error ? <Text style={{ color: p.nonVeg, fontSize: 12, marginTop: 6 }}>{error}</Text> : null}
          <Btn label="Save video" kind="primary" icon="link" size="sm" onPress={() => { void save(); }} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </View>
      )}

      <Pressable onPress={onClose} style={{ alignSelf: 'center', marginTop: 18, padding: 6 }}>
        <Text style={{ color: p.inkSoft, fontSize: 14, fontWeight: '600' }}>Done</Text>
      </Pressable>
    </View>
  );
}
