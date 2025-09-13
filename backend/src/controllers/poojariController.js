const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { PoojariProfile, User, Review, Booking } = require('../models');

// @desc    Get all poojaris with filters
// @route   GET /api/v1/poojaris
// @access  Public
const getAllPoojaris = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      city,
      state,
      language,
      minRating = 0,
      maxPrice,
      specialization,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockPoojaris = [
        {
          id: 1,
          userId: 1,
          bio: 'Experienced Poojari with 15+ years in traditional ceremonies',
          experienceYears: 15,
          languages: ['Hindi', 'Sanskrit', 'English'],
          specializations: ['Ganesh Pooja', 'Satyanarayan Katha', 'Wedding Ceremonies'],
          pricingPerHour: 1500,
          pricingPerService: 2500,
          averageRating: 4.8,
          totalReviews: 127,
          city: 'Mumbai',
          state: 'Maharashtra',
          isActive: true,
          user: {
            id: 1,
            name: 'Pandit Rajesh Sharma',
            phone: '+919876543210',
            profileImage: null
          }
        },
        {
          id: 2,
          userId: 2,
          bio: 'Traditional Vedic scholar specializing in home ceremonies',
          experienceYears: 12,
          languages: ['Hindi', 'Marathi', 'Sanskrit'],
          specializations: ['Griha Pravesh', 'Navratri Pooja', 'Karva Chauth'],
          pricingPerHour: 1200,
          pricingPerService: 2000,
          averageRating: 4.6,
          totalReviews: 89,
          city: 'Pune',
          state: 'Maharashtra',
          isActive: true,
          user: {
            id: 2,
            name: 'Pandit Suresh Joshi',
            phone: '+919876543211',
            profileImage: null
          }
        },
        {
          id: 3,
          userId: 3,
          bio: 'Young and energetic Poojari with modern approach to traditional rituals',
          experienceYears: 8,
          languages: ['Hindi', 'English', 'Gujarati'],
          specializations: ['Corporate Pooja', 'Festival Celebrations', 'Diwali Ceremonies'],
          pricingPerHour: 1000,
          pricingPerService: 1800,
          averageRating: 4.7,
          totalReviews: 56,
          city: 'Delhi',
          state: 'Delhi',
          isActive: true,
          user: {
            id: 3,
            name: 'Pandit Amit Gupta',
            phone: '+919876543212',
            profileImage: null
          }
        }
      ];

      // Apply filters to mock data
      let filteredPoojaris = mockPoojaris.filter(p => {
        if (city && p.city.toLowerCase() !== city.toLowerCase()) return false;
        if (state && p.state.toLowerCase() !== state.toLowerCase()) return false;
        if (language && !p.languages.some(l => l.toLowerCase().includes(language.toLowerCase()))) return false;
        if (minRating && p.averageRating < parseFloat(minRating)) return false;
        if (maxPrice && p.pricingPerHour > parseFloat(maxPrice)) return false;
        if (specialization && !p.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))) return false;
        return true;
      });

      // Apply sorting
      if (sortBy === 'rating') {
        filteredPoojaris.sort((a, b) => sortOrder === 'desc' ? b.averageRating - a.averageRating : a.averageRating - b.averageRating);
      } else if (sortBy === 'price') {
        filteredPoojaris.sort((a, b) => sortOrder === 'desc' ? b.pricingPerHour - a.pricingPerHour : a.pricingPerHour - b.pricingPerHour);
      } else if (sortBy === 'experience') {
        filteredPoojaris.sort((a, b) => sortOrder === 'desc' ? b.experienceYears - a.experienceYears : a.experienceYears - b.experienceYears);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedPoojaris = filteredPoojaris.slice(startIndex, startIndex + parseInt(limit));

      return res.json({
        success: true,
        data: {
          poojaris: paginatedPoojaris,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredPoojaris.length / limit),
            totalItems: filteredPoojaris.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    }

    // Production code with real database
    const userWhere = {
      role: 'poojari',
      is_active: true
    };

    if (city) userWhere.city = { [Op.iLike]: `%${city}%` };
    if (state) userWhere.state = { [Op.iLike]: `%${state}%` };

    const profileWhere = {
      is_verified: true,
      is_available: true,
      rating: { [Op.gte]: minRating }
    };

    if (maxPrice) {
      profileWhere[Op.or] = [
        { pricing_per_hour: { [Op.lte]: maxPrice } },
        { pricing_per_service: { [Op.lte]: maxPrice } }
      ];
    }

    if (language) {
      profileWhere.languages = { [Op.contains]: [language] };
    }

    if (specialization) {
      profileWhere.specializations = { [Op.contains]: [specialization] };
    }

    // Build order clause
    let order = [];
    if (sortBy === 'rating') {
      order = [['poojariProfile', 'rating', sortOrder.toUpperCase()]];
    } else if (sortBy === 'price') {
      order = [['poojariProfile', 'pricing_per_hour', sortOrder.toUpperCase()]];
    } else if (sortBy === 'experience') {
      order = [['poojariProfile', 'experience_years', sortOrder.toUpperCase()]];
    }

    const { count, rows } = await User.findAndCountAll({
      where: userWhere,
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile',
        where: profileWhere,
        required: true
      }],
      order,
      limit: parseInt(limit),
      offset,
      attributes: ['id', 'name', 'profile_image', 'city', 'state']
    });

    res.json({
      success: true,
      data: {
        poojaris: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get poojaris error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching poojaris'
    });
  }
};

