// Menu card: search, quick filters, and dishes in a two-column photo grid grouped by
// meal, with a floating MENU button that jumps between meal sections.
import { Ionicons } from '@expo/vector-icons';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DishTile } from '../components/DishTile';
import { MenuFab } from '../components/MenuFab';
import { Text, TextInput } from '../components/Text';
import { VegMark } from '../components/ui';
import { DishSheet } from '../sheets/DishSheet';
import { getDb } from '../db/open';
import { type Dish, listDishes, rejectDishPhoto, setDishActive } from '../db/repo';
import { palette as p } from '../design/palette';
import {
  buildMenuSections, headerIndex, type MenuFilters, type MenuRow, NO_FILTERS, type SectionKey, toRows,
} from '../domain/menuCard';
import { fillMissingPhotos, notifyPhotosUpdated, onPhotosUpdated } from '../lib/photoFiller';
import { markDishAdded } from '../lib/rotation';

const GUTTER = 18;
const GAP = 14;

export function MenuCardScreen({ bottomInset }: { bottomInset: number }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tileW = Math.floor((width - GUTTER * 2 - GAP) / 2);
  const listRef = useRef<FlashListRef<MenuRow<Dish>>>(null);

  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>(NO_FILTERS);
  const [collapsed, setCollapsed] = useState<Set<SectionKey>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      getDb().then((db) => listDishes(db))
        .then((d) => { if (alive) setDishes(d); })
        .catch((e: unknown) => { if (alive) setError(String(e)); });
    };
    load();
    const off = onPhotosUpdated(load);
    return () => { alive = false; off(); };
  }, [reloadTick]);

  const sections = useMemo(() => buildMenuSections(dishes ?? [], filters), [dishes, filters]);
  const rows = useMemo(() => toRows(sections, collapsed), [sections, collapsed]);
  const inRotation = useMemo(() => (dishes ?? []).filter((d) => d.active).length, [dishes]);

  const toggleActive = useCallback((dish: Dish) => {
    const next = !dish.active;
    // Optimistic update so the button flips instantly.
    setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, active: next } : d)) ?? list);
    markDishAdded(dish.name, next);
    getDb().then((db) => setDishActive(db, dish.id, next)).catch(() => {
      setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, active: dish.active } : d)) ?? list);
    });
  }, []);

  const wrongPhoto = useCallback((dish: Dish) => {
    Alert.alert('Wrong photo?', `Rasoi will drop this photo of ${dish.name} and look for a better match. If none fits, the dish shows without a photo.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Find another',
        onPress: () => {
          getDb()
            .then(async (db) => {
              await rejectDishPhoto(db, dish.id);
              notifyPhotosUpdated();
              await fillMissingPhotos(db, { maxDishes: 3 });
            })
            .catch(() => {});
        },
      },
    ]);
  }, []);

  const toggleSection = (key: SectionKey) => {
    void Haptics.selectionAsync();
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  const jumpTo = (key: SectionKey) => {
    if (collapsed.has(key)) setCollapsed((s) => { const n = new Set(s); n.delete(key); return n; });
    // Wait a frame so an expanded section is laid out before scrolling.
    requestAnimationFrame(() => {
      const index = headerIndex(rows, key);
      if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 4 });
    });
  };

  const set = (patch: Partial<MenuFilters>) => {
    void Haptics.selectionAsync();
    setFilters((f) => ({ ...f, ...patch }));
  };

  if (error) return <Text style={{ color: p.nonVeg, padding: GUTTER }}>{`Couldn't open the menu card: ${error}`}</Text>;
  if (!dishes) return null;

  const fabBottom = Math.max(insets.bottom, 12) + 4 + 64;

  return (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: p.surface2, borderRadius: 14, paddingHorizontal: 14, height: 48 }}>
          <Ionicons name="search" size={18} color={p.inkSoft} />
          <TextInput
            value={filters.query}
            onChangeText={(query) => setFilters((f) => ({ ...f, query }))}
            placeholder={`Search ${dishes.length} dishes`}
            placeholderTextColor={p.inkFaint}
            returnKeyType="search"
            autoCorrect={false}
            style={{ flex: 1, marginLeft: 10, color: p.ink, fontSize: 15, paddingVertical: 0 }}
          />
          {filters.query ? (
            <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setFilters((f) => ({ ...f, query: '' }))}>
              <Ionicons name="close-circle" size={18} color={p.inkFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingVertical: 12, gap: 8 }} style={{ flexGrow: 0 }}>
        <ToggleChip veg on={filters.vegOnly} onPress={() => set({ vegOnly: !filters.vegOnly })} />
        <ToggleChip veg={false} on={filters.nonVegOnly} onPress={() => set({ nonVegOnly: !filters.nonVegOnly })} />
        <TextChip icon="flame" label="High protein" on={filters.highProtein} onPress={() => set({ highProtein: !filters.highProtein })} />
        <TextChip icon="water" label="Soak" on={filters.soakOnly} onPress={() => set({ soakOnly: !filters.soakOnly })} />
        <TextChip icon="checkmark-circle" label={`Added (${inRotation})`} on={filters.inRotationOnly} onPress={() => set({ inRotationOnly: !filters.inRotationOnly })} />
      </ScrollView>
      <View style={{ height: 1, backgroundColor: p.line }} />

      {rows.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 34 }}>🔍</Text>
          <Text style={{ color: p.ink, fontSize: 16, fontWeight: '600', marginTop: 8 }}>No dishes match</Text>
          <Text style={{ color: p.inkSoft, fontSize: 13, marginTop: 4, textAlign: 'center' }}>Try another search or turn off a filter.</Text>
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={rows}
          keyExtractor={(r) => r.key}
          getItemType={(r) => r.type}
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
          renderItem={({ item }) => item.type === 'header' ? (
            <Pressable
              onPress={() => toggleSection(item.section.key)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 14 }}
            >
              <Text style={{ flex: 1, color: p.ink, fontSize: 19, fontWeight: '700' }}>{`${item.section.title} (${item.section.dishes.length})`}</Text>
              <Ionicons name={item.collapsed ? 'chevron-down' : 'chevron-up'} size={20} color={p.ink} />
            </Pressable>
          ) : (
            <Animated.View entering={FadeIn.duration(200)} style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: GUTTER, paddingBottom: 22 }}>
              {item.dishes.map((d) => (
                <DishTile key={d.id} dish={d} width={tileW} placeholderEmoji={emojiFor(item.section)} onToggle={toggleActive} onWrongPhoto={wrongPhoto} onOpen={(x) => setOpenId(x.id)} />
              ))}
            </Animated.View>
          )}
        />
      )}

      <DishSheet
        dish={dishes.find((d) => d.id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onChanged={() => setReloadTick((t) => t + 1)}
        onToggle={toggleActive}
      />

      <MenuFab
        bottom={fabBottom}
        categories={sections.map((s) => ({ key: s.key, title: s.title, emoji: s.emoji, count: s.dishes.length }))}
        onPick={jumpTo}
      />
    </View>
  );
}

function emojiFor(key: SectionKey): string {
  return key === 'breakfast' ? '🍳' : key === 'lunch' ? '🍛' : key === 'dinner' ? '🍲' : '🥟';
}

/** Veg / non-veg filter: the food mark plus a small switch track. */
function ToggleChip({ veg, on, onPress }: { veg: boolean; on: boolean; onPress: () => void }) {
  const tone = veg ? p.veg : p.nonVeg;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={veg ? 'Veg only' : 'Non-veg only'}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: on ? tone : p.line, backgroundColor: p.surface }}
    >
      <VegMark veg={veg} size={16} />
      <View style={{ width: 30, height: 12, borderRadius: 99, backgroundColor: on ? tone : p.surface2, justifyContent: 'center', paddingHorizontal: 2 }}>
        <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: p.white, alignSelf: on ? 'flex-end' : 'flex-start' }} />
      </View>
    </Pressable>
  );
}

function TextChip({ icon, label, on, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: on ? p.brand : p.line, backgroundColor: on ? p.brandSoft : p.surface }}
    >
      <Ionicons name={icon} size={14} color={on ? p.brand : p.inkSoft} />
      <Text style={{ color: on ? p.brandInk : p.ink, fontSize: 13.5, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}
