# Weekly Planner 📅

**Your Productivity Companion** - Plan your week, achieve your goals, build lasting habits!

A modern web application designed to help you organize your tasks, track habits, and reflect on your progress. Weekly Planner combines task management, habit tracking, and progress analytics in a beautiful, intuitive interface.

---

## Application Flow (Start to End)

### 🏠 **1. Landing Page**
- **First Experience**: Users land on a beautiful, gradient-designed home page
- **Features Showcase**: Four key sections highlighting:
  - Task Management
  - Habit Tracking
  - Progress Overview
  - Weekly Reflections
- **Navigation**:
  - Sign In button (for existing users)
  - Get Started CTA (for new users)
  - Dark/Light mode toggle
- **Tagline**: "Stay Focused!" motivational message
- **Learn More**: Motivational section encouraging users to start their productivity journey

### 🔐 **2. Authentication**

#### Sign Up (Register)
- **Fields Required**:
  - Name (used as username in profile)
  - Email
  - Password (minimum 6 characters)
  - Confirm Password (validation to match)
- **Validation**: Form validates all fields, password strength, and password matching
- **Back to Home**: Back arrow button to return to landing page
- **Success**: Account created, user automatically logged in and redirected to dashboard
- **Error Handling**: Clear toast notifications for validation failures

#### Sign In (Login)
- **Fields**:
  - Email
  - Password
- **Error Handling**: Provides clear error messages for invalid credentials
- **Back to Home**: Back arrow button for easy navigation
- **Session Management**: Maintains user session across page refreshes
- **Forgot Password**: Users can reset credentials through Supabase

### 📊 **3. Dashboard (Main Application)**
The core of the Weekly Planner with dual view modes.