// @desc    Get featured poojaris
// @route   GET /api/v1/poojaris/featured
// @access  Public
const getFeaturedPoojaris = async (req, res) => {
  try {
    // In development, return mock featured poojaris
    if (process.env.NODE_ENV === 'development') {
      const featuredPoojaris = [
        {
          id: 1,
          userId: 1,
          bio: 'Experienced Poojari with 15+ years in traditional ceremonies',
          experienceYears: 15,
          languages: ['Hindi', 'Sanskrit', 'English'],
          specializations: ['Ganesh Pooja', 'Satyanarayan Katha', 'Wedding Ceremonies'],
          pricingPerHour: 1500,
          pricingPerService: 2500,
          averageRating: 4.8,
          totalReviews: 127,
          city: 'Mumbai',
          state: 'Maharashtra',
          isActive: true,
          isFeatured: true,
          user: {
            id: 1,
            name: 'Pandit Rajesh Sharma',
            phone: '+919876543210',
            profileImage: null
          }
        },
        {
          id: 3,
          userId: 3,
          bio: 'Young and energetic Poojari with modern approach to traditional rituals',
          experienceYears: 8,
          languages: ['Hindi', 'English', 'Gujarati'],
          specializations: ['Corporate Pooja', 'Festival Celebrations', 'Diwali Ceremonies'],
          pricingPerHour: 1000,
          pricingPerService: 1800,
          averageRating: 4.7,
          totalReviews: 56,
          city: 'Delhi',
          state: 'Delhi',
          isActive: true,
          isFeatured: true,
          user: {
            id: 3,
            name: 'Pandit Amit Gupta',
            phone: '+919876543212',
            profileImage: null
          }
        }
      ];

      return res.json({
        success: true,
        data: { poojaris: featuredPoojaris }
      });
    }

    // Production code
    const poojaris = await PoojariProfile.findAll({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'profileImage']
        }
      ],
      order: [['averageRating', 'DESC']],
      limit: 6
    });

    res.json({
      success: true,
      data: { poojaris }
    });

  } catch (error) {
    console.error('Get featured poojaris error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get poojari profile by ID
// @route   GET /api/v1/poojaris/:id
// @access  Public
const getPoojariById = async (req, res) => {
  try {
    const { id } = req.params;

    const poojari = await User.findOne({
      where: {
        id,
        role: 'poojari',
        is_active: true
      },
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile',
        required: true
      }],
      attributes: { exclude: ['firebase_uid'] }
    });

    if (!poojari) {
      return res.status(404).json({
        success: false,
        message: 'Poojari not found'
      });
    }

    res.json({
      success: true,
      data: {
        poojari
      }
    });
  } catch (error) {
    console.error('Get poojari by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching poojari'
    });
  }
};

