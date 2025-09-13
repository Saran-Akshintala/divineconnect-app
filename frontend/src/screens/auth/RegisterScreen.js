import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { registerUser, clearError } from '../../store/slices/authSlice';
import { theme } from '../../theme';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .optional(),
  role: Yup.string()
    .oneOf(['devotee', 'poojari'], 'Please select a role')
    .required('Role is required'),
});

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleRegister = async (values) => {
    try {
      // In a real app, you would integrate Firebase Auth here
      const mockFirebaseToken = 'mock_firebase_token_' + Date.now();
      
      const result = await dispatch(registerUser({
        ...values,
        phone: `+91${values.phone}`,
        firebaseToken: mockFirebaseToken
      }));
      
      if (registerUser.rejected.match(result)) {
        setSnackbarVisible(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Join DivineConnect</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={{ 
                name: '', 
                phone: '', 
                email: '', 
                role: 'devotee' 
              }}
              validationSchema={validationSchema}
              onSubmit={handleRegister}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View>
                  <Text style={styles.formTitle}>Create Account</Text>
                  
                  <TextInput
                    label="Full Name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                    style={styles.input}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

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

                  <TextInput
                    label="Email (Optional)"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    error={touched.email && errors.email}
                    style={styles.input}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <View style={styles.roleSection}>
                    <Text style={styles.roleTitle}>I am a:</Text>
                    <RadioButton.Group
                      onValueChange={(value) => setFieldValue('role', value)}
                      value={values.role}
                    >
                      <View style={styles.radioOption}>
                        <RadioButton value="devotee" />
                        <View style={styles.radioContent}>
                          <Text style={styles.radioLabel}>Devotee</Text>
                          <Text style={styles.radioDescription}>
                            Looking for spiritual services and Pooja bookings
                          </Text>
                        </View>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="poojari" />
                        <View style={styles.radioContent}>
                          <Text style={styles.radioLabel}>Poojari</Text>
                          <Text style={styles.radioDescription}>
                            Providing spiritual services and conducting Poojas
                          </Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                  >
                    Create Account
                  </Button>
                </View>
              )}
            </Formik>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Already have an account?</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          dispatch(clearError());
        }}
        duration={4000}
      >
        {error || 'Registration failed. Please try again.'}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
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
  },
  card: {
    elevation: 4,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.lg,
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
  roleSection: {
    marginVertical: theme.spacing.md,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  radioContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  radioDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  registerButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  loginButton: {
    marginTop: theme.spacing.sm,
  },
});

export default RegisterScreen;
