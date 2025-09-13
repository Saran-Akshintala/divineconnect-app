import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { loginUser, clearError } from '../../store/slices/authSlice';
import { theme } from '../../theme';

const validationSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
});

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleLogin = async (values) => {
    try {
      // In a real app, you would integrate Firebase Auth here
      // For now, we'll simulate the Firebase token
      const mockFirebaseToken = 'mock_firebase_token_' + Date.now();
      
      const result = await dispatch(loginUser({
        phone: `+91${values.phone}`,
        firebaseToken: mockFirebaseToken
      }));
      
      if (loginUser.rejected.match(result)) {
        setSnackbarVisible(true);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to DivineConnect</Text>
          <Text style={styles.subtitle}>Connect with verified Poojaris for authentic spiritual services</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={{ phone: '' }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <Text style={styles.formTitle}>Login with Phone Number</Text>
                  
                  <TextInput
                    label="Phone Number"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                    maxLength={10}
                    left={<TextInput.Affix text="+91" />}
                    error={touched.phone && errors.phone}
                    style={styles.input}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                  >
                    Send OTP
                  </Button>
                </View>
              )}
            </Formik>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Don't have an account?</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Register Now
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          dispatch(clearError());
        }}
        duration={4000}
      >
        {error || 'Login failed. Please try again.'}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    elevation: 4,
    borderRadius: theme.roundness,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  divider: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dividerText: {
    color: theme.colors.placeholder,
    fontSize: 14,
  },
  registerButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
