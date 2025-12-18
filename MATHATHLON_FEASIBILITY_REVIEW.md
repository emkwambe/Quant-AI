# MATHATHLON - Build-Ready Feasibility Specification

**Version:** 2.0 (Pragmatic Edition)
**Status:** Ready for Development

---

## Executive Summary

**Verdict: FEASIBLE - READY TO BUILD**

This document strips the Mathathlon concept to its buildable core, removing dependencies on perfect conditions and focusing on what works reliably in real school environments.

### Design Principles Applied

1. **Assume bad networks** - Design for 500ms+ latency, not milliseconds
2. **Assume old hardware** - Target 2015-era Chromebooks
3. **Assume distracted users** - Teachers have 30 seconds to set up
4. **Assume zero IT support** - Must work without firewall changes
5. **Start small, prove value** - MVP serves one classroom before scaling globally

---

## Part 1: Technical Specification (Simplified)

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  SIMPLIFIED ARCHITECTURE (Single Server Start)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Browser ◄──── HTTPS/WSS ────► Single Node.js Server      │
│     (Student/Teacher)                    │                  │
│                                          ▼                  │
│                                    PostgreSQL               │
│                                   (or SQLite for MVP)       │
│                                                             │
│   Scale later: Add Redis + multiple nodes when needed       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why this works:**
- Single server handles 500-1000 concurrent users easily
- No distributed system complexity until proven needed
- PostgreSQL handles both sessions and persistent data
- Upgrade path clear when scale requires it

### 1.2 Real-Time Strategy (Practical)

**Original PRD:** "Sync all players to the millisecond"
**Reality:** Impossible and unnecessary

**Pragmatic Approach: Server-Authoritative Rounds**

```
┌─────────────────────────────────────────────────────────────┐
│  HOW "LIVE" ACTUALLY WORKS                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Teacher clicks "Start Heat"                             │
│  2. Server creates heat with START_TIME = now + 5 seconds   │
│  3. All clients receive heat ID and START_TIME              │
│  4. Each client shows countdown locally                     │
│  5. At START_TIME, clients request first question           │
│  6. Server tracks: (heat_id, user_id, question_id, time)    │
│  7. Scoring = server receipt time - heat start time         │
│                                                             │
│  Result: Feels synchronized, tolerates 500ms+ latency       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key simplification:** No real-time leaderboard during competition. Show results AFTER heat ends. This eliminates:
- Constant WebSocket broadcasts
- Race conditions
- Cheating via network inspection
- Complexity of live position updates

### 1.3 Heat Mechanics (Simplified)

**Remove:** Global heats starting every 60 seconds
**Replace:** Teacher-initiated classroom heats

| Feature | Original | Simplified |
|---------|----------|------------|
| Heat trigger | Auto every 60s globally | Teacher clicks "Start" |
| Participants | Global strangers | Single classroom |
| Lobby | Global map visualization | Simple "X students ready" |
| Duration | 3-5 minutes | 2 minutes fixed |
| Questions | Dynamic difficulty mid-heat | Fixed difficulty per heat |

**Why:**
- Teacher control = teacher adoption
- Single classroom = no cross-network sync issues
- Fixed duration = predictable lesson planning
- Add global heats in V2 after proving single-classroom value

### 1.4 Frontend Specification

**Target Device:** 2015 Chromebook (2GB RAM, 1366x768, spotty WiFi)

**Technology Choice:**

| Option | Decision | Rationale |
|--------|----------|-----------|
| Framework | **Vanilla JS + Preact** | Smallest bundle, fastest load |
| Styling | CSS (no framework) | Zero overhead |
| Build | Vite | Fast dev, optimized production |
| State | URL params + localStorage | No complex state management |

**Performance Budget:**

```
┌─────────────────────────────────────────┐
│  HARD LIMITS                            │
├─────────────────────────────────────────┤
│  Total JS (gzipped):     < 50KB         │
│  Total CSS (gzipped):    < 10KB         │
│  Time to interactive:    < 2 seconds    │
│  Memory usage:           < 50MB         │
│  Works offline:          Yes (cached)   │
└─────────────────────────────────────────┘
```

**UI Simplifications:**

| Original | Simplified |
|----------|------------|
| 3D podium with avatars | CSS podium, initials only |
| Global map of participants | "32 students in your class" |
| Complex animations | CSS transitions only |
| Live leaderboard updates | Results screen after heat |

### 1.5 Data Model (Minimal)

```sql
-- Core tables only - extend later as needed

