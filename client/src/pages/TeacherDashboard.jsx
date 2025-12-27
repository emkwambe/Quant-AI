import { useState, useEffect } from 'preact/hooks';
import { classrooms, heats, analytics, subscriptions, challenges } from '../api/index.js';
import { HeatResults } from '../components/HeatResults.jsx';
import { StudentAnalytics } from '../components/StudentAnalytics.jsx';
import { ChallengeMode } from '../components/ChallengeMode.jsx';
import { MerchandiseStore } from '../components/MerchandiseStore.jsx';
import { ResourceCenter } from '../components/ResourceCenter.jsx';
import { Logo } from '../components/Logo.jsx';
import TournamentList from '../components/TournamentList.jsx';
import TournamentCreate from '../components/TournamentCreate.jsx';
import TournamentDetail from '../components/TournamentDetail.jsx';

export function TeacherDashboard({ teacher, onLogout }) {
  const [myClassrooms, setMyClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeHeat, setActiveHeat] = useState(null);
  const [heatResults, setHeatResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('heats'); // 'heats', 'analytics', 'challenges', 'tournaments', 'resources', 'shop'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showTournamentCreate, setShowTournamentCreate] = useState(false);

  useEffect(() => {
    loadClassrooms();
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const status = await subscriptions.status();
      setSubscription(status);
    } catch (e) {
      console.error('Failed to load subscription:', e);
    }
  }

  async function loadClassrooms() {
    try {
      const data = await classrooms.list();
      setMyClassrooms(data);
      if (data.length > 0 && !selectedClassroom) {
        loadClassroom(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadClassroom(id) {
    const data = await classrooms.get(id);
    setSelectedClassroom(data);
    setActiveHeat(null);
    setHeatResults(null);
    setSelectedStudent(null);
  }

  async function handleCreateClassroom(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const gradeLevel = parseInt(e.target.gradeLevel.value);

    try {
      const newClassroom = await classrooms.create({ name, gradeLevel });
      setMyClassrooms([newClassroom, ...myClassrooms]);
      setShowCreate(false);
      loadClassroom(newClassroom.id);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleStartHeat(difficultyLevel) {
    try {
      const heat = await heats.start({
        classroomId: selectedClassroom.id,
        difficultyLevel
      });
      setActiveHeat(heat);
      setHeatResults(null);

      // Poll for updates every 5 seconds
      const interval = setInterval(async () => {
        const results = await heats.results(heat.id);
        if (results.heat.status === 'ended') {
          setActiveHeat(null);
          setHeatResults(results);
          clearInterval(interval);
        }
      }, 5000);

      // Auto-end after duration
      setTimeout(async () => {
        clearInterval(interval);
        try {
          await heats.end(heat.id);
          const results = await heats.results(heat.id);
          setActiveHeat(null);
          setHeatResults(results);
        } catch (e) {}
      }, (heat.durationSeconds + 5) * 1000);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleEndHeat() {
    if (!activeHeat) return;
    try {
      await heats.end(activeHeat.id);
      const results = await heats.results(activeHeat.id);
      setActiveHeat(null);
      setHeatResults(results);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpgrade(plan) {
    try {
      const { url } = await subscriptions.checkout(plan);
      if (url) window.location.href = url;
    } catch (err) {
      alert('Stripe not configured. Set STRIPE_SECRET_KEY to enable payments.');
    }
  }

  const isPro = subscription?.tier === 'pro';
  const gradeLabel = {
    1: 'K', 2: '1st', 3: '2nd', 4: '3rd', 5: '4th', 6: '5th', 7: '6th', 8: '7th'
  };

  if (loading) {
    return <div class="container mt-4 text-center">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <header class="header">
        <div class="header-content">
          <Logo size="medium" />
          <div class="flex gap-2">
            {isPro && <span class="badge-pro">PRO</span>}
            <span class="text-light">Hi, {teacher.name}</span>
            <button class="btn btn-outline" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div class="container mt-2">
        {/* Pro Upgrade Banner (if free) */}
        {!isPro && (
          <div class="card mb-3" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}>
            <div class="flex flex-between">
              <div>
                <h3 style={{ color: 'white' }}>Upgrade to Pro</h3>
                <p style={{ opacity: 0.9 }}>Unlock analytics, all grade levels, Class vs Class, and more!</p>
              </div>
              <div class="flex gap-1">
                <button class="btn" style={{ background: 'white', color: '#4f46e5' }} onClick={() => handleUpgrade('monthly')}>
                  $5/mo
                </button>
                <button class="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => handleUpgrade('yearly')}>
                  $40/yr
                </button>
              </div>
            </div>
          </div>
        )}

        <div class="flex flex-between mb-3">
          <h2>My Classrooms</h2>
          <button class="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            + New Classroom
          </button>
        </div>

        {/* Create Classroom Form */}
        {showCreate && (
          <form class="card mb-3" onSubmit={handleCreateClassroom}>
            <h3 class="mb-2">Create Classroom</h3>
            <div class="grid grid-2">
              <div class="form-group">
                <label>Classroom Name</label>
                <input
                  type="text"
                  name="name"
                  class="form-input"
                  required
                  placeholder="4th Grade Math"
                />
              </div>
              <div class="form-group">
                <label>Grade Level</label>
                <select name="gradeLevel" class="form-input">
                  <option value="1">Kindergarten</option>
                  <option value="2">1st Grade</option>
                  <option value="3">2nd Grade</option>
                  <option value="4" selected>3rd Grade</option>
                  <option value="5">4th Grade</option>
                  <option value="6">5th Grade</option>
                  {isPro && <option value="7">6th Grade</option>}
                  {isPro && <option value="8">7th Grade</option>}
                </select>
                {!isPro && <small class="text-light">Grades 6-8 available with Pro</small>}
              </div>
            </div>
            <div class="flex gap-1">
              <button type="submit" class="btn btn-success">Create</button>
              <button type="button" class="btn btn-outline" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Classroom Tabs */}
        {myClassrooms.length > 0 && (
          <div class="flex gap-1 mb-3" style={{ overflowX: 'auto' }}>
            {myClassrooms.map((c) => (
              <button
                key={c.id}
                class={`btn ${selectedClassroom?.id === c.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => loadClassroom(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected Classroom */}
        {selectedClassroom ? (
          <div>
            {/* Join Code */}
            <div class="card mb-3 text-center">
              <p class="text-light mb-1">Students join with code:</p>
              <div class="join-code">{selectedClassroom.join_code}</div>
              <p class="text-light mt-2">
                Grade {gradeLabel[selectedClassroom.grade_level] || selectedClassroom.grade_level} |
                {selectedClassroom.students?.length || 0} students
              </p>
            </div>

            {/* Feature Tabs */}
            <div class="flex gap-1 mb-3">
              <button
                class={`btn ${activeTab === 'heats' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('heats')}
              >
                Heats
              </button>
              <button
                class={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('analytics')}
                disabled={!isPro}
              >
                Analytics {!isPro && '(Pro)'}
              </button>
              <button
                class={`btn ${activeTab === 'challenges' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('challenges')}
                disabled={!isPro}
              >
                Class vs Class {!isPro && '(Pro)'}
              </button>
              <button
                class={`btn ${activeTab === 'tournaments' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('tournaments'); setSelectedTournament(null); setShowTournamentCreate(false); }}
              >
                Tournaments
              </button>
              <button
                class={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('resources')}
              >
                Resources
              </button>
              <button
                class={`btn ${activeTab === 'shop' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('shop')}
              >
                Shop
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'heats' && (
              <>
                {/* Active Heat or Start Heat */}
                {activeHeat ? (
                  <div class="card mb-3">
                    <div class="flex flex-between mb-2">
                      <h3>Heat in Progress</h3>
                      <button class="btn btn-outline" onClick={handleEndHeat}>
                        End Heat
                      </button>
                    </div>
                    <p class="text-light">
                      Difficulty: Level {activeHeat.difficultyLevel} |
                      Grade: {activeHeat.gradeLevel} |
                      Questions: {activeHeat.questions.length}
                    </p>
                    <div class="countdown mt-2">
                      {activeHeat.durationSeconds}s
                    </div>
                    <p class="text-center text-light">
                      Students are racing! Results will appear when the heat ends.
                    </p>
                  </div>
                ) : heatResults ? (
                  <HeatResults
                    results={heatResults}
                    onNewHeat={() => setHeatResults(null)}
                    onViewStudent={isPro ? setSelectedStudent : null}
                  />
                ) : (
                  <div class="card">
                    <h3 class="mb-2">Start a Heat</h3>
                    <p class="text-light mb-3">
                      Choose difficulty and start a 2-minute math race!
                    </p>
                    <div class="grid grid-3">
                      <button
                        class="btn btn-outline btn-large"
                        onClick={() => handleStartHeat(1)}
                      >
                        Warm Up<br/>
                        <small class="text-light">Easy</small>
                      </button>
                      <button
                        class="btn btn-primary btn-large"
                        onClick={() => handleStartHeat(2)}
                      >
                        Practice<br/>
                        <small style={{ opacity: 0.8 }}>Medium</small>
                      </button>
                      <button
                        class="btn btn-outline btn-large"
                        onClick={() => handleStartHeat(3)}
                      >
                        Challenge<br/>
                        <small class="text-light">Hard</small>
                      </button>
                    </div>
                  </div>
                )}

                {/* Student List */}
                <div class="card mt-3">
                  <h3 class="mb-2">Students ({selectedClassroom.students?.length || 0})</h3>
                  {selectedClassroom.students?.length > 0 ? (
                    <ul class="leaderboard">
                      {selectedClassroom.students.map((s) => (
                        <li key={s.id} class="leaderboard-item">
                          <span class="leaderboard-name">{s.display_name}</span>
                          {isPro && (
                            <button
                              class="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                              onClick={() => {
                                setSelectedStudent(s.id);
                                setActiveTab('analytics');
                              }}
                            >
                              View Stats
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p class="text-light">
                      No students yet. Share the join code above!
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'analytics' && isPro && (
              <StudentAnalytics
                classroomId={selectedClassroom.id}
                studentId={selectedStudent}
                students={selectedClassroom.students || []}
                onSelectStudent={setSelectedStudent}
              />
            )}

            {activeTab === 'challenges' && isPro && (
              <ChallengeMode
                classroom={selectedClassroom}
                onStartChallenge={(challengeId) => {
                  // Start challenge heat
                  console.log('Start challenge', challengeId);
                }}
              />
            )}

            {activeTab === 'tournaments' && (
              <>
                {selectedTournament ? (
                  <TournamentDetail
                    tournamentId={selectedTournament.id}
                    onBack={() => setSelectedTournament(null)}
                  />
                ) : showTournamentCreate ? (
                  <TournamentCreate
                    classrooms={myClassrooms.map(c => ({
                      ...c,
                      studentCount: c.students?.length || 0
                    }))}
                    onCreated={(tournament) => {
                      setShowTournamentCreate(false);
                      setSelectedTournament(tournament);
                    }}
                    onCancel={() => setShowTournamentCreate(false)}
                  />
                ) : (
                  <TournamentList
                    onSelect={setSelectedTournament}
                    onCreateNew={() => setShowTournamentCreate(true)}
                  />
                )}
              </>
            )}

            {activeTab === 'resources' && (
              <ResourceCenter />
            )}

            {activeTab === 'shop' && (
              <MerchandiseStore />
            )}
          </div>
        ) : (
          <div class="card text-center">
            <p class="text-light">Create your first classroom to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
