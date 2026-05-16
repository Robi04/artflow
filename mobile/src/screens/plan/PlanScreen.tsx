import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { usePlan, useCreatePlan, useToggleAxis } from '../../api/plan';

const ALL_AXES = [
  { key: 'ANATOMY', label: 'Anatomie', emoji: '🦴' },
  { key: 'PERSPECTIVE', label: 'Perspective', emoji: '📐' },
  { key: 'COMPOSITION', label: 'Composition', emoji: '🖼️' },
  { key: 'VALUES', label: 'Valeurs', emoji: '🌑' },
  { key: 'COLORS', label: 'Couleurs', emoji: '🎨' },
  { key: 'FIND_MY_STYLE', label: 'Trouver mon style', emoji: '✨' },
];

function PlanSetup() {
  const [selected, setSelected] = useState<string[]>([]);
  const createPlan = useCreatePlan();

  const toggle = (key: string) =>
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleCreate = async () => {
    if (selected.length === 0) return Alert.alert('Sélectionne au moins un axe');
    try {
      await createPlan.mutateAsync(selected);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le plan');
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <View className="mt-10 mb-6">
        <Text className="text-white text-2xl font-bold mb-2">Crée ton plan</Text>
        <Text className="text-muted">Choisis les axes sur lesquels tu veux progresser chaque semaine.</Text>
      </View>
      {ALL_AXES.map((axis) => {
        const active = selected.includes(axis.key);
        return (
          <TouchableOpacity
            key={axis.key}
            className="rounded-2xl p-4 mb-3 border flex-row items-center"
            style={{ backgroundColor: active ? '#7c3aed22' : '#1a1a1a', borderColor: active ? '#7c3aed' : '#2a2a2a' }}
            onPress={() => toggle(axis.key)}
          >
            <Text className="text-2xl mr-3">{axis.emoji}</Text>
            <Text className="text-white font-semibold flex-1">{axis.label}</Text>
            {active && <Text className="text-primary-light">✓</Text>}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center mt-4"
        onPress={handleCreate} disabled={createPlan.isPending}
      >
        <Text className="text-white font-semibold">{createPlan.isPending ? 'Création...' : `Créer mon plan (${selected.length})`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function PlanScreen() {
  const { data, isLoading, error } = usePlan();
  const toggleAxis = useToggleAxis();

  if (isLoading) return <View className="flex-1 bg-bg items-center justify-center"><ActivityIndicator color="#7c3aed" /></View>;
  if (error || !data) return <PlanSetup />;

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-white text-2xl font-bold mt-10 mb-6">Mon plan</Text>
      {data.userAxes?.map((axis: any) => {
        const meta = ALL_AXES.find((a) => a.key === axis.axisType);
        const xpToNext = axis.level * 200;
        const progress = Math.min(axis.xp / xpToNext, 1);
        return (
          <View key={axis.id} className="bg-card rounded-2xl p-4 mb-3 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{meta?.emoji}</Text>
                <View>
                  <Text className="text-white font-semibold">{meta?.label}</Text>
                  <Text className="text-muted text-xs">Niveau {axis.level} · {axis.xp}/{xpToNext} XP</Text>
                </View>
              </View>
              <TouchableOpacity
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: axis.isActive ? '#22c55e22' : '#71717a22' }}
                onPress={() => toggleAxis.mutate(axis.axisType)}
              >
                <Text style={{ color: axis.isActive ? '#22c55e' : '#71717a', fontSize: 12 }}>
                  {axis.isActive ? 'Actif' : 'Inactif'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-border rounded-full h-2 overflow-hidden">
              <View className="bg-primary h-2 rounded-full" style={{ width: `${progress * 100}%` }} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
