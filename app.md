# 📚 Smart Study Planner App – Project Documentation

## 1. 🧠 Overview

The Smart Study Planner is a web application designed to automatically generate optimized study schedules for students based on their academic profile, availability, and upcoming tests. The system uses proven learning techniques such as spaced repetition, active recall, interleaving, and time blocking.

---

## 2. 🎯 Core Objectives

- Automate study planning
- Reduce student stress and decision fatigue
- Optimize retention and performance
- Adapt dynamically to real-life constraints

---

## 3. 👤 User Flow

### 3.1 Account Creation
- User signs up
- Proceeds to onboarding

### 3.2 Onboarding Process

#### Academic Profile
- Grade
- Curriculum (e.g. CAPS, IEB)
- School
- Subjects (editable)

#### Time Setup
- School end time
- Arrival home time
- Study end time (cutoff)
- Daily buffer (chores, dinner, etc.)

#### Off Day
- User selects one day per week with no study

#### Extramural Activities
- Add recurring activities
- Day(s) of week
- Start and end times

---

## 4. 📚 Test Input System

### 4.1 Add Test
- Subject
- Topics
- Test date

### 4.2 Difficulty Input
- Scale from 1 to 10

### 4.3 Preparation Window
- Number of days before test to begin studying

---

## 5. ⚙️ Scheduling Engine

### 5.1 Study Load Calculation

| Difficulty | Sessions |
|----------|---------|
| 1–3      | 2–4     |
| 4–7      | 5–8     |
| 8–10     | 9–14    |

---

### 5.2 Spaced Repetition Model

Sessions distributed across:
- Day 1 (Learn)
- Day 2 (Review)
- Day 4
- Day 7
- Day 10

---

### 5.3 Daily Constraints

Remove unavailable time:
- School hours
- Extramurals
- Daily buffer
- Off day

---

### 5.4 Session Allocation Rules

- Max 2–3 subjects per day
- Mix subjects (interleaving)
- Respect study cutoff time
- Prevent overload

---

## 6. ⏱️ Time Structure

### Study Window
- Start: After buffer time
- End: User-defined cutoff

### Session Format
- 25 min study
- 5 min break

---

## 7. 🔁 Dynamic Updates

The system automatically recalculates schedules when:

- New test is added
- Extramural is added/edited
- User misses a session
- Availability changes

---

## 8. 🗓️ Calendar System

### Display Elements
- Study sessions
- Extramurals
- Off day

### Session Types
- New Learning
- Review
- Practice Test

### User Actions
- Mark complete
- Reschedule
- Edit session

---

## 9. 🧠 Personalization System

### Tracks
- Completion rate
- Subject difficulty
- Study consistency

### Adapts
- Adjust spacing intervals
- Increase/decrease workload
- Prioritize weak areas

---

## 10. 🏗️ Technical Architecture

### Frontend
- Next.js
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js API routes (or Node.js)

### Database
- PostgreSQL
- Prisma ORM

---

## 11. 🗄️ Database Schema

### User
- id
- grade
- curriculum
- school
- studyEndTime
- offDay
- dailyBuffer

### Subject
- id
- userId
- name

### Extramural
- id
- userId
- dayOfWeek
- startTime
- endTime

### Test
- id
- subjectId
- date
- difficulty
- prepDays

### StudySession
- id
- testId
- date
- startTime
- duration
- type
- completed

---

## 12. 🚀 MVP Scope

- User onboarding
- Subject and test input
- Basic scheduling engine
- Calendar display

---

## 13. 🔮 Future Features

- AI-based difficulty adjustment
- Smart rescheduling
- Notifications (email/Discord)
- Performance analytics dashboard

---

## 14. 💡 Key Differentiator

This application does not just display a calendar. It actively decides:

- What to study
- When to study
- How to study

Based on scientific learning principles and real-life constraints.

---

## 15. 🧩 Core Function (Conceptual)

```
generateSchedule(user, tests, availability) => StudySession[]
```

---

## 16. 📌 Development Phases

### Phase 1
- Setup project
- Build UI

### Phase 2
- Implement onboarding
- Store user data

### Phase 3
- Build scheduling engine

### Phase 4
- Calendar integration

### Phase 5
- Dynamic updates

---

## 17. ✅ Success Criteria

- User receives a full study plan in seconds
- Schedule adapts automatically
- Users consistently complete sessions
- Improved academic performance

---

**End of Document**