#### Header/Navigation Bar
- **Sticky Position**: Remains at top while scrolling down
- **Transparency on Scroll**: Gradually becomes transparent as you scroll (70-100% opacity)
- **Glassmorphism**: Backdrop blur effect for modern look
- **Elements**:
  - Current Month & Date display (top-left)
  - Dark/Light mode toggle button
  - **Motivational Quotes** (Auto-rotating every 4 seconds with fade animation):
    - 20+ powerful quotes in English and Hindi
    - Brush script font styling (Allura font)
    - Includes action-oriented messages:
      - "Plan it. Do it. Own it. 💪"
      - "Turn pain into power. ⚡"
      - "Focus. Execute. Repeat. 🎯"
      - "खुद को साबित करो। 👊" (Hindi: Prove yourself)
      - "हार मत मानो।🀄" (Hindi: Don't give up)
      - "मेहनत कभी धोखा नहीं देती।⚓" (Hindi: Hard work never betrays)
      - And 14 more motivational quotes
  - Habits Completed counter (center-right)
  - Profile button
  - Logout button

#### Profile Modal
- **Accessible via Profile button** in header
- **User Information**:
  - User's name (provided during signup)
  - Email address
  - Member Since date (formatted as "Month D, Year")
  - Profile avatar with circular design and icon
- **Actions**: Close button (X icon) to dismiss modal
- **Styling**: Dark mode compatible with smooth transitions

---

### 📅 **4. Weekly View** (Default View)

#### Habit Tracker Section
- **Habit Management**:
  - Add new habits with name and optional description
  - Track daily completion status (7 days per week)
  - Visual indicators for completed/uncompleted habits (checkboxes)
  - Delete habits (removes from active list)
  - Color-coded habit cards
- **Display**: Grid showing all habits with daily checkboxes for each day
- **Data Persistence**: All changes saved to database in real-time
- **Streaks**: Visual streak counter showing consecutive habit completions

#### Daily Task Tracker
- **Task Management**:
  - Add tasks for specific days (Daily, Weekly, or Monthly types)
  - Mark tasks as complete with checkbox
  - Delete tasks with confirmation
  - Task type categorization for organization
- **Organization**: Tasks organized by day of the week (Monday-Sunday)
- **Progress**: Real-time task completion percentage displayed
- **User Experience**: Quick actions for adding and managing tasks

#### Habit Streak Card
- **Streak Tracking**: 
  - Shows current streak for each habit
  - Shows longest streak achievement
  - Visual badges for milestones
  - Motivation boost through streaks
- **Motivation**: Visual representation of consistency
- **Achievements**: Recognition of habit building progress

#### Weekly Controls
- **Save Week Button**: Archives current week's data
  - Calculates completion percentage (tasks + habits)
  - Stores all tasks and habit tracking
  - Records in archived_weeks table
  - Provides success confirmation
  - Prevents data loss
- **Reset Week Button**: Clears all current week data
  - Clears all task completions
  - Resets habit tracking for the week
  - Restarts weekly progress
  - Confirmation dialog to prevent accidental resets

#### Daily Reflection Section (Optional)
- **Day-by-Day Reflection**:
  - "What went well?" text field
  - "Areas for improvement" text field
  - General notes section
- **Purpose**: Encourages self-reflection and continuous learning
- **Persistence**: Saves automatically to database
- **Retrievable**: Can be edited anytime during the week

---

### 📈 **5. Monthly View** (Overview)

#### Monthly Overview
- **Month Navigation**: Previous/Next buttons to browse months
- **Month Display**: Shows all weeks in the current month at a glance
- **Easy Switching**: Quick toggle between monthly and weekly views

#### Monthly Habit Grid
- **Master View**: All habits tracked across the entire month
- **Visual Summary**: Color-coded completion status for each week
- **Week Selection**: Click on any week to switch to weekly view for detailed work
- **Comprehensive Tracking**: See full month's habit progression at once

#### Monthly Task Grid
- **Task Overview**: All tasks organized by week and day
- **Status Tracking**: See completed vs pending tasks
- **Task Types**: Differentiated task types (Daily, Weekly, Monthly)
- **Summary View**: Total task counts and completion rates

#### Monthly Progress Cards
- **Statistics Dashboard**:
  - Weekly completion percentages
  - Overall month progress
  - Habit completion rates (percentage)
  - Task completion rates (percentage)
  - Overall progress bar indicator
- **Analytics**: Historical data for trend analysis
- **Visualization**: Charts and graphs for easy understanding

#### Monthly Habit Grid (Detailed)
- **Color-Coded Status**:
  - Green: Completed
  - Yellow: Partial completion
  - Gray: Not started
- **Quick Stats**: Completion count for each habit across the month

---

## 🎯 **Key Features**

### Task Management
- ✅ Create tasks with multiple types (Daily, Weekly, Monthly)
- ✅ Mark tasks complete/incomplete with checkbox toggle
- ✅ Delete tasks with confirmation
- ✅ Organize by day and week
- ✅ Progress tracking with completion percentage
- ✅ Task descriptions and notes

### Habit Tracking
- 🎪 Add and delete habits
- 🎪 Daily completion tracking for 7 days/week
- 🎪 Habit streak calculation (current + longest)
- 🎪 Visual progress indicators with checkmarks
- 🎪 Monthly habit overview with grid view
- 🎪 Color-coded habit cards for quick identification

### Progress Analytics
- 📊 Real-time completion percentage calculations
- 📊 Overall progress overview with visual indicators
- 📊 Week-by-week comparison across months
- 📊 Habit vs Task completion breakdown
- 📊 Donut charts for visualization
- 📊 Historical data storage for trend analysis

### Reflections
- 💭 Daily reflection prompts for each day
- 💭 Track what went well during the day
- 💭 Note areas for improvement
- 💭 Personal notes and insights
- 💭 Persistent storage for future review

### User Experience
- 🌓 **Dark/Light Mode**: Toggle available globally on landing, auth, and dashboard
- 🎨 **Beautiful UI**: Gradient backgrounds, smooth animations, modern design
- 📱 **Responsive Design**: Works on desktop and tablet devices
- ⌨️ **Keyboard Friendly**: Accessible form inputs and navigation
- 🔔 **Toast Notifications**: Real-time feedback for all actions (success, error, info)
- 🎯 **Motivational Quotes**: Auto-rotating quotes in navbar with brush font styling
- 📍 **Sticky Navigation**: Header stays visible while scrolling content
- 🌍 **Multilingual Quotes**: English and Hindi mixed quotes for diverse audience
- ⚡ **Smooth Animations**: Fade transitions, scaling effects, count animations
- 🔐 **Secure**: Password authentication, session management, user isolation

---

## 🛠️ **Technologies Used**

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development & production builds)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **UI Components**: shadcn-ui (accessible, pre-built components)
- **Database**: Supabase (PostgreSQL backend)
- **Authentication**: Supabase Auth (email/password)
- **Icons**: Lucide React (beautiful, consistent icons)
- **Date Handling**: date-fns (date utilities and formatting)
- **Notifications**: Sonner (toast notifications)
- **Routing**: React Router (SPA navigation)
- **Fonts**: Google Fonts (Allura for brush script quotes)
- **State Management**: React hooks (useState, useContext)

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account with database setup
- Environmental variables configured

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd WeeklyPlanner

# Install dependencies
npm install

# Configure environment variables
# Create .env file with Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 **Project Structure**

```
src/
├── components/
│   ├── features/                 # Feature components
│   │   ├── DashboardHeader.tsx   # Main nav with quotes
│   │   ├── HabitTracker.tsx
│   │   ├── TaskTrackerCard.tsx
│   │   ├── MotivationalQuotes.tsx
│   │   ├── MotivationalToast.tsx
│   │   ├── MonthlyProgressCard.tsx
│   │   ├── WeekControls.tsx
│   │   └── ... (more feature components)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── RootLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/                       # shadcn-ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (more ui components)
├── pages/
│   ├── Landing.tsx              # Home page
│   ├── Auth.tsx                 # Sign in/up
│   ├── Dashboard.tsx            # Main app
│   └── Index.tsx               
├── lib/
│   ├── supabase.ts             # Database config
│   ├── auth.tsx                # Auth context & hooks
│   ├── dateUtils.ts            # Date utilities
│   └── streakUtils.ts          # Streak calculations
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── useTheme.tsx            # Dark mode hook
├── types/
│   └── index.ts                # TypeScript interfaces
└── styles/
    ├── index.css               # Global styles
    └── App.css                 # App-specific styles
```

