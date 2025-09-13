import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        phoneNumber: `+91${phoneNumber}`
      });

      if (response.data.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully! Use 123456 for testing.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
        phoneNumber: `+91${phoneNumber}`,
        otp: otp
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        Alert.alert('Success', 'Login successful!');
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Title style={styles.title}>DivineConnect</Title>
          <Paragraph style={styles.subtitle}>
            Connect with verified Poojaris for your spiritual needs
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {!otpSent ? (
              <View>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={sendOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Send OTP
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Enter OTP</Text>
                <Text style={styles.otpInfo}>
                  OTP sent to +91{phoneNumber}
                </Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Button
                  mode="contained"
                  onPress={verifyOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Verify OTP
                </Button>
                <TouchableOpacity onPress={() => setOtpSent(false)}>
                  <Text style={styles.backText}>Back to phone number</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  card: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  otpInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  backText: {
    textAlign: 'center',
    color: '#FF6B35',
    marginTop: 15,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
