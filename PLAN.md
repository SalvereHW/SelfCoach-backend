# SelfCoach Backend Implementation Plan

## Overview
This document outlines the comprehensive backend implementation plan to support the SelfCoach mobile app features. The mobile app is built with Flutter using Descope for authentication and requires extensive backend APIs for health tracking, reminders, and wellness sessions.

## Current Backend Status
- ✅ Basic NestJS setup with TypeORM and MySQL
- ✅ Simple User entity (firstName, lastName, email, age)
- ✅ Generic HealthMetric entity (too basic for requirements)
- ✅ Descope integration dependency installed but not implemented
- ❌ No authentication middleware or guards active
- ❌ Missing specific health metric entities
- ❌ No reminder system
- ❌ No wellness session management

## Phase 1: Core Infrastructure (High Priority) ✅ COMPLETED

### 1. User Profile Enhancement
**Status:** ✅ Completed
**Files to modify:**
- `src/user/entities/user.entity.ts`
- `src/user/user.service.ts`
- `src/user/user.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.guard.ts`

**Requirements:**
- Add Descope integration fields to User entity:
  - `descopeUserId: string` (external ID from Descope)
  - `dateOfBirth: Date`
  - `gender: string`
  - `height: number` (in cm)
  - `weight: number` (in kg)
  - `healthConditions: HealthCondition[]` (enum array)
  - `culturalDietPreferences: CulturalDiet[]` (enum array)
  - `activityLevel: ActivityLevel` (enum)
  - `allergies: string[]`
  - `preferences: JSON` (flexible key-value store)
  - `createdAt/updatedAt: Date`

**API Endpoints:**
```
POST /api/users/profile - Create/update user profile from Descope data
GET /api/users/profile - Get user profile details
PUT /api/users/profile - Update user profile
DELETE /api/users/profile - Delete user account
```

### 2. Authentication System
**Status:** ✅ Completed
**Requirements:**
- Implement Descope JWT validation middleware
- Create authentication guards for protected routes
- User session management with Descope integration
- Role-based access control (user vs admin)

### 3. Health Metrics System Overhaul
**Status:** ✅ Completed
**Files to create:**
- `src/health/entities/sleep-metric.entity.ts`
- `src/health/entities/nutrition-metric.entity.ts`
- `src/health/entities/activity-metric.entity.ts`
- `src/health/entities/daily-summary.entity.ts`
- `src/health/sleep/sleep.controller.ts`
- `src/health/nutrition/nutrition.controller.ts`
- `src/health/activity/activity.controller.ts`
- `src/health/daily-summary/daily-summary.controller.ts`

#### Sleep Metrics Entity
**Fields:** `date, bedTime, wakeTime, duration, quality, deepSleepMinutes, remSleepMinutes, awakeDuringNight, notes, userId`

**API Endpoints:**
```
POST /api/health/sleep - Record sleep data
GET /api/health/sleep - Get sleep history (with date filtering)
PUT /api/health/sleep/:id - Update sleep record
DELETE /api/health/sleep/:id - Delete sleep record
GET /api/health/sleep/stats - Get sleep statistics (weekly averages, etc.)
```

#### Nutrition Metrics Entity
**Fields:** `date, mealType, foodName, servingSize, servingUnit, calories, protein, carbs, fats, fiber, sugar, sodium, waterIntake, notes, userId`

**API Endpoints:**
```
POST /api/health/nutrition - Log food/meal
GET /api/health/nutrition - Get nutrition history
PUT /api/health/nutrition/:id - Update nutrition entry
DELETE /api/health/nutrition/:id - Delete nutrition entry
GET /api/health/nutrition/daily/:date - Get daily nutrition summary
```

#### Activity Metrics Entity
**Fields:** `date, activityType, activityName, duration, intensity, caloriesBurned, distance, distanceUnit, steps, averageHeartRate, heartRateMax, notes, userId`

**API Endpoints:**
```
POST /api/health/activity - Log physical activity
GET /api/health/activity - Get activity history
PUT /api/health/activity/:id - Update activity
DELETE /api/health/activity/:id - Delete activity
GET /api/health/activity/stats - Get activity statistics
```

#### Daily Health Summary Entity
**Fields:** `date, mood, stressLevel, energyLevel, symptoms, bloodPressureSystolic, bloodPressureDiastolic, weight, notes, userId`

