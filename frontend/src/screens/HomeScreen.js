import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { Card, Button, Chip, Avatar, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPoojaris, setFeaturedPoojaris] = useState([]);
  const [allPoojaris, setAllPoojaris] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    language: '',
    specialization: '',
    minRating: 0,
    maxPrice: ''
  });

  useEffect(() => {
    loadFeaturedPoojaris();
    loadAllPoojaris();
  }, []);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const loadFeaturedPoojaris = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/poojaris/featured`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFeaturedPoojaris(response.data.data.poojaris);
      }
    } catch (error) {
      console.error('Error loading featured poojaris:', error);
    }
  };

  const loadAllPoojaris = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.language) params.append('language', filters.language);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const response = await axios.get(`${API_BASE_URL}/poojaris?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAllPoojaris(response.data.data.poojaris);
      }
    } catch (error) {
      console.error('Error loading poojaris:', error);
      Alert.alert('Error', 'Failed to load poojaris');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, specialization: searchQuery }));
      loadAllPoojaris();
    }
  };

  const renderPoojariCard = ({ item }) => (
    <Card style={styles.poojariCard} onPress={() => navigation.navigate('PoojariProfile', { poojari: item })}>
      <Card.Content>
        <View style={styles.poojariHeader}>
          <Avatar.Text 
            size={50} 
            label={item.user.name.charAt(0)} 
            style={styles.avatar}
          />
          <View style={styles.poojariInfo}>
            <Text style={styles.poojariName}>{item.user.name}</Text>
            <Text style={styles.poojariLocation}>{item.city}, {item.state}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {item.averageRating}</Text>
              <Text style={styles.reviews}>({item.totalReviews} reviews)</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.pricingPerHour}/hr</Text>
          </View>
        </View>
        
        <View style={styles.specializations}>
          {item.specializations.slice(0, 2).map((spec, index) => (
            <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
              {spec}
            </Chip>
          ))}
        </View>
        
        <Text style={styles.experience}>{item.experienceYears} years experience</Text>
        
        <Button 
          mode="contained" 
          style={styles.bookButton}
          onPress={() => navigation.navigate('PoojariProfile', { poojari: item })}
        >
          View Profile
        </Button>
      </Card.Content>
    </Card>
  );

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to DivineConnect</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for services (e.g., Ganesh Pooja)"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Quick Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => setFilters(prev => ({ ...prev, city: 'Mumbai' }))}
          >
            <Text style={styles.filterText}>Mumbai</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => setFilters(prev => ({ ...prev, city: 'Delhi' }))}
          >
            <Text style={styles.filterText}>Delhi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => setFilters(prev => ({ ...prev, language: 'Hindi' }))}
          >
            <Text style={styles.filterText}>Hindi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => setFilters(prev => ({ ...prev, minRating: 4.5 }))}
          >
            <Text style={styles.filterText}>Top Rated</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Featured Poojaris */}
      {featuredPoojaris.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Poojaris</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredPoojaris.map((poojari) => (
              <TouchableOpacity 
                key={poojari.id} 
                style={styles.featuredCard}
                onPress={() => navigation.navigate('PoojariProfile', { poojari })}
              >
                <Avatar.Text 
                  size={60} 
                  label={poojari.user.name.charAt(0)} 
                  style={styles.featuredAvatar}
                />
                <Text style={styles.featuredName}>{poojari.user.name}</Text>
                <Text style={styles.featuredRating}>⭐ {poojari.averageRating}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* All Poojaris */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Poojaris</Text>
          <TouchableOpacity onPress={loadAllPoojaris}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={allPoojaris}
          renderItem={renderPoojariCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          refreshing={loading}
          onRefresh={loadAllPoojaris}
        />
      </View>

      {/* My Bookings Button */}
      <View style={styles.bottomActions}>
        <Button 
          mode="outlined" 
          style={styles.myBookingsButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          My Bookings
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterChip: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  featuredCard: {
    alignItems: 'center',
    marginLeft: 20,
    width: 100,
  },
  featuredAvatar: {
    backgroundColor: '#FF6B35',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featuredRating: {
    fontSize: 11,
    color: '#666',
  },
  poojariCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  poojariHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: '#FF6B35',
    marginRight: 15,
  },
  poojariInfo: {
    flex: 1,
  },
  poojariName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poojariLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  chipText: {
    fontSize: 12,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  bookButton: {
    backgroundColor: '#FF6B35',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  myBookingsButton: {
    borderColor: '#FF6B35',
  },
});

export default HomeScreen;
