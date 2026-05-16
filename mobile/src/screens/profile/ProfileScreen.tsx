import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useAllBadges, useMyBadges } from '../../api/badges';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: allBadges } = useAllBadges();
  const { data: myBadges, isLoading } = useMyBadges();

  const earnedIds = new Set(myBadges?.map((ub: any) => ub.badge.condition));

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tu veux vraiment te déconnecter ?')) logout();
    } else {
      Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <View className="mt-10 mb-6">
        <View className="bg-card rounded-2xl p-5 border border-border">
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text className="text-white text-xl font-bold">{user?.name}</Text>
          <Text className="text-muted">{user?.email}</Text>
          <View className="flex-row gap-4 mt-4">
            <View>
              <Text className="text-muted text-xs">Niveau global</Text>
              <Text className="text-white font-bold text-lg">{user?.globalLevel}</Text>
            </View>
            <View>
              <Text className="text-muted text-xs">XP total</Text>
              <Text className="text-white font-bold text-lg">{user?.globalXp}</Text>
            </View>
            <View>
              <Text className="text-muted text-xs">Streak</Text>
              <Text className="text-white font-bold text-lg">{user?.streakCount} 🔥</Text>
            </View>
          </View>
        </View>
      </View>

      <Text className="text-white text-lg font-semibold mb-4">
        Badges ({myBadges?.length ?? 0}/{allBadges?.length ?? 7})
      </Text>

      {isLoading && <ActivityIndicator color="#7c3aed" />}

      <View className="flex-row flex-wrap gap-3">
        {allBadges?.map((badge: any) => {
          const earned = earnedIds.has(badge.condition);
          return (
            <View
              key={badge.id}
              className="rounded-2xl p-3 border items-center"
              style={{
                width: '47%',
                backgroundColor: earned ? '#7c3aed22' : '#1a1a1a',
                borderColor: earned ? '#7c3aed' : '#2a2a2a',
                opacity: earned ? 1 : 0.5,
              }}
            >
              <Text className="text-2xl mb-1">{earned ? '🏆' : '🔒'}</Text>
              <Text className="text-white text-xs font-semibold text-center" numberOfLines={1}>{badge.name}</Text>
              <Text className="text-muted text-xs text-center mt-1" numberOfLines={2}>{badge.description}</Text>
              {earned && <Text className="text-primary-light text-xs mt-1">+{badge.xpReward} XP</Text>}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        className="border border-red-800 rounded-xl py-4 items-center mt-8 mb-4"
        onPress={handleLogout}
      >
        <Text className="text-red-400 font-semibold">Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
