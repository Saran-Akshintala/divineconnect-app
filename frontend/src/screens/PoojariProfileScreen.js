import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const PoojariProfileScreen = ({ route, navigation }) => {
  const { poojari } = route.params;
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
    loadAvailability();
  }, []);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const loadReviews = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/poojaris/${poojari.id}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReviews(response.data.data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/poojaris/${poojari.id}/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAvailability(response.data.data.availability || []);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleCall = () => {
    const phoneNumber = poojari.user.phone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleBookNow = () => {
    navigation.navigate('Booking', { poojari });
  };

  const renderReview = (review, index) => (
    <Card key={index} style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <Avatar.Text 
            size={40} 
            label={review.user?.name?.charAt(0) || 'U'} 
            style={styles.reviewAvatar}
          />
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
            <View style={styles.reviewRating}>
              <Text style={styles.stars}>{'⭐'.repeat(review.rating)}</Text>
              <Text style={styles.ratingText}>{review.rating}/5</Text>
            </View>
          </View>
        </View>
        <Text style={styles.reviewComment}>{review.comment}</Text>
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={poojari.user.name.charAt(0)} 
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{poojari.user.name}</Text>
              <Text style={styles.profileLocation}>{poojari.city}, {poojari.state}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {poojari.averageRating}</Text>
                <Text style={styles.reviews}>({poojari.totalReviews} reviews)</Text>
              </View>
              <Text style={styles.experience}>{poojari.experienceYears} years experience</Text>
            </View>
          </View>

          <Text style={styles.bio}>{poojari.bio}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              style={[styles.actionButton, styles.bookButton]}
              onPress={handleBookNow}
            >
              Book Now
            </Button>
            <Button 
              mode="outlined" 
              style={styles.actionButton}
              onPress={handleCall}
            >
              Call
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Pricing */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingContainer}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Per Hour</Text>
              <Text style={styles.priceValue}>₹{poojari.pricingPerHour}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Per Service</Text>
              <Text style={styles.priceValue}>₹{poojari.pricingPerService}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Languages */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.chipsContainer}>
            {poojari.languages.map((language, index) => (
              <Chip key={index} style={styles.chip}>
                {language}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Specializations */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.chipsContainer}>
            {poojari.specializations.map((spec, index) => (
              <Chip key={index} style={styles.chip}>
                {spec}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Reviews */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((review, index) => renderReview(review, index))
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
          {reviews.length > 3 && (
            <Button mode="text" onPress={() => {}}>
              View All Reviews
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Availability */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Availability</Text>
          {availability.length > 0 ? (
            <View style={styles.availabilityContainer}>
              {availability.slice(0, 7).map((slot, index) => (
                <View key={index} style={styles.availabilitySlot}>
                  <Text style={styles.availabilityDate}>
                    {new Date(slot.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.availabilityTime}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noAvailability}>
              Contact poojari for availability
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Bottom Booking Button */}
      <View style={styles.bottomContainer}>
        <Button 
          mode="contained" 
          style={styles.bottomBookButton}
          onPress={handleBookNow}
        >
          Book This Poojari
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
  profileCard: {
    margin: 15,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  profileAvatar: {
    backgroundColor: '#FF6B35',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  bookButton: {
    backgroundColor: '#FF6B35',
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
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  reviewCard: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    backgroundColor: '#FF6B35',
    marginRight: 10,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    marginRight: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  noReviews: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilitySlot: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 120,
  },
  availabilityDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  availabilityTime: {
    fontSize: 11,
    color: '#666',
  },
  noAvailability: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bottomBookButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 5,
  },
});

export default PoojariProfileScreen;