teachers (
  id, email, password_hash, school_name, created_at
)

classrooms (
  id, teacher_id, name, join_code, grade_level
)

students (
  id, classroom_id, display_name, created_at
  -- NO email, NO PII beyond display name
)

heats (
  id, classroom_id, started_at, ended_at,
  difficulty_level, question_count
)

responses (
  id, heat_id, student_id, question_template_id,
  question_params, student_answer, correct_answer,
  is_correct, response_time_ms, answered_at
)
```

**Privacy by design:**
- Students identified by display name only (teacher assigns)
- No student emails, no parent consent needed
- Teacher owns all student data
- COPPA-compliant by architecture

### 1.6 Offline/Resilience Strategy

**Problem:** School WiFi drops mid-heat
**Solution:** Graceful degradation, not prevention

```
┌─────────────────────────────────────────────────────────────┐
│  CONNECTION LOSS HANDLING                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Questions pre-loaded at heat start (all 20 questions)   │
│  2. Answers stored in localStorage as submitted             │
│  3. If connection lost:                                     │
│     - Student continues answering locally                   │
│     - UI shows "Answers will sync when connected"           │
│  4. On reconnect: batch submit all pending answers          │
│  5. Server accepts late submissions with original timestamp │
│                                                             │
│  Result: Network issues don't ruin the experience           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 2: Business Model (Proven Patterns)

### 2.1 Pricing Strategy

**Model:** Freemium with clear upgrade triggers

