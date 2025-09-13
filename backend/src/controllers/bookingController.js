const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, PoojariProfile, Booking, Transaction, Review } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
const createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      poojariId,
      serviceType,
      serviceDescription,
      scheduledDate,
      scheduledTime,
      durationHours,
      amount,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      specialRequirements,
      materialsRequired,
      materialsProvidedBy,
      contactPhone,
      alternatePhone,
      bookingNotes
    } = req.body;

    // Verify poojari exists and is available
    const poojari = await User.findOne({
      where: {
        id: poojariId,
        role: 'poojari',
        is_active: true
      },
      include: [{
        model: PoojariProfile,
        as: 'poojariProfile',
        where: {
          is_available: true,
          is_verified: true
        }
      }]
    });

    if (!poojari) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poojari not found or not available'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        poojari_id: poojariId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: { [Op.in]: ['pending', 'confirmed', 'in_progress'] }
      }
    });

    if (conflictingBooking) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Poojari is not available at the selected time'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user_id: userId,
      poojari_id: poojariId,
      service_type: serviceType,
      service_description: serviceDescription,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_hours: durationHours,
      amount,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      special_requirements: specialRequirements,
      materials_required: materialsRequired || [],
      materials_provided_by: materialsProvidedBy || 'devotee',
      contact_phone: contactPhone,
      alternate_phone: alternatePhone,
      booking_notes: bookingNotes
    }, { transaction });

    // Create initial transaction record
    await Transaction.create({
      booking_id: booking.id,
      amount,
      currency: 'INR',
      provider: 'razorpay',
      status: 'pending'
    }, { transaction });

    await transaction.commit();

    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name', 'phone', 'profile_image'],
          include: [{
            model: PoojariProfile,
            as: 'poojariProfile',
            attributes: ['rating', 'total_reviews']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: bookingWithDetails
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
const getUserBookings = async (req, res) => {
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
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { user_id: userId },
        { poojari_id: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'profile_image']
        },
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name', 'phone', 'profile_image'],
          include: [{
            model: PoojariProfile,
            as: 'poojariProfile',
            attributes: ['rating', 'total_reviews']
          }]
        }
      ],
      order: [['scheduled_date', 'DESC'], ['scheduled_time', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        bookings: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get booking details
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { poojari_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'profile_image', 'address', 'city', 'state']
        },
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name', 'phone', 'profile_image'],
          include: [{
            model: PoojariProfile,
            as: 'poojariProfile'
          }]
        },
        {
          model: Transaction,
          as: 'transactions'
        },
        {
          model: Review,
          as: 'review'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
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
    const { status, notes } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { poojari_id: userId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    const updateData = { status };
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    if (notes) {
      if (userId === booking.poojari_id) {
        updateData.poojari_notes = notes;
      }
    }

    await booking.update(updateData);

    // Update poojari profile stats if booking is completed
    if (status === 'completed') {
      await PoojariProfile.increment('total_bookings', {
        where: { user_id: booking.poojari_id }
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
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
    const { reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { poojari_id: userId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    const cancelledBy = userId === booking.user_id ? 'user' : 'poojari';

    await booking.update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: cancelledBy,
      cancelled_at: new Date()
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
};

// @desc    Get poojari dashboard data
// @route   GET /api/v1/bookings/poojari/dashboard
// @access  Private (Poojari only)
const getPoojariDashboard = async (req, res) => {
  try {
    const poojariId = req.user.id;

    // Get booking statistics
    const totalBookings = await Booking.count({
      where: { poojari_id: poojariId }
    });

    const completedBookings = await Booking.count({
      where: { 
        poojari_id: poojariId,
        status: 'completed'
      }
    });

    const pendingBookings = await Booking.count({
      where: { 
        poojari_id: poojariId,
        status: 'pending'
      }
    });

    const upcomingBookings = await Booking.findAll({
      where: {
        poojari_id: poojariId,
        status: { [Op.in]: ['confirmed', 'in_progress'] },
        scheduled_date: { [Op.gte]: new Date() }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'phone', 'profile_image']
      }],
      order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
      limit: 5
    });

    // Calculate earnings
    const earnings = await Transaction.sum('net_amount', {
      include: [{
        model: Booking,
        as: 'booking',
        where: { 
          poojari_id: poojariId,
          status: 'completed'
        }
      }],
      where: { status: 'completed' }
    }) || 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalBookings,
          completedBookings,
          pendingBookings,
          totalEarnings: earnings
        },
        upcomingBookings
      }
    });
  } catch (error) {
    console.error('Get poojari dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getPoojariDashboard
};
