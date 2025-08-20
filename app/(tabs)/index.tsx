import Voice from '@react-native-voice/voice';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCoordinateStore } from '../store/coordinateStore';

export default function HomeScreen() {
  const [inputs, setInputs] = useState([
    { latitude: '', longitude: '' },
    { latitude: '', longitude: '' },
    { latitude: '', longitude: '' },
    { latitude: '', longitude: '' },
  ]);
  const [voiceText, setVoiceText] = useState('');

  const storeCoords = useCoordinateStore((state) => state.fieldCoords)
  const setFieldCoords = useCoordinateStore((state) => state.setFieldCoords);
  const setCorners = useCoordinateStore((state) => state.setCorners);

  useEffect(() => {
    if (storeCoords.length > 0) {
      const mappedCoords = storeCoords.map(coord => ({
        latitude: coord.latitude.toString(),
        longitude: coord.longitude.toString()
      }));
      setInputs(mappedCoords)
    }

    // Voice listeners
    Voice.onSpeechResults = (e: { value: string | any[]; }) => {
      if (e.value && e.value.length > 0) {
        setVoiceText(e.value[0]); // first recognized text
        console.log("Recognized text:", e.value[0]);
      }
    };

    Voice.onSpeechError = (e: { error: any; }) => {
      console.error("Speech error:", e.error);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleInputChange = (index: number, key: 'latitude' | 'longitude', value: string) => {
    const updated = [...inputs];
    updated[index][key] = value;
    setInputs(updated);
  };

  const handleSend = () => {
    const converted = inputs.map(i => ({
      latitude: parseFloat(i.latitude),
      longitude: parseFloat(i.longitude),
    }));
    let neCorner = { latitude: -90, longitude: -180 }
    let swCorner = { latitude: 90, longitude: 180 }

    for (let point of converted) {
      if (point.latitude < swCorner.latitude) swCorner.latitude = point.latitude
      if (point.latitude > neCorner.latitude) neCorner.latitude = point.latitude
      if (point.longitude < swCorner.longitude) swCorner.longitude = point.longitude
      if (point.longitude > neCorner.longitude) neCorner.longitude = point.longitude
    }

    console.log('Field coords:', converted)
    setFieldCoords(converted);
    setCorners(swCorner, neCorner)
  };

  const handleVoiceCommand = async () => {
    try {
      console.log('Listening...');
      await Voice.start('en-US'); // change to 'pl-PL' or other locale if needed
    } catch (e) {
      console.error("Voice start error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Coordinates</Text>
      {inputs.map((coord, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={`Lat ${index + 1}`}
            keyboardType="numeric"
            value={coord.latitude}
            onChangeText={(text) => handleInputChange(index, 'latitude', text)}
          />
          <TextInput
            style={styles.input}
            placeholder={`Lng ${index + 1}`}
            keyboardType="numeric"
            value={coord.longitude}
            onChangeText={(text) => handleInputChange(index, 'longitude', text)}
          />
        </View>
      ))}
      <View style={styles.buttonRow}>
        <Button title="Send Coordinates" onPress={handleSend} />
        <TouchableOpacity onPress={handleVoiceCommand} style={styles.micButton}>
          <Text style={{ color: 'white' }}>🎤</Text>
        </TouchableOpacity>
      </View>

      {voiceText ? <Text style={{ marginTop: 20 }}>Heard: {voiceText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  buttonRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  micButton: {
    backgroundColor: '#f00',
    padding: 12,
    borderRadius: 50,
    marginLeft: 10,
  },
});
