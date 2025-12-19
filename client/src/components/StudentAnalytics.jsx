import { useState, useEffect } from 'preact/hooks';
import { analytics } from '../api/index.js';

export function StudentAnalytics({ classroomId, studentId, students, onSelectStudent }) {
  const [classData, setClassData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassAnalytics();
  }, [classroomId]);

  useEffect(() => {
    if (studentId) {
      loadStudentAnalytics(studentId);
    } else {
      setStudentData(null);
    }
  }, [studentId]);

  async function loadClassAnalytics() {
    try {
      const data = await analytics.classroom(classroomId);
      setClassData(data);
    } catch (err) {
      console.error('Failed to load class analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentAnalytics(id) {
    try {
      const data = await analytics.student(id);
      setStudentData(data);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
    }
  }

  async function handleExport() {
    try {
      const { csv } = await analytics.export(classroomId);
      // Download as file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mathathlon-export-${classroomId}.csv`;
      a.click();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div class="card text-center">Loading analytics...</div>;
  }

  // Student detail view
  if (studentData) {
    return (
      <div>
        <button class="btn btn-outline mb-3" onClick={() => onSelectStudent(null)}>
          ← Back to Class
        </button>

        <div class="card mb-3">
          <h3>{studentData.student.displayName}</h3>
          <div class="stats mt-2">
            <div>
              <div class="stat-value">{studentData.overall.heatsParticipated}</div>
              <div class="stat-label">Heats</div>
            </div>
            <div>
              <div class="stat-value">{studentData.overall.totalCorrect}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div>
              <div class="stat-value">{studentData.overall.accuracy}%</div>
              <div class="stat-label">Accuracy</div>
            </div>
            <div>
              <div class="stat-value">{(studentData.overall.avgTimeMs / 1000).toFixed(1)}s</div>
              <div class="stat-label">Avg Time</div>
            </div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div class="card mb-3">
          <h4 class="mb-2">Skills Breakdown (30 days)</h4>
          {studentData.skillBreakdown.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Skill</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Attempts</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {studentData.skillBreakdown.map((skill) => (
                  <tr key={skill.template} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem' }}>{skill.template}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>{skill.attempts}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                      <span style={{ color: skill.accuracy >= 70 ? 'var(--success)' : 'var(--error)' }}>
                        {skill.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p class="text-light">No data yet</p>
          )}
        </div>

        {/* Recent Heats */}
        <div class="card">
          <h4 class="mb-2">Recent Heats</h4>
          {studentData.recentHeats.length > 0 ? (
            <ul class="leaderboard">
              {studentData.recentHeats.map((heat) => (
                <li key={heat.heat_id} class="leaderboard-item">
                  <span>{new Date(heat.started_at).toLocaleDateString()}</span>
                  <span>Level {heat.difficulty_level}</span>
                  <span class="text-success">{heat.correct}/{heat.questions_answered}</span>
                  <span>Rank #{heat.rank}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p class="text-light">No heats yet</p>
          )}
        </div>
      </div>
    );
  }

  // Class overview
  return (
    <div>
      <div class="flex flex-between mb-3">
        <h3>Class Analytics (30 days)</h3>
        <button class="btn btn-outline" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {/* Class Leaderboard */}
      <div class="card mb-3">
        <h4 class="mb-2">Student Leaderboard</h4>
        {classData?.leaderboard.length > 0 ? (
          <ul class="leaderboard">
            {classData.leaderboard.map((student) => (
              <li key={student.studentId} class="leaderboard-item">
                <span class={`leaderboard-rank ${
                  student.rank === 1 ? 'gold' :
                  student.rank === 2 ? 'silver' :
                  student.rank === 3 ? 'bronze' : ''
                }`}>
                  {student.rank}
                </span>
                <span
                  class="leaderboard-name"
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => onSelectStudent(student.studentId)}
                >
                  {student.displayName}
                </span>
                <span class="text-light">{student.totalQuestions} Q</span>
                <span style={{ color: student.accuracy >= 70 ? 'var(--success)' : 'var(--error)' }}>
                  {student.accuracy}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p class="text-light">No data yet. Run some heats first!</p>
        )}
      </div>

      {/* Skills Needing Attention */}
      {classData?.strugglingSkills.length > 0 && (
        <div class="card mb-3">
          <h4 class="mb-2">Skills Needing Practice</h4>
          <p class="text-light mb-2">These skills have the lowest accuracy:</p>
          <ul>
            {classData.strugglingSkills.map((skill) => (
              <li key={skill.question_template} style={{ padding: '0.25rem 0' }}>
                <strong>{skill.question_template}</strong>: {skill.accuracy}% accuracy ({skill.attempts} attempts)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Heats */}
      <div class="card">
        <h4 class="mb-2">Recent Heats</h4>
        {classData?.recentHeats.length > 0 ? (
          <ul class="leaderboard">
            {classData.recentHeats.map((heat) => (
              <li key={heat.id} class="leaderboard-item">
                <span>{new Date(heat.started_at).toLocaleDateString()}</span>
                <span>Level {heat.difficulty_level}</span>
                <span>{heat.participants} students</span>
                <span class="text-success">{heat.accuracy}% accuracy</span>
              </li>
            ))}
          </ul>
        ) : (
          <p class="text-light">No heats yet</p>
        )}
      </div>
    </div>
  );
}
