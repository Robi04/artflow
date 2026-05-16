import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useMissions } from '../../api/missions';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  COMPLETED: '#22c55e',
};

const AXIS_EMOJI: Record<string, string> = {
  ANATOMY: '🦴', PERSPECTIVE: '📐', COMPOSITION: '🖼️',
  VALUES: '🌑', COLORS: '🎨', FIND_MY_STYLE: '✨',
};

export default function HomeScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error } = useMissions();

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <View className="mt-10 mb-6">
        <Text className="text-muted text-sm">Bonjour,</Text>
        <Text className="text-white text-2xl font-bold">{user?.name} 👋</Text>
        <View className="flex-row gap-4 mt-3">
          <View className="bg-card rounded-xl px-4 py-2 border border-border">
            <Text className="text-muted text-xs">XP Global</Text>
            <Text className="text-primary-light font-bold">{user?.globalXp ?? 0}</Text>
          </View>
          <View className="bg-card rounded-xl px-4 py-2 border border-border">
            <Text className="text-muted text-xs">Streak</Text>
            <Text className="text-primary-light font-bold">{user?.streakCount ?? 0} 🔥</Text>
          </View>
        </View>
      </View>

      <Text className="text-white text-lg font-semibold mb-4">
        Missions — Semaine {data?.weekNumber}
      </Text>

      {isLoading && <ActivityIndicator color="#7c3aed" className="mt-10" />}

      {error && (
        <View className="items-center mt-20 px-4">
          <Text className="text-4xl mb-4">📋</Text>
          <Text className="text-white text-lg font-semibold mb-2 text-center">Pas encore de plan</Text>
          <Text className="text-muted text-center mb-6">Configure ton plan d'entraînement pour recevoir tes missions hebdomadaires.</Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={() => navigation.navigate('Plan')}
          >
            <Text className="text-white font-semibold">Créer mon plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {data?.missions?.map((mission: any) => (
        <TouchableOpacity
          key={mission.id}
          className="bg-card rounded-2xl p-4 mb-3 border border-border"
          onPress={() => navigation.navigate('MissionDetail', { mission })}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">{AXIS_EMOJI[mission.userAxis?.axisType] ?? '🎯'}</Text>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: STATUS_COLORS[mission.status] + '22' }}
              >
                <Text style={{ color: STATUS_COLORS[mission.status], fontSize: 11, fontWeight: '600' }}>
                  {mission.status === 'PENDING' ? 'À faire' : 'Terminée'}
                </Text>
              </View>
            </View>
            <Text className="text-muted text-xs">+{mission.xpReward} XP</Text>
          </View>
          <Text className="text-white font-semibold mb-1">{mission.title}</Text>
          {mission.description && (
            <Text className="text-muted text-sm" numberOfLines={2}>{mission.description}</Text>
          )}
        </TouchableOpacity>
      ))}

      {data?.missions?.length === 0 && (
        <View className="items-center mt-20">
          <Text className="text-muted text-center">Crée ton plan pour commencer tes missions !</Text>
        </View>
      )}
    </ScrollView>
  );
}