**API Endpoints:**
```
POST /api/health/daily-summary - Create/update daily health summary
GET /api/health/daily-summary/:date - Get summary for specific date
GET /api/health/daily-summary - Get recent summaries
```

## Phase 2: Smart Features (Medium Priority)

### 4. Reminder System
**Status:** Pending
**Files to create:**
- `src/reminders/entities/reminder.entity.ts`
- `src/reminders/entities/reminder-action.entity.ts`
- `src/reminders/reminders.controller.ts`
- `src/reminders/reminders.service.ts`
- `src/reminders/reminders.module.ts`

**Reminder Entity Fields:** `title, description, type, scheduledTime, frequency, status, isEnabled, weekdays, endDate, customData, userId, createdAt, updatedAt`

**ReminderAction Entity Fields:** `reminderId, actionTime, actionType, note, userId`

**API Endpoints:**
```
POST /api/reminders - Create reminder
GET /api/reminders - Get user's reminders
PUT /api/reminders/:id - Update reminder
DELETE /api/reminders/:id - Delete reminder
POST /api/reminders/:id/complete - Mark reminder as completed
POST /api/reminders/:id/dismiss - Dismiss reminder
POST /api/reminders/:id/snooze - Snooze reminder
GET /api/reminders/upcoming - Get upcoming reminders
GET /api/reminders/stats - Get reminder statistics
```

### 5. Wellness Sessions & Content Management
**Status:** Pending
**Files to create:**
- `src/wellness/entities/wellness-session.entity.ts`
- `src/wellness/entities/session-progress.entity.ts`
- `src/wellness/wellness.controller.ts`
- `src/wellness/wellness.service.ts`
- `src/wellness/wellness.module.ts`

**WellnessSession Entity Fields:** `title, description, type, duration, difficulty, audioUrl, videoUrl, imageUrl, instructions, benefits, metadata, isPremium, tags, createdAt, updatedAt`

**SessionProgress Entity Fields:** `sessionId, userId, status, progressTime, startedAt, completedAt, pausedAt, rating, feedback, sessionData, createdAt, updatedAt`

**API Endpoints:**
```
GET /api/wellness/sessions - Get available wellness sessions
GET /api/wellness/sessions/:id - Get session details
POST /api/wellness/sessions/:id/start - Start a session
PUT /api/wellness/sessions/:id/progress - Update session progress
POST /api/wellness/sessions/:id/complete - Complete session
GET /api/wellness/sessions/user-progress - Get user's session history
```

## Phase 3: Analytics & Insights (Lower Priority)

### 6. Data Aggregation & Dashboard APIs
**Status:** Pending
**Files to create:**
- `src/analytics/analytics.controller.ts`
- `src/analytics/analytics.service.ts`
- `src/analytics/analytics.module.ts`

**API Endpoints:**
```
GET /api/health/dashboard - Get dashboard summary data
GET /api/health/trends - Get health trends and analytics
POST /api/health/sync - Bulk sync health data
GET /api/health/export - Export user health data
```

## Technical Requirements

### Database Schema Updates
- [ ] Create migration scripts for new entities
- [ ] Add proper indexes on userId and date fields for performance
- [ ] Implement JSON columns for flexible metadata storage
- [ ] Set up proper foreign key relationships

### Data Validation
- [ ] Create comprehensive DTOs for all health data inputs
- [ ] Implement enum validation for health conditions, diet preferences, etc.
- [ ] Add date range validation for health metrics
- [ ] Input sanitization and security validation

### API Features
- [ ] Implement pagination for list endpoints
- [ ] Add date range filtering for health data queries
- [ ] Support bulk operations for data synchronization
- [ ] File upload support for wellness session media content

### External Integrations
- [ ] Media storage service (AWS S3 or similar) for wellness content
- [ ] Push notification service for reminder alerts
- [ ] Backup/sync service for offline-first mobile app support

## Mobile App Integration Points

The mobile app currently expects but doesn't have backend support for:
- User profile management with extended health information
- Sleep, nutrition, and activity tracking APIs
- Smart reminder system with scheduling
- Wellness session content and progress tracking
- Dashboard data aggregation and health insights

## Dependencies to Install

```bash
# Additional packages that may be needed
npm install --save @nestjs/schedule  # For reminder scheduling
npm install --save @nestjs/bull      # For background job processing
npm install --save aws-sdk           # For media file storage
npm install --save node-cron         # For scheduled tasks
```

