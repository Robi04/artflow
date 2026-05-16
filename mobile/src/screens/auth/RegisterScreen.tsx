import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Erreur', 'Remplis tous les champs');
    if (password.length < 6) return Alert.alert('Erreur', 'Mot de passe trop court (6 min)');
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message ?? 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-white text-3xl font-bold mb-2">Créer un compte</Text>
        <Text className="text-muted text-base mb-10">Commence ta pratique artistique</Text>

        <TextInput
          className="bg-card text-white rounded-xl px-4 py-4 mb-3 border border-border"
          placeholder="Nom" placeholderTextColor="#71717a"
          value={name} onChangeText={setName}
        />
        <TextInput
          className="bg-card text-white rounded-xl px-4 py-4 mb-3 border border-border"
          placeholder="Email" placeholderTextColor="#71717a"
          value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
        />
        <TextInput
          className="bg-card text-white rounded-xl px-4 py-4 mb-6 border border-border"
          placeholder="Mot de passe (6 min)" placeholderTextColor="#71717a"
          value={password} onChangeText={setPassword} secureTextEntry
        />

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-4"
          onPress={handleRegister} disabled={loading}
        >
          <Text className="text-white font-semibold text-base">{loading ? 'Création...' : 'Créer mon compte'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
          <Text className="text-muted">Déjà un compte ? <Text className="text-primary-light">Se connecter</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
