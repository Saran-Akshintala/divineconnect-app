import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, Searchbar, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { fetchFeaturedPoojaris } from '../../store/slices/poojariSlice';
import { theme } from '../../theme';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { featured, featuredLoading } = useSelector(state => state.poojaris);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchFeaturedPoojaris());
  }, [dispatch]);

  const services = [
    { id: 1, name: 'Ganesh Pooja', icon: 'temple-hindu', color: '#FF6B35' },
    { id: 2, name: 'Satyanarayan Pooja', icon: 'auto-awesome', color: '#4CAF50' },
    { id: 3, name: 'Griha Pravesh', icon: 'home', color: '#2196F3' },
    { id: 4, name: 'Wedding Ceremony', icon: 'favorite', color: '#E91E63' },
    { id: 5, name: 'Havan', icon: 'local-fire-department', color: '#FF9800' },
    { id: 6, name: 'Pitra Paksha', icon: 'family-restroom', color: '#9C27B0' },
  ];

  const renderServiceCard = ({ item }) => (
    <Card style={styles.serviceCard} onPress={() => navigation.navigate('Search')}>
      <Card.Content style={styles.serviceContent}>
        <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={styles.serviceName}>{item.name}</Text>
      </Card.Content>
    </Card>
  );

  const renderPoojariCard = ({ item }) => (
    <Card 
      style={styles.poojariCard} 
      onPress={() => navigation.navigate('PoojariProfile', { poojariId: item.id })}
    >
      <Card.Content style={styles.poojariContent}>
        <Avatar.Image 
          size={60} 
          source={{ uri: item.profile_image || 'https://via.placeholder.com/60' }} 
        />
        <View style={styles.poojariInfo}>
          <Text style={styles.poojariName}>{item.name}</Text>
          <Text style={styles.poojariLocation}>{item.city}, {item.state}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>
              {item.poojariProfile?.rating || 0} ({item.poojariProfile?.total_reviews || 0})
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.poojariProfile?.pricing_per_hour || 0}/hr</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Namaste, {user?.name?.split(' ')[0] || 'Devotee'}!
        </Text>
        <Text style={styles.subGreeting}>Find your perfect spiritual guide</Text>
      </View>

      <Searchbar
        placeholder="Search for services or Poojaris"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        onSubmitEditing={() => navigation.navigate('Search', { query: searchQuery })}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Services</Text>
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.servicesGrid}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Poojaris</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Search')}
            compact
          >
            View All
          </Button>
        </View>
        
        {featuredLoading ? (
          <Text style={styles.loadingText}>Loading featured Poojaris...</Text>
        ) : (
          <FlatList
            data={featured.slice(0, 5)}
            renderItem={renderPoojariCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poojarisList}
          />
        )}
      </View>

      <Card style={styles.promoCard}>
        <Card.Content>
          <Text style={styles.promoTitle}>🕉️ Special Offer</Text>
          <Text style={styles.promoText}>
            Get 20% off on your first booking with verified Poojaris
          </Text>
          <Button 
            mode="contained" 
            style={styles.promoButton}
            onPress={() => navigation.navigate('Search')}
          >
            Book Now
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginTop: theme.spacing.xs,
  },
  searchBar: {
    margin: theme.spacing.md,
    elevation: 2,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  servicesGrid: {
    paddingTop: theme.spacing.sm,
  },
  serviceCard: {
    flex: 1,
    margin: theme.spacing.xs,
    elevation: 2,
  },
  serviceContent: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.text,
  },
  poojarisList: {
    paddingLeft: theme.spacing.md,
  },
  poojariCard: {
    width: 280,
    marginRight: theme.spacing.md,
    elevation: 2,
  },
  poojariContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poojariInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  poojariName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  poojariLocation: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  rating: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    padding: theme.spacing.lg,
  },
  promoCard: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.spiritual.peace,
    elevation: 4,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  promoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  promoButton: {
    alignSelf: 'flex-start',
  },
});

export default HomeScreen;
