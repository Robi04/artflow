import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSubmitMission } from '../../api/missions';
import { useAuthStore } from '../../store/auth.store';

export default function MissionDetailScreen({ route, navigation }: any) {
  const { mission } = route.params;
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const submit = useSubmitMission();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!image) return Alert.alert('Sélectionne une image');
    try {
      const result = await submit.mutateAsync({ missionId: mission.id, image });
      await refreshUser();
      const feedback = result.aiFeedback;
      const badgeMsg = result.newBadges?.length ? `\n\n🏆 Nouveau badge : ${result.newBadges.join(', ')}` : '';
      Alert.alert(
        `Score : ${feedback.score}/10`,
        `${feedback.comment}\n\n✅ Points forts :\n${feedback.strengths?.join('\n')}\n\n💡 Axes d'amélioration :\n${feedback.improvements?.join('\n')}${badgeMsg}`,
        [{ text: 'Super !', onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message ?? 'Erreur lors de la soumission');
    }
  };

  const isCompleted = mission.status === 'COMPLETED';

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <View className="bg-card rounded-2xl p-5 border border-border mb-5">
        <Text className="text-white text-xl font-bold mb-2">{mission.title}</Text>
        {mission.description && <Text className="text-muted">{mission.description}</Text>}
        <View className="flex-row justify-between mt-4">
          <Text className="text-muted text-sm">Récompense</Text>
          <Text className="text-primary-light font-semibold">+{mission.xpReward} XP</Text>
        </View>
      </View>

      {isCompleted ? (
        <View className="bg-green-900/30 rounded-2xl p-5 border border-green-800 items-center">
          <Text className="text-green-400 text-lg font-bold">Mission accomplie ✅</Text>
          {mission.submission?.aiFeedback && (
            <View className="mt-3 w-full">
              <Text className="text-white font-semibold mb-1">Feedback IA :</Text>
              <Text className="text-muted">{(mission.submission.aiFeedback as any).comment}</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <TouchableOpacity
            className="bg-card rounded-2xl p-5 border border-border border-dashed items-center mb-4"
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image.uri }} className="w-full h-64 rounded-xl" resizeMode="cover" />
            ) : (
              <>
                <Text className="text-4xl mb-2">🖼️</Text>
                <Text className="text-muted">Sélectionner mon œuvre</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center"
            onPress={handleSubmit}
            disabled={submit.isPending || !image}
            style={{ opacity: !image ? 0.5 : 1 }}
          >
            {submit.isPending
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Soumettre mon travail</Text>
            }
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
