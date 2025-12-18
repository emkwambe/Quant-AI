export function Landing({ onTeacherClick, onStudentClick }) {
  return (
    <div class="container" style={{ paddingTop: '4rem' }}>
      <div class="text-center mb-4">
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>MATHATHLON</h1>
        <p class="text-light" style={{ fontSize: '1.25rem' }}>
          Real-time competitive math for classrooms
        </p>
      </div>

      <div class="grid grid-2 mt-4" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <button class="btn btn-primary btn-large" onClick={onTeacherClick}>
          I'm a Teacher
        </button>
        <button class="btn btn-outline btn-large" onClick={onStudentClick}>
          I'm a Student
        </button>
      </div>

      <div class="card mt-4 text-center">
        <h3 class="mb-2">How it works</h3>
        <div class="grid grid-3">
          <div>
            <div style={{ fontSize: '2rem' }}>1</div>
            <p class="text-light">Teacher creates a classroom</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem' }}>2</div>
            <p class="text-light">Students join with code</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem' }}>3</div>
            <p class="text-light">Race to solve math!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
