import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PickOptions = {
  allowsEditing?: boolean;
  aspect?: [number, number];
};

export async function pickImageOrCamera(opts: PickOptions = {}): Promise<ImagePicker.ImagePickerAsset | null> {
  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à l'appareil photo est nécessaire.");
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, ...opts });
    return result.canceled ? null : result.assets[0];
  };

  const launchGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      ...opts,
    });
    return result.canceled ? null : result.assets[0];
  };

  if (Platform.OS === 'web') return launchGallery();

  return new Promise((resolve) => {
    Alert.alert(
      'Ajouter une photo',
      undefined,
      [
        { text: '📷 Appareil photo', onPress: () => launchCamera().then(resolve) },
        { text: '🖼️ Galerie', onPress: () => launchGallery().then(resolve) },
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
      ],
    );
  });
}
