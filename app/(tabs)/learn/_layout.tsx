import { Stack } from 'expo-router';

export default function LearnLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="chapter/[id]"
        options={{ 
          title: 'Chapter',
          headerShown: true,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="quiz/[id]"
        options={{ 
          title: 'Quiz',
          headerShown: true,
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}