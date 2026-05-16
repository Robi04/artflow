import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/auth.store';
import { useAllBadges, useMyBadges } from '../../api/badges';
import { authApi } from '../../api/auth';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { data: allBadges } = useAllBadges();
  const { data: myBadges, isLoading } = useMyBadges();
  const [uploading, setUploading] = useState(false);

  const earnedIds = new Set(myBadges?.map((ub: any) => ub.badge.condition));

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire pour changer ta photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';

    try {
      setUploading(true);
      await authApi.uploadAvatar(asset.uri, mimeType);
      await refreshUser();
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la photo de profil.");
    } finally {
      setUploading(false);
    }
  };

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
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploading}
            className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3 overflow-hidden"
            style={{ position: 'relative' }}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            ) : (
              <Text className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</Text>
            )}
            {uploading && (
              <View
                style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: 32,
                }}
              >
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
            <View
              style={{
                position: 'absolute', bottom: 0, right: 0,
                backgroundColor: '#7c3aed',
                borderRadius: 8, width: 16, height: 16,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, lineHeight: 16 }}>✎</Text>
            </View>
          </TouchableOpacity>
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
