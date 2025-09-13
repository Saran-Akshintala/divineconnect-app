import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { Card, Button, RadioButton, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const BookingScreen = ({ route, navigation }) => {
  const { poojari } = route.params;
  const [bookingData, setBookingData] = useState({
    serviceType: '',
    serviceDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    durationHours: 2,
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPhone: '',
    alternatePhone: '',
    specialRequirements: '',
    materialsRequired: [],
    materialsProvidedBy: 'devotee',
    bookingNotes: ''
  });
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    'Ganesh Pooja',
    'Satyanarayan Katha',
    'Griha Pravesh',
    'Wedding Ceremony',
    'Navratri Pooja',
    'Karva Chauth',
    'Corporate Pooja',
    'Festival Celebration',
    'Other'
  ];

  const commonMaterials = [
    'Flowers',
    'Fruits',
    'Sweets',
    'Incense',
    'Oil/Ghee',
    'Rice',
    'Coconut',
    'Sacred Thread',
    'Camphor',
    'Sandalwood'
  ];

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const calculateAmount = () => {
    return poojari.pricingPerHour * bookingData.durationHours;
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleMaterial = (material) => {
    setBookingData(prev => ({
      ...prev,
      materialsRequired: prev.materialsRequired.includes(material)
        ? prev.materialsRequired.filter(m => m !== material)
        : [...prev.materialsRequired, material]
    }));
  };

  const validateBooking = () => {
    const required = ['serviceType', 'scheduledDate', 'scheduledTime', 'address', 'city', 'contactPhone'];
    const missing = required.filter(field => !bookingData[field]);
    
    if (missing.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (bookingData.contactPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid contact phone number');
      return false;
    }

    return true;
  };

  const createBooking = async () => {
    if (!validateBooking()) return;

    setLoading(true);
    try {
      const token = await getAuthToken();
      const amount = calculateAmount();

      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        poojariId: poojari.id,
        ...bookingData,
        amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Booking created successfully! Proceed to payment.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to payment or booking details
                navigation.navigate('MyBookings');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Poojari Info */}
      <Card style={styles.poojariCard}>
        <Card.Content>
          <Text style={styles.poojariName}>{poojari.user.name}</Text>
          <Text style={styles.poojariLocation}>{poojari.city}, {poojari.state}</Text>
          <Text style={styles.pricing}>₹{poojari.pricingPerHour}/hour</Text>
        </Card.Content>
      </Card>

      {/* Service Details */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <Text style={styles.label}>Service Type *</Text>
          <View style={styles.serviceTypes}>
            {serviceTypes.map((service) => (
              <Chip
                key={service}
                selected={bookingData.serviceType === service}
                onPress={() => handleInputChange('serviceType', service)}
                style={[
                  styles.serviceChip,
                  bookingData.serviceType === service && styles.selectedChip
                ]}
              >
                {service}
              </Chip>
            ))}
          </View>

          <Text style={styles.label}>Service Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your requirements in detail"
            value={bookingData.serviceDescription}
            onChangeText={(value) => handleInputChange('serviceDescription', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Duration (Hours) *</Text>
          <View style={styles.durationContainer}>
            {[1, 2, 3, 4, 5, 6].map((hours) => (
              <Chip
                key={hours}
                selected={bookingData.durationHours === hours}
                onPress={() => handleInputChange('durationHours', hours)}
                style={[
                  styles.durationChip,
                  bookingData.durationHours === hours && styles.selectedChip
                ]}
              >
                {hours}h
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Date & Time */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={bookingData.scheduledDate}
            onChangeText={(value) => handleInputChange('scheduledDate', value)}
          />

          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM (24-hour format)"
            value={bookingData.scheduledTime}
            onChangeText={(value) => handleInputChange('scheduledTime', value)}
          />
        </Card.Content>
      </Card>

      {/* Location */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Complete address where service is required"
            value={bookingData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline
            numberOfLines={2}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={bookingData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={bookingData.state}
                onChangeText={(value) => handleInputChange('state', value)}
              />
            </View>
          </View>

          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            value={bookingData.pincode}
            onChangeText={(value) => handleInputChange('pincode', value)}
            keyboardType="numeric"
          />
        </Card.Content>
      </Card>

      {/* Contact Details */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <Text style={styles.label}>Contact Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Primary contact number"
            value={bookingData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Alternate Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Alternate contact number"
            value={bookingData.alternatePhone}
            onChangeText={(value) => handleInputChange('alternatePhone', value)}
            keyboardType="phone-pad"
          />
        </Card.Content>
      </Card>

      {/* Materials */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Materials Required</Text>
          
          <Text style={styles.label}>Who will provide materials?</Text>
          <RadioButton.Group
            onValueChange={(value) => handleInputChange('materialsProvidedBy', value)}
            value={bookingData.materialsProvidedBy}
          >
            <View style={styles.radioOption}>
              <RadioButton value="devotee" />
              <Text style={styles.radioLabel}>I will arrange materials</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="poojari" />
              <Text style={styles.radioLabel}>Poojari will arrange materials</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="both" />
              <Text style={styles.radioLabel}>Both will arrange</Text>
            </View>
          </RadioButton.Group>

          <Text style={styles.label}>Select required materials:</Text>
          <View style={styles.materialsContainer}>
            {commonMaterials.map((material) => (
              <Chip
                key={material}
                selected={bookingData.materialsRequired.includes(material)}
                onPress={() => toggleMaterial(material)}
                style={[
                  styles.materialChip,
                  bookingData.materialsRequired.includes(material) && styles.selectedChip
                ]}
              >
                {material}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Special Requirements */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <Text style={styles.label}>Special Requirements</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any special requirements or instructions"
            value={bookingData.specialRequirements}
            onChangeText={(value) => handleInputChange('specialRequirements', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Booking Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Additional notes for the poojari"
            value={bookingData.bookingNotes}
            onChangeText={(value) => handleInputChange('bookingNotes', value)}
            multiline
            numberOfLines={2}
          />
        </Card.Content>
      </Card>

      {/* Pricing Summary */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>
              Service ({bookingData.durationHours} hours @ ₹{poojari.pricingPerHour}/hr)
            </Text>
            <Text style={styles.pricingValue}>₹{calculateAmount()}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{calculateAmount()}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Book Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={createBooking}
          loading={loading}
          disabled={loading}
          style={styles.bookButton}
        >
          Create Booking - ₹{calculateAmount()}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  poojariCard: {
    margin: 15,
    elevation: 2,
  },
  poojariName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  poojariLocation: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  pricing: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  sectionCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  serviceTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  serviceChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedChip: {
    backgroundColor: '#FF6B35',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durationChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bookButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 5,
  },
});

export default BookingScreen;
