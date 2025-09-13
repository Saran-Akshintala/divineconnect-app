import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Card, Button, Chip, Avatar, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await axios.get(`${API_BASE_URL}/bookings${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const cancelBooking = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              const response = await axios.put(
                `${API_BASE_URL}/bookings/${bookingId}/cancel`,
                { reason: 'Cancelled by user' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                loadBookings();
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const renderBookingCard = (booking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <Card.Content>
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceType}>{booking.service_type}</Text>
            <Text style={styles.bookingId}>Booking #{booking.id}</Text>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusText(booking.status)}
          </Chip>
        </View>

        {/* Poojari Info */}
        <View style={styles.poojariSection}>
          <Avatar.Text 
            size={40} 
            label={booking.poojari.name.charAt(0)} 
            style={styles.poojariAvatar}
          />
          <View style={styles.poojariDetails}>
            <Text style={styles.poojariName}>{booking.poojari.name}</Text>
            <Text style={styles.poojariPhone}>{booking.poojari.phone}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{booking.duration_hours} hours</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.amountValue}>₹{booking.amount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{booking.city}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {booking.status === 'pending' && (
            <Button
              mode="outlined"
              onPress={() => cancelBooking(booking.id)}
              style={styles.cancelButton}
              textColor="#F44336"
            >
              Cancel
            </Button>
          )}
          
          {booking.status === 'completed' && !booking.review && (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddReview', { booking })}
              style={styles.reviewButton}
            >
              Add Review
            </Button>
          )}
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            style={styles.detailsButton}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                filter === option.key && styles.activeFilterTab
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Text style={[
                styles.filterText,
                filter === option.key && styles.activeFilterText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.length > 0 ? (
          bookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No bookings found' : `No ${filter} bookings found`}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Home')}
              style={styles.browseButton}
            >
              Browse Poojaris
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 2,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  bookingsList: {
    flex: 1,
    padding: 15,
  },
  bookingCard: {
    marginBottom: 15,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  poojariSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  poojariAvatar: {
    backgroundColor: '#FF6B35',
    marginRight: 12,
  },
  poojariDetails: {
    flex: 1,
  },
  poojariName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  poojariPhone: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.45,
    borderColor: '#F44336',
  },
  reviewButton: {
    flex: 0.45,
    borderColor: '#FF6B35',
  },
  detailsButton: {
    flex: 0.45,
    backgroundColor: '#FF6B35',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B35',
  },
});

export default MyBookingsScreen;
