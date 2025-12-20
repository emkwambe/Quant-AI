import { useState, useEffect } from 'preact/hooks';
import { auth, students } from './api/index.js';

// Pages
import { Landing } from './pages/Landing.jsx';
import { TeacherAuth } from './pages/TeacherAuth.jsx';
import { TeacherDashboard } from './pages/TeacherDashboard.jsx';
import { StudentJoin } from './pages/StudentJoin.jsx';
import { StudentGame } from './pages/StudentGame.jsx';
import { DevSwitcher } from './pages/DevSwitcher.jsx';

// Check if in development mode
const isDev = window.location.hostname === 'localhost';

export function App() {
  const [page, setPage] = useState('loading');
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);

  // Check for existing sessions on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // Try teacher session first
      const teacherData = await auth.me();
      setTeacher(teacherData);
      setPage('teacher-dashboard');
      return;
    } catch (e) {
      // Not a teacher
    }

    try {
      // Try student session
      const studentData = await students.me();
      setStudent(studentData);
      setPage('student-game');
      return;
    } catch (e) {
      // Not a student
    }

    setPage('landing');
  }

  async function handleTeacherLogin(data) {
    setTeacher(data);
    setPage('teacher-dashboard');
  }

  async function handleTeacherLogout() {
    await auth.logout();
    setTeacher(null);
    setPage('landing');
  }

  async function handleStudentJoin(data) {
    setStudent(data);
    setPage('student-game');
  }

  async function handleStudentLeave() {
    await students.leave();
    setStudent(null);
    setPage('landing');
  }

  // Render based on current page
  const pages = {
    loading: () => (
      <div class="container flex flex-center" style={{ minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    ),

    landing: () => (
      <Landing
        onTeacherClick={() => setPage('teacher-auth')}
        onStudentClick={() => setPage('student-join')}
        onDevClick={isDev ? () => setPage('dev-switcher') : null}
      />
    ),

    'dev-switcher': () => (
      <DevSwitcher
        onTeacherLogin={handleTeacherLogin}
        onStudentJoin={handleStudentJoin}
        onBack={() => setPage('landing')}
      />
    ),

    'teacher-auth': () => (
      <TeacherAuth
        onSuccess={handleTeacherLogin}
        onBack={() => setPage('landing')}
      />
    ),

    'teacher-dashboard': () => (
      <TeacherDashboard
        teacher={teacher}
        onLogout={handleTeacherLogout}
      />
    ),

    'student-join': () => (
      <StudentJoin
        onJoin={handleStudentJoin}
        onBack={() => setPage('landing')}
      />
    ),

    'student-game': () => (
      <StudentGame
        student={student}
        onLeave={handleStudentLeave}
      />
    )
  };

  const PageComponent = pages[page] || pages.landing;
  return <PageComponent />;
}
