import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erreur', 'Remplis tous les champs');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message ?? 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-white text-4xl font-bold mb-2">ArtFlow</Text>
        <Text className="text-muted text-base mb-10">Pratique artistique hebdomadaire</Text>

        <TextInput
          className="bg-card text-white rounded-xl px-4 py-4 mb-3 border border-border"
          placeholder="Email" placeholderTextColor="#71717a"
          value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
        />
        <TextInput
          className="bg-card text-white rounded-xl px-4 py-4 mb-6 border border-border"
          placeholder="Mot de passe" placeholderTextColor="#71717a"
          value={password} onChangeText={setPassword} secureTextEntry
        />

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mb-4"
          onPress={handleLogin} disabled={loading}
        >
          <Text className="text-white font-semibold text-base">{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="items-center">
          <Text className="text-muted">Pas de compte ? <Text className="text-primary-light">Créer un compte</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
