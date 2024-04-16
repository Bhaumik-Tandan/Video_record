import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { calcHeight } from '../helper/res';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <View style={styles.container}>
      <Text>No access to camera</Text>
      <Button title="Retry Permission" onPress={requestCameraPermission} />
    </View>;
  }

  const recordVideo = async () => {
    if (cameraRef && !isRecording) {
      setIsRecording(true);
      try {
        const videoRecordPromise = cameraRef.recordAsync();
        if (videoRecordPromise) {
          const { uri } = await videoRecordPromise;
          setVideoUri(uri);
          console.log("Recording completed:", uri);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef && isRecording) {
      cameraRef.stopRecording();
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={(ref) => setCameraRef(ref)}>
        <View style={styles.buttonContainer}>
          <Button title={isRecording ? "Recording..." : "Record"} onPress={recordVideo} disabled={isRecording} />
          <Button title="Stop" onPress={stopRecording} disabled={!isRecording} />
        </View>
      </Camera>
      {videoUri && (
        <Video
          source={{ uri: videoUri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={true}
          isLooping
          style={styles.video}
          useNativeControls
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    bottom: calcHeight(20),
  },
  video: {
    width: 300,
    height: 300,
    position: 'absolute',
    bottom: 10,
  },
});

const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  setHasPermission(status === 'granted');
};

export default CameraScreen;
