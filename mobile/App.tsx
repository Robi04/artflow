import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

// GestureHandlerRootView ne fonctionne pas sur web
const Wrapper = Platform.OS === 'web'
  ? ({ children }: any) => <View style={{ flex: 1 }}>{children}</View>
  : require('react-native-gesture-handler').GestureHandlerRootView;

export default function App() {
  return (
    <Wrapper style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </Wrapper>
  );
}
