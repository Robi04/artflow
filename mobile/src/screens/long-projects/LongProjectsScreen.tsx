import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLongProjects, useCreateLongProject } from '../../api/longProjects';

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

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center justify-between mt-10 mb-6">
          <Text className="text-white text-2xl font-bold">Mes projets</Text>
          <TouchableOpacity className="bg-primary rounded-xl px-4 py-2" onPress={() => setModalVisible(true)}>
            <Text className="text-white font-semibold">+ Nouveau</Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator color="#7c3aed" />}

        {data?.map((project: any) => (
          <TouchableOpacity
            key={project.id}
            className="bg-card rounded-2xl p-4 mb-3 border border-border"
            onPress={() => navigation.navigate('LongProjectDetail', { projectId: project.id })}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold flex-1" numberOfLines={1}>{project.title}</Text>
              <View
                className="rounded-full px-3 py-1 ml-2"
                style={{ backgroundColor: project.status === 'COMPLETED' ? '#22c55e22' : '#f59e0b22' }}
              >
                <Text style={{ color: project.status === 'COMPLETED' ? '#22c55e' : '#f59e0b', fontSize: 11 }}>
                  {project.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
                </Text>
              </View>
            </View>
            {project.description && <Text className="text-muted text-sm" numberOfLines={2}>{project.description}</Text>}
            <Text className="text-muted text-xs mt-2">{project.photos?.length ?? 0} photo(s)</Text>
          </TouchableOpacity>
        ))}

        {data?.length === 0 && (
          <View className="items-center mt-20">
            <Text className="text-4xl mb-3">🎨</Text>
            <Text className="text-muted text-center">Lance ton premier projet long terme !</Text>
          </View>
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
