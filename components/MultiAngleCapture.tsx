import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { spacing } from '../constants/Styles';
import { CapturedImages } from '../types';

// Avatar images for each angle
const AVATAR_IMAGES: Record<string, ImageSourcePropType> = {
  front: require('../assets/images/Frontviewpicture.png'),
  leftSide: require('../assets/images/leftviewpicture.png'),
  rightSide: require('../assets/images/rightviewpicture.png'),
  back: require('../assets/images/backviewpicture.png'),
};

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';
const TEXT_SECONDARY = '#9CA3AF';

interface MultiAngleCaptureProps {
  onComplete: (images: CapturedImages) => void;
}

type AngleStep = 'front' | 'leftSide' | 'rightSide' | 'back';
type ScreenMode = 'instruction' | 'camera' | 'preview';

const ANGLE_CONFIG: Record<AngleStep, {
  title: string;
  instruction: string;
  detailedInstructions: string[];
  icon: string;
  avatarPlaceholder: string;
}> = {
  front: {
    title: 'Front View',
    instruction: 'Face the camera straight on',
    detailedInstructions: [
      'Hold phone at eye level',
      'Look directly at the camera',
      'Keep your head straight, not tilted',
    ],
    icon: 'person',
    avatarPlaceholder: 'FRONT',
  },
  leftSide: {
    title: 'Left Side',
    instruction: 'Turn to show your left side',
    detailedInstructions: [
      'Turn your head 90° to the right',
      'Show your left ear to the camera',
      'Keep your chin level',
    ],
    icon: 'arrow-back',
    avatarPlaceholder: 'LEFT',
  },
  rightSide: {
    title: 'Right Side',
    instruction: 'Turn to show your right side',
    detailedInstructions: [
      'Turn your head 90° to the left',
      'Show your right ear to the camera',
      'Keep your chin level',
    ],
    icon: 'arrow-forward',
    avatarPlaceholder: 'RIGHT',
  },
  back: {
    title: 'Back View',
    instruction: 'Show the back of your head',
    detailedInstructions: [
      'Turn completely around',
      'Face away from the camera',
      'Hold phone behind your head or use a mirror',
    ],
    icon: 'ellipse',
    avatarPlaceholder: 'BACK',
  },
};

