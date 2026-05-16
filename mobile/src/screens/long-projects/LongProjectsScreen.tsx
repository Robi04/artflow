import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLongProjects, useCreateLongProject } from '../../api/longProjects';

const COLUMN_GAP = 12;
const SCREEN_PADDING = 20;
const NUM_COLUMNS = 2;
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - SCREEN_PADDING * 2 - COLUMN_GAP) / NUM_COLUMNS;

export default function LongProjectsScreen({ navigation }: any) {
  const { data, isLoading } = useLongProjects();
  const createProject = useCreateLongProject();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert('Donne un titre à ton projet');
    try {
      await createProject.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      setTitle(''); setDescription(''); setModalVisible(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le projet');
    }
  };

  const inProgress = data?.filter((p: any) => p.status === 'IN_PROGRESS') ?? [];
  const completed = data?.filter((p: any) => p.status === 'COMPLETED') ?? [];

  const renderCard = (project: any) => {
    const cover = project.photos?.[project.photos.length - 1]?.imageUrl ?? null;
    const isCompleted = project.status === 'COMPLETED';

    return (
      <TouchableOpacity
        key={project.id}
        onPress={() => navigation.navigate('LongProjectDetail', { projectId: project.id })}
        style={{ width: cardWidth, marginBottom: COLUMN_GAP }}
      >
        {/* Cover */}
        <View style={{ width: cardWidth, height: cardWidth, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a1a1a', marginBottom: 8 }}>
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32 }}>🎨</Text>
            </View>
          )}
          {/* Status badge */}
          <View style={{
            position: 'absolute', top: 8, right: 8,
            backgroundColor: isCompleted ? '#22c55ecc' : '#f59e0bcc',
            borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
              {isCompleted ? '✅ Terminé' : '🔄 En cours'}
            </Text>
          </View>
          {/* Photo count */}
          {project.photos?.length > 0 && (
            <View style={{
              position: 'absolute', bottom: 8, left: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
            }}>
              <Text style={{ color: '#fff', fontSize: 10 }}>📷 {project.photos.length}</Text>
            </View>
          )}
        </View>

        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{project.title}</Text>
        {project.description ? (
          <Text style={{ color: '#71717a', fontSize: 11, marginTop: 2 }} numberOfLines={2}>{project.description}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: SCREEN_PADDING }}>
        <View className="flex-row items-center justify-between mt-10 mb-6">
          <Text className="text-white text-2xl font-bold">Mes projets</Text>
          <TouchableOpacity className="bg-primary rounded-xl px-4 py-2" onPress={() => setModalVisible(true)}>
            <Text className="text-white font-semibold">+ Nouveau</Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator color="#7c3aed" />}

        {data?.length === 0 && !isLoading && (
          <View className="items-center mt-20">
            <Text className="text-4xl mb-3">🎨</Text>
            <Text className="text-muted text-center">Lance ton premier projet long terme !</Text>
          </View>
        )}

        {/* En cours */}
        {inProgress.length > 0 && (
          <>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">En cours</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP, marginBottom: 12 }}>
              {inProgress.map(renderCard)}
            </View>
          </>
        )}

        {/* Terminés */}
        {completed.length > 0 && (
          <>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 mt-2">Terminés</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP }}>
              {completed.map(renderCard)}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Nouveau projet</Text>
            <TextInput
              className="bg-bg text-white rounded-xl px-4 py-4 mb-3 border border-border"
              placeholder="Titre du projet" placeholderTextColor="#71717a"
              value={title} onChangeText={setTitle}
            />
            <TextInput
              className="bg-bg text-white rounded-xl px-4 py-4 mb-5 border border-border"
              placeholder="Description (optionnel)" placeholderTextColor="#71717a"
              value={description} onChangeText={setDescription} multiline numberOfLines={3}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 border border-border rounded-xl py-4 items-center" onPress={() => setModalVisible(false)}>
                <Text className="text-muted">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary rounded-xl py-4 items-center" onPress={handleCreate} disabled={createProject.isPending}>
                <Text className="text-white font-semibold">{createProject.isPending ? '...' : 'Créer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