// @desc    Get poojari availability
// @route   GET /api/v1/poojaris/:id/availability
// @access  Public
const getAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { date, month, year } = req.query;

    const poojari = await User.findOne({
      where: {
        id,
        role: 'poojari'
      },
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile',
        required: true
      }]
    });

    if (!poojari) {
      return res.status(404).json({
        success: false,
        message: 'Poojari not found'
      });
    }

    // Get existing bookings for the requested period
    let bookingWhere = {
      poojari_id: id,
      status: { [Op.in]: ['confirmed', 'in_progress'] }
    };

    if (date) {
      bookingWhere.scheduled_date = date;
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      bookingWhere.scheduled_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const existingBookings = await Booking.findAll({
      where: bookingWhere,
      attributes: ['scheduled_date', 'scheduled_time', 'duration_hours']
    });

    res.json({
      success: true,
      data: {
        schedule: poojari.poojariProfile.availability_schedule,
        blockedDates: poojari.poojariProfile.blocked_dates,
        existingBookings
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability'
    });
  }
};

// @desc    Update poojari profile
// @route   PUT /api/v1/poojaris/profile
// @access  Private (Poojari only)
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      bio,
      experienceYears,
      languages,
      specializations,
      pricingPerHour,
      pricingPerService
    } = req.body;

    const poojariProfile = await PoojariProfile.findOne({
      where: { user_id: userId }
    });

    if (!poojariProfile) {
      return res.status(404).json({
        success: false,
        message: 'Poojari profile not found'
      });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (experienceYears !== undefined) updateData.experience_years = experienceYears;
    if (languages !== undefined) updateData.languages = languages;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (pricingPerHour !== undefined) updateData.pricing_per_hour = pricingPerHour;
    if (pricingPerService !== undefined) updateData.pricing_per_service = pricingPerService;

    await poojariProfile.update(updateData);

    const updatedProfile = await User.findByPk(userId, {
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile'
      }]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        poojari: updatedProfile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Update poojari availability
// @route   PUT /api/v1/poojaris/availability
// @access  Private (Poojari only)
const updateAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { schedule, blockedDates } = req.body;

    const poojariProfile = await PoojariProfile.findOne({
      where: { user_id: userId }
    });

    if (!poojariProfile) {
      return res.status(404).json({
        success: false,
        message: 'Poojari profile not found'
      });
    }

    const updateData = {};
    if (schedule) updateData.availability_schedule = schedule;
    if (blockedDates) updateData.blocked_dates = blockedDates;

    await poojariProfile.update(updateData);

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        schedule: poojariProfile.availability_schedule,
        blockedDates: poojariProfile.blocked_dates
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
};

// @desc    Upload video introduction
// @route   POST /api/v1/poojaris/upload-video
// @access  Private (Poojari only)
const uploadVideo = async (req, res) => {
  try {
    // This would typically handle file upload using multer
    // For now, we'll just return a placeholder response
    res.json({
      success: true,
      message: 'Video upload endpoint - implementation pending',
      data: {
        videoUrl: 'https://example.com/video.mp4'
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading video'
    });
  }
};

// @desc    Get poojari reviews
// @route   GET /api/v1/poojaris/:id/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { poojari_id: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_image']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        reviews: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

module.exports = {
  getAllPoojaris,
  getFeaturedPoojaris,
  getPoojariById,
  getAvailability,
  updateProfile,
  updateAvailability,
  uploadVideo,
  getReviews
};