```
┌─────────────────────────────────────────────────────────────┐
│  TIER STRUCTURE                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREE FOREVER                                               │
│  ├─ 1 classroom, up to 35 students                          │
│  ├─ 3 heats per day                                         │
│  ├─ Grades 3-5 content only                                 │
│  ├─ Basic results (who got what right)                      │
│  └─ PURPOSE: Let teachers fall in love                      │
│                                                             │
│  PRO - $5/month or $40/year                                 │
│  ├─ Unlimited classrooms and heats                          │
│  ├─ All grade levels (K-8)                                  │
│  ├─ Historical tracking (30-day trends)                     │
│  ├─ Export results to CSV                                   │
│  ├─ Class vs Class mode (within school)                     │
│  └─ PURPOSE: Individual teacher purchase                    │
│                                                             │
│  SCHOOL - $200/year flat                                    │
│  ├─ All Pro features                                        │
│  ├─ Up to 50 teachers                                       │
│  ├─ Admin dashboard                                         │
│  ├─ Google Classroom roster sync                            │
│  └─ PURPOSE: Principal/department purchase                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why these prices:**
- $5/mo = impulse purchase, no approval needed
- $40/yr = cheaper than a textbook
- $200/yr school = one PD budget line item

### 2.2 Conversion Triggers

| Free Limit | Upgrade Trigger | Expected Conversion |
|------------|-----------------|---------------------|
| 3 heats/day | "You've used all 3 heats! Upgrade for unlimited" | 5-8% |
| Grades 3-5 only | "Your 6th graders can play too with Pro" | 3-5% |
| 30-day data | "See Sarah's progress over time with Pro" | 2-3% |
| Single classroom | "Add your other classes with Pro" | 4-6% |

### 2.3 Unit Economics (Conservative)

**Assumptions:**
- CAC: $0 (organic/word-of-mouth only in Y1)
- Free-to-Pro conversion: 4%
- Monthly churn: 5%
- No school sales in Y1 (focus on proving product)

| Metric | Month 6 | Month 12 | Month 18 |
|--------|---------|----------|----------|
| Free teachers | 500 | 2,000 | 6,000 |
| Pro subscribers | 20 | 80 | 240 |
| MRR | $100 | $400 | $1,200 |
| **ARR** | $1,200 | $4,800 | $14,400 |

**Break-even hosting:** ~50 Pro subscribers ($250/mo) covers infrastructure

### 2.4 Go-to-Market (Zero Budget)

**Phase 1: Prove with 10 teachers (Month 1-2)**
- Personal outreach to teacher friends/connections
- Goal: Do they use it more than once?

**Phase 2: Organic growth (Month 3-6)**
- Teachers share join codes → students tell other teachers
- Post in r/teachers, teacher Facebook groups
- Goal: 500 free teachers

**Phase 3: Content marketing (Month 6-12)**
- Blog: "5-minute math warm-up activities"
- YouTube: Classroom footage of Mathathlon in action
- Goal: 2,000 free teachers, first Pro conversions

**What we're NOT doing:**
- Paid ads (unproven product-market fit)
- Sales team (premature)
- Conference booths (expensive, low ROI early)
- District sales (long cycles, need case studies first)

---

## Part 3: Math Content (MVP Scope)

### 3.1 Content Boundaries

**V1 Focus:** Grades 3-5 arithmetic fluency only

| Include | Exclude (for now) |
|---------|-------------------|
| Addition (2-3 digit) | Geometry |
| Subtraction (2-3 digit) | Word problems |
| Multiplication (facts to 12) | Fractions |
| Division (facts to 12) | Decimals |
| Mixed operations | Algebra |

**Why narrow:**
- Grades 3-5 = largest addressable market
- Arithmetic fluency = clear learning outcome
- Template-based = infinite questions from few templates
- Expand after proving engagement

### 3.2 Question Template System

**Total templates needed for V1:** 25

```javascript
// Example template structure
const templates = {
  "add-2digit": {
    id: "add-2digit",
    grade: 3,
    skill: "addition",
    difficulty: 2, // 1-5 scale

    generate: () => {
      const a = randInt(10, 99);
      const b = randInt(10, 99 - a); // Keep sum under 100 for easier
      return {
        display: `${a} + ${b} = ?`,
        answer: a + b,
        inputType: "number"
      };
    }
  },

  "mult-facts": {
    id: "mult-facts",
    grade: 4,
    skill: "multiplication",
    difficulty: 3,

    generate: () => {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      return {
        display: `${a} × ${b} = ?`,
        answer: a * b,
        inputType: "number"
      };
    }
  }
  // ... 23 more templates
};
```

### 3.3 Template Inventory (V1)

| Skill | Templates | Difficulty Range |
|-------|-----------|------------------|
| Addition (no carry) | 2 | 1-2 |
| Addition (with carry) | 2 | 2-3 |
| Subtraction (no borrow) | 2 | 1-2 |
| Subtraction (with borrow) | 2 | 2-3 |
| Multiplication (single digit) | 3 | 2-3 |
| Multiplication (by 10, 100) | 2 | 2-3 |
| Division (facts) | 3 | 2-4 |
| Division (with remainder) | 2 | 3-4 |
| Mixed operations | 4 | 3-5 |
| Missing number (a + ? = c) | 3 | 3-4 |
| **Total** | **25** | 1-5 |

### 3.4 Difficulty Selection (Simple)

**Remove:** Complex Elo-based adaptive algorithm
**Replace:** Teacher selects difficulty before heat

```
┌─────────────────────────────────────────────────────────────┐
│  DIFFICULTY LEVELS (Teacher Chooses)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 1: "Warm Up"                                         │
│  └─ Templates with difficulty 1-2                           │
│  └─ Recommended: Beginning of unit, struggling students     │
│                                                             │
│  LEVEL 2: "Practice"                                        │
│  └─ Templates with difficulty 2-3                           │
│  └─ Recommended: Daily practice, mixed ability              │
│                                                             │
│  LEVEL 3: "Challenge"                                       │
│  └─ Templates with difficulty 3-5                           │
│  └─ Recommended: Review, advanced students                  │
│                                                             │
│  Teacher knows their class. Let them choose.                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why no adaptive:**
- Adaptive algorithms need data to calibrate (cold start problem)
- Teachers already differentiate by choosing when to use each level
- Simpler = fewer bugs = faster to build
- Add adaptive in V2 with 6 months of response data

### 3.5 Standards Alignment (Lightweight)

**V1 Approach:** Tag templates with CCSS codes, display on teacher dashboard

```
Template: mult-facts
CCSS: 3.OA.C.7 - Fluently multiply within 100
```

**What we're NOT doing in V1:**
- Formal curriculum mapping documents
- State-by-state standard crosswalks
- Scope and sequence recommendations
- These come later when selling to districts

