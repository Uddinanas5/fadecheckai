import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_PURPLE = '#A855F7';
const BACKGROUND = '#0D0D0D';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9CA3AF';
const TEXT_TERTIARY = '#6B7280';

type PhotoType = 'front' | 'side';

interface PhotoCaptureProps {
  photoType: PhotoType;
  onCapture: (uri: string) => void;
  onSkip?: () => void;
}

export default function PhotoCapture({ photoType, onCapture, onSkip }: PhotoCaptureProps) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const isFront = photoType === 'front';

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedImage(null);
  };

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={64} color={ACCENT_PURPLE} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            FadeCheck needs camera access to analyze your haircut
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.9}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryOnlyButton} onPress={pickImage}>
            <Text style={styles.galleryOnlyText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show preview if photo is captured
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={retakePhoto}>
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
          <Text style={styles.previewTitle}>
            {isFront ? 'Front Photo' : 'Side Photo'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmPhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Use This Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
      />

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isFront ? 'Upload a front photo' : 'Upload a side photo'}
          </Text>
          <Text style={styles.subtitle}>
            {isFront
              ? 'Show your haircut from the front'
              : 'Show the fade from the side'}
          </Text>
        </View>

        {/* Guide Circle */}
        <View style={styles.guideContainer}>
          <View style={styles.guideCircle}>
            <View style={styles.guideInner}>
              {isFront ? (
                <Ionicons name="person" size={60} color="rgba(255,255,255,0.3)" />
              ) : (
                <Ionicons name="person" size={60} color="rgba(255,255,255,0.3)" style={{ transform: [{ rotateY: '180deg' }] }} />
              )}
            </View>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={28} color={TEXT_PRIMARY} />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Flip Button */}
          <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={28} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Bottom Text */}
        <Text style={styles.bottomHint}>upload or take photo</Text>

        {/* Skip for side photo */}
        {!isFront && onSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideCircle: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInner: {
    opacity: 0.5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: ACCENT_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT_PURPLE,
  },
  bottomHint: {
    textAlign: 'center',
    color: TEXT_TERTIARY,
    fontSize: 14,
    paddingBottom: 20,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  skipText: {
    color: TEXT_TERTIARY,
    fontSize: 16,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: ACCENT_PURPLE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  permissionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
  },
  galleryOnlyButton: {
    marginTop: 16,
  },
  galleryOnlyText: {
    color: ACCENT_PURPLE,
    fontSize: 15,
    fontWeight: '500',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  retakeText: {
    color: ACCENT_PURPLE,
    fontSize: 16,
    fontWeight: '500',
  },
  previewTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  previewImage: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
    borderRadius: 20,
  },
  previewActions: {
    padding: 24,
    paddingBottom: 50,
  },
  confirmButton: {
    backgroundColor: ACCENT_PURPLE,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
  },
});
