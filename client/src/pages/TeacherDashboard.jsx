import { useState, useEffect } from 'preact/hooks';
import { classrooms, heats } from '../api/index.js';
import { HeatResults } from '../components/HeatResults.jsx';

export function TeacherDashboard({ teacher, onLogout }) {
  const [myClassrooms, setMyClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeHeat, setActiveHeat] = useState(null);
  const [heatResults, setHeatResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassrooms();
  }, []);

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

  if (loading) {
    return <div class="container mt-4 text-center">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <header class="header">
        <div class="header-content">
          <span class="logo">MATHATHLON</span>
          <div class="flex gap-2">
            <span class="text-light">Hi, {teacher.name}</span>
            <button class="btn btn-outline" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div class="container mt-2">
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
                  <option value="3">Grade 3</option>
                  <option value="4" selected>Grade 4</option>
                  <option value="5">Grade 5</option>
                </select>
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
              <p class="text-light mb-1">Students join at mathathlon.com with code:</p>
              <div class="join-code">{selectedClassroom.join_code}</div>
              <p class="text-light mt-2">
                {selectedClassroom.students?.length || 0} students in class
              </p>
            </div>

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
                    </li>
                  ))}
                </ul>
              ) : (
                <p class="text-light">
                  No students yet. Share the join code above!
                </p>
              )}
            </div>
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