## Environment Variables Required

```env
# Descope Configuration
DESCOPE_PROJECT_ID=your_descope_project_id
DESCOPE_MANAGEMENT_KEY=your_descope_management_key

# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=selfcoach_db

# Media Storage
AWS_S3_BUCKET_NAME=selfcoach-media
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Push Notifications
FIREBASE_SERVER_KEY=your_firebase_key
```

## Success Criteria

- [ ] Mobile app can successfully authenticate users via Descope
- [ ] All health tracking features (sleep, nutrition, activity) work end-to-end
- [ ] Reminder system creates and manages notifications
- [ ] Wellness sessions can be started, paused, and completed
- [ ] Dashboard displays aggregated health data from backend APIs
- [ ] All APIs handle errors gracefully and return appropriate HTTP status codes
- [ ] Data validation prevents invalid or malicious input
- [ ] Performance is acceptable for expected user load

---

## Implementation Status Update

### ✅ PHASE 1 COMPLETED - Core Infrastructure
**Completed on:** July 12, 2025

#### **New API Endpoints Implemented:**

**User Profile Management:**
- `POST /api/users/profile` - Create user profile
- `GET /api/users/profile/:descopeUserId` - Get user profile
- `PUT /api/users/profile/:descopeUserId` - Update user profile
- `DELETE /api/users/profile/:descopeUserId` - Delete user profile

**Sleep Metrics:**
- `POST /api/health/sleep` - Log sleep data
- `GET /api/health/sleep` - Get sleep history
- `GET /api/health/sleep/stats` - Get sleep statistics
- `GET /api/health/sleep/:id` - Get specific sleep record
- `PATCH /api/health/sleep/:id` - Update sleep record
- `DELETE /api/health/sleep/:id` - Delete sleep record

**Nutrition Metrics:**
- `POST /api/health/nutrition` - Log nutrition data
- `GET /api/health/nutrition` - Get nutrition history
- `GET /api/health/nutrition/daily/:date` - Get daily nutrition summary
- `GET /api/health/nutrition/stats` - Get nutrition statistics
- `GET /api/health/nutrition/:id` - Get specific nutrition record
- `PATCH /api/health/nutrition/:id` - Update nutrition record
- `DELETE /api/health/nutrition/:id` - Delete nutrition record

**Activity Metrics:**
- `POST /api/health/activity` - Log activity data
- `GET /api/health/activity` - Get activity history
- `GET /api/health/activity/stats` - Get activity statistics
- `GET /api/health/activity/:id` - Get specific activity record
- `PATCH /api/health/activity/:id` - Update activity record
- `DELETE /api/health/activity/:id` - Delete activity record

**Daily Health Summary:**
- `POST /api/health/daily-summary` - Create daily summary
- `POST /api/health/daily-summary/upsert` - Create or update daily summary
- `GET /api/health/daily-summary` - Get recent summaries
- `GET /api/health/daily-summary/date/:date` - Get summary for specific date
- `GET /api/health/daily-summary/stats` - Get wellness statistics
- `GET /api/health/daily-summary/:id` - Get specific summary
- `PATCH /api/health/daily-summary/:id` - Update summary
- `DELETE /api/health/daily-summary/:id` - Delete summary

#### **Database Entities Created:**
- ✅ Extended User entity with health profile fields
- ✅ SleepMetric entity with quality tracking and analytics
- ✅ NutritionMetric entity with macro/micro nutrient tracking
- ✅ ActivityMetric entity with comprehensive exercise tracking
- ✅ DailySummary entity with mood, stress, and wellness scoring

#### **Authentication System:**
- ✅ Descope JWT token validation
- ✅ Protected routes with AuthGuard
- ✅ User context injection in controllers
- ✅ Proper error handling for authentication

#### **Features Implemented:**
- **Sleep Tracking:** Quality scoring, sleep efficiency calculation, statistics
- **Nutrition Tracking:** Macro breakdown, daily summaries, meal type categorization
- **Activity Tracking:** Intensity scoring, pace calculation, weekly progress
- **Daily Wellness:** Mood/stress/energy tracking, symptom logging, wellness scoring
- **Statistics & Analytics:** Comprehensive reporting for all health metrics

---

**Last Updated:** July 12, 2025
**Status:** Phase 1 Complete - Ready for Mobile App Integration

**Next Steps:** Phase 2 implementation (Reminders, Wellness Sessions) or mobile app testing