const ANGLE_ORDER: AngleStep[] = ['front', 'leftSide', 'rightSide', 'back'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MultiAngleCapture({ onComplete }: MultiAngleCaptureProps) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState<AngleStep>('front');
  const [screenMode, setScreenMode] = useState<ScreenMode>('instruction');
  const [capturedImages, setCapturedImages] = useState<Partial<CapturedImages>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentStepIndex = ANGLE_ORDER.indexOf(currentStep);

  const handleContinueToCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScreenMode('camera');
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo?.uri) {
        handleImageCaptured(photo.uri);
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
        handleImageCaptured(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleImageCaptured = (uri: string) => {
    // Show preview instead of auto-advancing
    setPreviewImage(uri);
    setScreenMode('preview');
  };

  const handleUsePhoto = () => {
    if (!previewImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCapturedImages = { ...capturedImages, [currentStep]: previewImage };
    setCapturedImages(newCapturedImages);
    setPreviewImage(null);

    // Check if all images are captured
    if (Object.keys(newCapturedImages).length === 4) {
      // All done, call onComplete after a short delay
      setTimeout(() => {
        onComplete(newCapturedImages as CapturedImages);
      }, 500);
    } else {
      // Move to next step - show instruction first
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < ANGLE_ORDER.length) {
        setTimeout(() => {
          setCurrentStep(ANGLE_ORDER[nextIndex]);
          setScreenMode('instruction');
        }, 300);
      }
    }
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewImage(null);
    setScreenMode('camera');
  };

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(current => !current);
  };

  // Permission screens
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconCircle}>
            <Ionicons name="camera-outline" size={64} color={ACCENT_BLUE} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            FadeCheck needs camera access to analyze your haircut from multiple angles
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.9}
            style={styles.permissionButton}
          >
            <LinearGradient
              colors={[ACCENT_BLUE, '#2563EB'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const config = ANGLE_CONFIG[currentStep];

  // Instruction Screen
  if (screenMode === 'instruction') {
    return (
      <View style={styles.container}>
        <View style={styles.instructionScreen}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {ANGLE_ORDER.map((angle, index) => (
              <View
                key={angle}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: index <= currentStepIndex ? ACCENT_BLUE : 'rgba(255,255,255,0.2)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Step Indicator */}
          <Text style={styles.stepIndicatorText}>Step {currentStepIndex + 1} of 4</Text>

          {/* Title */}
          <Text style={styles.instructionTitle}>{config.title}</Text>

          {/* Avatar Image - Square with rounded corners */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarImageWrapper}>
              <Image
                source={AVATAR_IMAGES[currentStep]}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Instruction subtitle below image */}
          <Text style={styles.instructionSubtitle}>{config.instruction}</Text>

          {/* Detailed Instructions */}
          <View style={styles.detailedInstructions}>
            {config.detailedInstructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionBullet}>
                  <Ionicons name="checkmark" size={14} color={ACCENT_BLUE} />
                </View>
                <Text style={styles.instructionItemText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Captured Thumbnails (if any) */}
          {Object.keys(capturedImages).length > 0 && (
            <View style={styles.capturedPreview}>
              <Text style={styles.capturedPreviewLabel}>Captured</Text>
              <View style={styles.capturedThumbnails}>
                {ANGLE_ORDER.map((angle) => {
                  const uri = capturedImages[angle];
                  if (!uri) return null;
                  return (
                    <View key={angle} style={styles.capturedThumb}>
                      <Image source={{ uri }} style={styles.capturedThumbImage} />
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Continue Button */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueToCamera}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ACCENT_BLUE, '#2563EB'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>Take Photo</Text>
                <Ionicons name="camera" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Preview Screen
  if (screenMode === 'preview' && previewImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewScreen}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {ANGLE_ORDER.map((angle, index) => (
              <View
                key={angle}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: index <= currentStepIndex ? ACCENT_BLUE : 'rgba(255,255,255,0.2)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Step Indicator */}
          <Text style={styles.stepIndicatorText}>Step {currentStepIndex + 1} of 4</Text>

          {/* Title */}
          <Text style={styles.instructionTitle}>{config.title}</Text>
          <Text style={styles.previewSubtitle}>Does this look good?</Text>

          {/* Preview Image */}
          <View style={styles.previewImageContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          </View>

          {/* Action Buttons */}
          <View style={styles.previewButtonsContainer}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color={TEXT_PRIMARY} />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.usePhotoButton}
              onPress={handleUsePhoto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ACCENT_BLUE, '#2563EB'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.usePhotoButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.usePhotoButtonText}>Use Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Camera Screen
  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <Text style={styles.stepIndicator}>{currentStepIndex + 1}/4</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.cameraProgressContainer}>
          {ANGLE_ORDER.map((angle, index) => (
            <View
              key={angle}
              style={[
                styles.progressBar,
                {
                  backgroundColor: index <= currentStepIndex ? ACCENT_BLUE : 'rgba(255,255,255,0.2)',
                },
              ]}
            />
          ))}
        </View>

        {/* Instruction Reminder */}
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderText}>{config.instruction}</Text>
        </View>

        {/* Overlay guide */}
        <View style={styles.guideContainer}>
          <View style={styles.guideCircle} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Left Controls - Gallery + placeholder for balance */}
          <View style={styles.leftControls}>
            <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Capture Button - Centered */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Right Controls - Flash + Flip */}
          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.sideButton} onPress={toggleFlash}>
              <Ionicons
                name={flash ? 'flash' : 'flash-outline'}
                size={24}
                color={flash ? CYAN_GLOW : Colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
              <Ionicons name="camera-reverse-outline" size={26} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  // Instruction Screen Styles
  instructionScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  stepIndicatorText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarImageWrapper: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: 'rgba(1, 69, 242, 0.3)',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  detailedInstructions: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  instructionBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionBulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT_BLUE,
  },
  instructionItemText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 18,
  },
  capturedPreview: {
    marginTop: 20,
    alignItems: 'center',
  },
  capturedPreviewLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  capturedThumbnails: {
    flexDirection: 'row',
    gap: 6,
  },
  capturedThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  capturedThumbImage: {
    width: '100%',
    height: '100%',
  },
  bottomButtonContainer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  // Camera Screen Styles
  camera: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT_BLUE,
    backgroundColor: 'rgba(1, 69, 242, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraProgressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    gap: 6,
  },
  reminderContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
  },
  reminderText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideCircle: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: SCREEN_WIDTH * 0.325,
    borderWidth: 3,
    borderColor: 'rgba(1, 69, 242, 0.4)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 50,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    width: 106, // Same width as rightControls (48 + 10 + 48)
    justifyContent: 'flex-start',
  },
  rightControls: {
    flexDirection: 'row',
    width: 106, // 48 + 10 + 48
    gap: 10,
    justifyContent: 'flex-end',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: ACCENT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT_BLUE,
  },
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  permissionText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  permissionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  permissionButtonGradient: {
    height: 56,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  // Preview Screen Styles
  previewScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  previewSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  previewImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: 20,
    backgroundColor: CARD_BG,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 40,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  retakeButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  usePhotoButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  usePhotoButtonGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  usePhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
