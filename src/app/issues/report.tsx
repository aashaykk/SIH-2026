import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { API_CONFIG, COLORS, THEME } from '../../config/constants';

export default function ReportIssueScreen() {
  const router = useRouter(); const { token } = useAuth();
  const [description, setDescription] = useState(''); const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('');

  const chooseImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setError('Camera permission is required to submit photo evidence.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.75, exif: false });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!imageUri || description.trim().length < 5) { setError('Add a short description and a photo.'); return; }
    setSubmitting(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission is required to route your complaint to the correct ward.');
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const form = new FormData();
      form.append('description', description.trim());
      form.append('latitude', String(location.coords.latitude)); form.append('longitude', String(location.coords.longitude));
      form.append('image', { uri: imageUri, name: `complaint-${Date.now()}.jpg`, type: 'image/jpeg' } as any);
      const response = await fetch(`${API_CONFIG.BASE_URL}/issues`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Could not submit the complaint');
      Alert.alert(payload.duplicate ? 'Joined existing incident' : 'Complaint submitted', payload.duplicate ? 'Your report was added to the existing incident.' : `AI routed this issue to ${payload.data.department || 'the municipal team'}.`, [{ text: 'View reports', onPress: () => router.replace('/(tabs)/my-reports' as any) }]);
    } catch (e: any) { setError(e.message || 'Could not submit the complaint'); } finally { setSubmitting(false); }
  };

  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}>
    <Text variant="headlineSmall" style={styles.title}>Report civic issue</Text>
    <Text style={styles.subtitle}>AI will classify the evidence, check nearby duplicates, and route it to the ward and department.</Text>
    <Button mode="outlined" icon="camera" onPress={chooseImage} style={styles.photoButton}>{imageUri ? 'Retake photo' : 'Take photo'}</Button>
    {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
    <TextInput label="What is happening? (English, Hindi or Marathi)" mode="outlined" multiline value={description} onChangeText={setDescription} style={styles.input} />
    <HelperText type="error" visible={!!error}>{error}</HelperText>
    <Button mode="contained" icon="send" onPress={submit} loading={submitting} disabled={submitting} style={styles.submit}>Analyze & submit</Button>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container:{flex:1,backgroundColor:COLORS.background}, content:{padding:THEME.padding.md,gap:THEME.padding.md}, title:{fontWeight:'bold',color:COLORS.text}, subtitle:{color:COLORS.textSecondary,lineHeight:20}, photoButton:{borderColor:COLORS.primary}, preview:{width:'100%',height:240,borderRadius:THEME.roundness}, input:{backgroundColor:COLORS.surface,minHeight:110}, submit:{backgroundColor:COLORS.primary,paddingVertical:6} });
