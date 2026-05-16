import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

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
    try {
      setUploading(true);
      await authApi.uploadAvatar(asset.uri, asset.mimeType ?? 'image/jpeg');
      await refreshUser();
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la photo de profil.");
    } finally {
      setUploading(false);
    }
  };

  const openNameModal = () => {
    setNameInput(user?.name ?? '');
    setNameModalVisible(true);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      setSavingName(true);
      await authApi.updateProfile(nameInput.trim());
      await refreshUser();
      setNameModalVisible(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le nom.');
    } finally {
      setSavingName(false);
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
          {/* Avatar */}
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploading}
            style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', marginBottom: 12, position: 'relative' }}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: 64, height: 64 }} />
            ) : (
              <View style={{ width: 64, height: 64, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{user?.name?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            {uploading && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7c3aed', borderRadius: 8, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 10 }}>✎</Text>
            </View>
          </TouchableOpacity>

          {/* Nom éditable */}
          <TouchableOpacity onPress={openNameModal} className="flex-row items-center gap-2 mb-1">
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
            <Text style={{ color: '#71717a', fontSize: 13 }}>✎</Text>
          </TouchableOpacity>

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

      {/* Badges */}
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

      {/* Modal changement de nom */}
      <Modal visible={nameModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Changer de nom</Text>
            <TextInput
              className="bg-bg text-white rounded-xl px-4 py-4 mb-5 border border-border"
              placeholder="Ton nom"
              placeholderTextColor="#71717a"
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border border-border rounded-xl py-4 items-center"
                onPress={() => setNameModalVisible(false)}
              >
                <Text className="text-muted">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-4 items-center"
                onPress={handleSaveName}
                disabled={savingName || !nameInput.trim()}
              >
                <Text className="text-white font-semibold">{savingName ? '...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