---

## Part 4: Implementation Roadmap

### 4.1 MVP Feature Set (8 Weeks)

**Week 1-2: Core Infrastructure**
- [ ] Teacher signup/login (email + password)
- [ ] Create classroom with join code
- [ ] Student join flow (code + display name)
- [ ] Basic database schema

**Week 3-4: Heat Engine**
- [ ] Teacher starts heat (selects difficulty)
- [ ] Students see countdown, receive questions
- [ ] Submit answers, store response times
- [ ] Heat ends after 2 minutes or 20 questions

**Week 5-6: Results & Polish**
- [ ] Post-heat results screen (ranking by score)
- [ ] Teacher sees class performance summary
- [ ] Basic error handling and offline support
- [ ] Mobile-responsive styling

**Week 7-8: Content & Testing**
- [ ] Implement 25 question templates
- [ ] QA all templates (math correctness)
- [ ] Load testing (target: 50 concurrent users)
- [ ] Bug fixes from internal testing

### 4.2 Post-MVP (Next 8 Weeks)

**Only if MVP proves engagement:**
- Historical student tracking
- Pro tier with payment (Stripe)
- Additional grade levels (K-2, 6-8)
- Class vs Class mode

### 4.3 What We're Explicitly NOT Building

| Feature | Reason |
|---------|--------|
| Global real-time heats | Complexity, unproven value |
| 3D graphics/avatars | Performance risk, dev time |
| Mobile native apps | Web works fine, app stores slow |
| AI-powered tutoring | Scope creep, different product |
| Parent dashboards | B2B focus, not B2C |
| Multiplayer chat | Moderation nightmare |
| Custom avatars/cosmetics | Distraction from core value |

---

## Part 5: Risk Mitigation

### 5.1 Technical Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Server can't handle load | Low | Start with one classroom at a time; horizontal scaling is straightforward |
| Questions have math errors | Medium | Automated tests verify every template generates correct answers |
| Slow on old Chromebooks | Medium | Performance budget enforced; test on real hardware |
| School firewalls block | Low | Standard HTTPS on port 443; no WebSocket fallback needed |

### 5.2 Business Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Teachers don't return | High | Focus first 10 teachers on "why not?" feedback |
| Free tier too generous | Medium | Adjust limits based on conversion data |
| Can't compete with Kahoot | Medium | Don't compete—focus on math depth, not general quizzes |
| No one pays | Medium | Validate willingness to pay in user interviews before building payment |

### 5.3 Content Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Questions too easy/hard | Medium | Teacher controls difficulty; collect feedback |
| Not aligned to curriculum | Low | CCSS tags visible; teachers validate |
| Students find patterns/cheat | Low | Procedural generation + randomization |

---

## Part 6: Success Criteria

### MVP Success (Week 8)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Teachers complete signup | 10 | Database count |
| Teachers run 3+ heats | 7 of 10 | Analytics |
| Students engaged (complete heat) | 80% | Response completion rate |
| Teacher NPS | > 30 | Survey |
| Critical bugs | 0 | Bug tracker |

### 3-Month Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Organic teacher signups | 100 | No paid acquisition |
| Weekly active teachers | 30 | Used in last 7 days |
| Teacher retention (M2) | 40% | Cohort analysis |
| Upgrade interest | 10 inquiries | Support/feedback |

### 6-Month Success (Go/No-Go for Growth)

| Metric | Target | Decision |
|--------|--------|----------|
| Free teachers | 500+ | Continue if yes |
| Pro conversions | 20+ | Validate pricing |
| Teacher referrals | 30% come from referral | Validate virality |
| Student accuracy improvement | Measurable | Validate learning outcome |

---

## Conclusion

This specification is **ready to build**. It removes:

- Millisecond synchronization (impossible)
- Global real-time heats (unnecessary complexity)
- 3D graphics (performance risk)
- Complex adaptive algorithms (cold start problem)
- District sales (premature)

It keeps:

- Core "competitive math" experience
- Teacher control and simplicity
- Proven freemium business model
- Narrow content focus (grades 3-5 arithmetic)
- Clear 8-week MVP scope

**Next step:** Start Week 1 development.

---

*Specification version: 2.0*
*Ready for implementation*
