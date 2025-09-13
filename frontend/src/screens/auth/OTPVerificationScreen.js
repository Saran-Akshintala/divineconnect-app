import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, Button, Card, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { theme } from '../../theme';

const OTPVerificationScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const { phone } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  const otpRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setSnackbarVisible(true);
      return;
    }
    
    // In a real app, verify OTP with Firebase
    console.log('Verifying OTP:', otpString);
    // Navigate to main app or complete registration
  };

  const handleResendOtp = () => {
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    // Resend OTP logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Phone Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {phone}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => (otpRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            loading={loading}
            disabled={loading || otp.join('').length !== 6}
            style={styles.verifyButton}
            contentStyle={styles.buttonContent}
          >
            Verify OTP
          </Button>

          <View style={styles.resendContainer}>
            {canResend ? (
              <Button
                mode="text"
                onPress={handleResendOtp}
                style={styles.resendButton}
              >
                Resend OTP
              </Button>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {timer}s
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Please enter a valid 6-digit OTP
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: theme.roundness,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xl,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.roundness,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  verifyButton: {
    marginTop: theme.spacing.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  resendButton: {
    marginTop: theme.spacing.sm,
  },
  timerText: {
    color: theme.colors.placeholder,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
});

export default OTPVerificationScreen;
