import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAddPhoto, useArchiveProject, useCompleteProject } from '../../api/longProjects';
import { pickImageOrCamera } from '../../utils/pickImage';

export default function LongProjectDetailScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const { data: project, isLoading } = useQuery({
    queryKey: ['long-projects', projectId],
    queryFn: () => api.get(`/long-projects/${projectId}`).then((r) => r.data),
  });
  const addPhoto = useAddPhoto();
  const complete = useCompleteProject();
  const archive = useArchiveProject();

  const handleAddPhoto = async () => {
    const asset = await pickImageOrCamera();
    if (!asset) return;
    try {
      await addPhoto.mutateAsync({ projectId, image: asset });
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter la photo");
    }
  };

  const handleComplete = () => {
    Alert.alert('Terminer le projet ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer', style: 'destructive',
        onPress: async () => {
          const result = await complete.mutateAsync(projectId);
          const badgeMsg = result.newBadges?.length ? `\n🏆 Badge débloqué : ${result.newBadges.join(', ')}` : '';
          Alert.alert('Projet terminé !', `Bravo pour avoir mené ce projet à terme.${badgeMsg}`, [
            { text: 'Super !', onPress: () => navigation.goBack() },
          ]);
        },
      },
    ]);
  };

  if (isLoading) return <View className="flex-1 bg-bg items-center justify-center"><ActivityIndicator color="#7c3aed" /></View>;
  if (!project) return null;

  const isCompleted = project.status === 'COMPLETED';
  const isArchived = project.status === 'ARCHIVED';

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20 }}>
      <View className="bg-card rounded-2xl p-5 border border-border mb-5">
        <Text className="text-white text-xl font-bold mb-1">{project.title}</Text>
        {project.description && <Text className="text-muted">{project.description}</Text>}
        <View className="flex-row justify-between mt-3">
          <Text className="text-muted text-sm">{project.photos?.length ?? 0} photo(s)</Text>
          <Text style={{ color: isCompleted ? '#22c55e' : isArchived ? '#71717a' : '#f59e0b', fontSize: 12, fontWeight: '600' }}>
            {isCompleted ? '✅ Terminé' : isArchived ? '📦 Archivé' : '🔄 En cours'}
          </Text>
        </View>
      </View>

      {project.photos?.length > 0 && (
        <View className="mb-5">
          <Text className="text-white font-semibold mb-3">Progression</Text>
          <FlatList
            data={project.photos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item, index }: any) => (
              <View className="mr-3">
                <Image source={{ uri: item.imageUrl }} style={{ width: 140, height: 140, borderRadius: 12 }} resizeMode="cover" />
                <Text className="text-muted text-xs mt-1 text-center">#{index + 1}</Text>
              </View>
            )}
          />
        </View>
      )}

      {!isCompleted && !isArchived && (
        <View className="gap-3">
          <TouchableOpacity
            className="bg-card rounded-xl py-4 items-center border border-border"
            onPress={handleAddPhoto} disabled={addPhoto.isPending}
          >
            {addPhoto.isPending
              ? <ActivityIndicator color="#7c3aed" />
              : <Text className="text-white font-semibold">📷 Ajouter une photo</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-800 rounded-xl py-4 items-center" onPress={handleComplete}>
            <Text className="text-white font-semibold">✅ Marquer comme terminé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-xl py-4 items-center border border-border"
            style={{ backgroundColor: '#1a1a1a' }}
            onPress={() => {
              Alert.alert('Archiver le projet ?', 'Il sera déplacé dans les archives et tu pourras le consulter à tout moment.', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Archiver', onPress: () => archive.mutateAsync(projectId).then(() => navigation.goBack()) },
              ]);
            }}
          >
            <Text className="text-muted font-semibold">📦 Archiver</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
