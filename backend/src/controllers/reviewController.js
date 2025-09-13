const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, PoojariProfile, Booking, Review } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Create new review
// @route   POST /api/v1/reviews
// @access  Private
const createReview = async (req, res) => {
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
      bookingId,
      rating,
      comment,
      serviceQuality,
      punctuality,
      communication,
      wouldRecommend = true
    } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        user_id: userId,
        status: 'completed'
      }
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not completed'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        booking_id: bookingId,
        user_id: userId
      }
    });

    if (existingReview) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const review = await Review.create({
      user_id: userId,
      poojari_id: booking.poojari_id,
      booking_id: bookingId,
      rating,
      comment,
      service_quality: serviceQuality,
      punctuality,
      communication,
      would_recommend: wouldRecommend,
      is_verified: true
    }, { transaction });

    // Update poojari profile rating
    const poojariProfile = await PoojariProfile.findOne({
      where: { user_id: booking.poojari_id }
    });

    if (poojariProfile) {
      const totalReviews = poojariProfile.total_reviews + 1;
      const currentRatingSum = poojariProfile.rating * poojariProfile.total_reviews;
      const newRating = (currentRatingSum + rating) / totalReviews;

      await poojariProfile.update({
        rating: parseFloat(newRating.toFixed(2)),
        total_reviews: totalReviews
      }, { transaction });
    }

    await transaction.commit();

    const reviewWithDetails = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        },
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: reviewWithDetails
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
};

// @desc    Get review by ID
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        },
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'service_type', 'scheduled_date']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review'
    });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
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

    const { id } = req.params;
    const userId = req.user.id;
    const {
      rating,
      comment,
      serviceQuality,
      punctuality,
      communication,
      wouldRecommend
    } = req.body;

    const review = await Review.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const oldRating = review.rating;
    const updateData = {};
    
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (serviceQuality !== undefined) updateData.service_quality = serviceQuality;
    if (punctuality !== undefined) updateData.punctuality = punctuality;
    if (communication !== undefined) updateData.communication = communication;
    if (wouldRecommend !== undefined) updateData.would_recommend = wouldRecommend;

    await review.update(updateData, { transaction });

    // Update poojari profile rating if rating changed
    if (rating !== undefined && rating !== oldRating) {
      const poojariProfile = await PoojariProfile.findOne({
        where: { user_id: review.poojari_id }
      });

      if (poojariProfile && poojariProfile.total_reviews > 0) {
        const currentRatingSum = poojariProfile.rating * poojariProfile.total_reviews;
        const newRatingSum = currentRatingSum - oldRating + rating;
        const newRating = newRatingSum / poojariProfile.total_reviews;

        await poojariProfile.update({
          rating: parseFloat(newRating.toFixed(2))
        }, { transaction });
      }
    }

    await transaction.commit();

    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        },
        {
          model: User,
          as: 'poojari',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const reviewRating = review.rating;
    const poojariId = review.poojari_id;

    await review.destroy({ transaction });

    // Update poojari profile rating
    const poojariProfile = await PoojariProfile.findOne({
      where: { user_id: poojariId }
    });

    if (poojariProfile && poojariProfile.total_reviews > 1) {
      const currentRatingSum = poojariProfile.rating * poojariProfile.total_reviews;
      const newRatingSum = currentRatingSum - reviewRating;
      const newTotalReviews = poojariProfile.total_reviews - 1;
      const newRating = newRatingSum / newTotalReviews;

      await poojariProfile.update({
        rating: parseFloat(newRating.toFixed(2)),
        total_reviews: newTotalReviews
      }, { transaction });
    } else if (poojariProfile && poojariProfile.total_reviews === 1) {
      await poojariProfile.update({
        rating: 0.00,
        total_reviews: 0
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

module.exports = {
  createReview,
  getReviewById,
  updateReview,
  deleteReview
};