---

## 🎨 **Design Highlights**

- **Gradient Backgrounds**: Smooth green to white to emerald gradients
- **Shadow Effects**: Subtle card shadows for depth and elevation
- **Color Scheme**:
  - Primary Green: #16a34a (brand color)
  - Secondary Gray: #374151 (text)
  - Light Background: #f3f4f6
  - Dark Background: #111827
  - Accent Emerald: #059669
- **Typography**: 
  - Modern sans-serif for main text
  - Google Allura brush script for motivational quotes
  - Readable font sizes for accessibility
- **Animations**: 
  - Smooth transitions (300-500ms)
  - Fade effects for quote changes
  - Count animations for stats
  - Hover scaling on cards
  - Backdrop blur on modals

---

## 📊 **Data Model**

### Database Tables

**weeks**
- id (primary key)
- user_id (foreign key)
- start_date
- end_date
- weekly_focus
- reward
- affirmation
- is_active
- created_at

**tasks**
- id
- week_id (reference to weeks)
- day_index (0-6 for Mon-Sun)
- task_text
- completed
- task_type ('daily', 'weekly', 'monthly')
- created_at

**habits**
- id
- user_id
- name
- description
- color
- is_active
- created_at

**habit_tracking**
- id
- habit_id (reference to habits)
- week_id (reference to weeks)
- day_index (0-6)
- completed
- created_at

**reflections**
- id
- week_id
- day_index
- went_well
- improvements
- notes
- created_at
- updated_at

**archived_weeks**
- id
- user_id
- week_data (JSON with complete week data)
- created_at

---

## 🔐 **Security & Authentication**

- **Supabase Auth**: Enterprise-grade authentication
- **Email/Password**: Secure password-based login
- **User Metadata**: Name stored in Supabase user metadata
- **Row-Level Security**: Database queries filtered by user_id
- **Session Management**: Automatic session persistence
- **Password Requirements**: 
  - Minimum 6 characters
  - Confirmation password validation
- **Data Privacy**: User data isolated by user_id

---

## 💡 **User Journey**

1. **Landing Page** → Learn about features and benefits
2. **Sign Up** → Create account with name, email, password
3. **First Login** → Auto-redirected to dashboard
4. **Weekly Setup** → Add habits and tasks for the week
5. **Daily Tracking** → Check off completed items each day
6. **Daily Reflection** → Record insights and learnings
7. **Progress Monitoring** → View completion percentages
8. **Week Review** → Save and archive week's data
9. **Monthly Review** → See progress overview across month
10. **Next Week** → Reset and start fresh cycle
11. **Profile Access** → View member info anytime
12. **Dark Mode Toggle** → Switch theme preference
13. **Logout** → Secure exit from application

---

## 🎯 **Key Metrics Tracked**

- **Daily Metrics**:
  - Tasks completed per day
  - Habits completed per day
  - Completion percentage per day
  
- **Weekly Metrics**:
  - Weekly task completion percentage
  - Weekly habit completion percentage
  - Overall weekly completion score
  - Habit streaks (current & longest)
  
- **Monthly Metrics**:
  - Monthly average completion
  - Week-over-week progress
  - Habit consistency
  - Task completion trends
  
- **Historical Data**:
  - Archived week completions
  - Streak history
  - Progress trends

---

## 🌟 **Features in Development**

Potential future enhancements:
- Goal setting with specific, measurable milestones
- Custom habit categories and icons
- CSV/PDF data export
- Social sharing of achievements
- Gamification with achievement badges
- Advanced analytics dashboard with charts
- Mobile app version (React Native/Flutter)
- Push notifications and reminders
- Weekly email summaries
- Integration with calendar apps
- Voice note entries for reflections
- Collaborative planning with family/team
- AI-powered insights and suggestions

---

## 📝 **Notes**

- All data is saved to Supabase PostgreSQL database
- Changes sync in real-time across open windows
- Weekly archives preserve historical data permanently
- Habit tracking accounts for 7 days per week
- Task types allow different categorization
- Dark mode preference saved in local storage
- User session maintained across page refreshes
- All timestamps in ISO 8601 format
- Email notifications can be enabled in future versions

---

## 🤝 **Contributing**

Feel free to submit issues and enhancement requests!

---

## 📄 **License**

This project is open source.

---

**Stay Focused. Stay Sharp. Build Better Habits.** 🚀
#   W e e k l y P l a n n e r  
 