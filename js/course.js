/*
  LearnSpark - course.js
  Course detail page:
  roadmap, curriculum, progress circle, enroll
*/

// ---- GET COURSE ID FROM URL ----
function getCourseId() {
  var params = new URLSearchParams(window.location.search);
  return params.get('id') || 'js-basics';
}

// ---- LESSON DATA PER COURSE ----
var LESSON_DATA = {
  'js-basics': [
    { title: 'Introduction to JavaScript',   dur: '8 min' },
    { title: 'Variables & Data Types',        dur: '12 min' },
    { title: 'Operators & Expressions',       dur: '10 min' },
    { title: 'Functions & Scope',             dur: '15 min' },
    { title: 'Arrays & Objects',              dur: '14 min' },
    { title: 'DOM Manipulation',              dur: '18 min' },
    { title: 'Events & Event Listeners',      dur: '12 min' },
    { title: 'ES6 — let, const, arrow fns',   dur: '10 min' },
    { title: 'Template Literals & Spread',    dur: '8 min' },
    { title: 'Promises & Async/Await',        dur: '20 min' },
    { title: 'Fetch API & AJAX',              dur: '16 min' },
    { title: 'Final Project',                 dur: '30 min' }
  ]
};

// Fallback generic lessons for other courses
function getLessons(courseId, count) {
  if (LESSON_DATA[courseId]) return LESSON_DATA[courseId];

  var generic = [];
  for (var i = 1; i <= count; i++) {
    generic.push({ title: 'Lesson ' + i, dur: '10 min' });
  }
  return generic;
}

// ---- RENDER COURSE PAGE ----
function initCoursePage() {
  var id     = getCourseId();
  var course = COURSES.find(function(c) { return c.id === id; });

  if (!course) {
    window.location.href = 'index.html';
    return;
  }

  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');
  var done     = progress[id] || 0;
  var pct      = Math.round((done / course.lessons) * 100);
  var lessons  = getLessons(id, course.lessons);

  // set page title
  document.title = course.title + ' | LearnSpark';

  // breadcrumb
  var bc = document.getElementById('course-title-breadcrumb');
  if (bc) bc.textContent = course.title;

  // hero details
  setText('course-cat-tag',    course.catLabel);
  setText('course-title',      course.title);
  setText('course-desc',       course.desc);
  setText('course-lessons',    course.lessons);
  setText('course-duration',   course.duration);
  setText('course-level',      course.level);
  setText('course-rating',     course.rating);

  // hero background
  var hero = document.getElementById('course-hero');
  if (hero) hero.style.background = 'linear-gradient(180deg, var(--bg2), var(--bg))';

  // enroll button
  var enrollBtn = document.getElementById('enroll-btn');
  if (enrollBtn) {
    if (enrolled.includes(id)) {
      enrollBtn.textContent = '✓ Enrolled';
      enrollBtn.style.background = 'rgba(34,197,94,0.2)';
      enrollBtn.style.boxShadow  = 'none';
    }
  }

  // continue button
  var contBtn = document.getElementById('continue-btn');
  if (contBtn) {
    contBtn.href = 'lesson.html?id=' + id + '&lesson=0';
    contBtn.textContent = done > 0 ? 'Continue Learning →' : 'Start Learning →';
  }

  // progress circle
  updateProgressCircle(pct, done, course.lessons);

  // roadmap
  renderRoadmap(lessons, done);

  // curriculum
  renderCurriculum(id, lessons, done);

  // overview
  renderOverview(course);
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ---- PROGRESS CIRCLE ----
function updateProgressCircle(pct, done, total) {
  var circle = document.getElementById('cp-fill-circle');
  var pctEl  = document.getElementById('cp-pct');
  var textEl = document.getElementById('cp-text');

  var circum = 263.9;
  var offset = circum - (pct / 100) * circum;

  if (circle) {
    circle.style.strokeDashoffset = offset;
    // add gradient def
    var svg = circle.closest('svg');
    if (svg && !svg.querySelector('defs')) {
      svg.insertAdjacentHTML('afterbegin',
        '<defs><linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#7c3aed"/>' +
        '<stop offset="100%" stop-color="#a855f7"/>' +
        '</linearGradient></defs>'
      );
    }
  }

  if (pctEl)  pctEl.textContent  = pct + '%';
  if (textEl) textEl.textContent = done + ' of ' + total + ' lessons done';
}

// ---- ROADMAP ----
function renderRoadmap(lessons, done) {
  var wrap = document.getElementById('roadmap-wrap');
  if (!wrap) return;

  var html = '';

  lessons.forEach(function(lesson, i) {
    var status   = i < done ? 'completed' : (i === done ? 'current' : 'locked');
    var icon     = i < done ? '✅' : (i === done ? '▶️' : '🔒');
    var statusTxt = i < done ? 'Completed' : (i === done ? 'Current Lesson' : 'Locked');
    var connClass = i < done ? 'done' : '';

    html += '<div class="roadmap-node-wrap">' +
      '<div class="roadmap-node ' + status + '" onclick="goToLesson(' + i + ')">' +
        '<div class="rn-icon">' + icon + '</div>' +
        '<div class="rn-title">' + lesson.title + '</div>' +
        '<div class="rn-status">' + statusTxt + ' · ' + lesson.dur + '</div>' +
      '</div>';

    if (i < lessons.length - 1) {
      html += '<div class="roadmap-connector ' + connClass + '"></div>';
    }

    html += '</div>';
  });

  wrap.innerHTML = html;
}

function goToLesson(index) {
  var id = getCourseId();
  window.location.href = 'lesson.html?id=' + id + '&lesson=' + index;
}

// ---- CURRICULUM ----
function renderCurriculum(courseId, lessons, done) {
  var el = document.getElementById('curriculum-list');
  if (!el) return;

  el.innerHTML = lessons.map(function(lesson, i) {
    var isDone   = i < done;
    var isLocked = i > done;

    return '<a href="lesson.html?id=' + courseId + '&lesson=' + i + '" class="cur-item ' + (isDone ? 'completed' : '') + '">' +
      '<div class="cur-num">' + (isDone ? '<i class="fas fa-check"></i>' : (i + 1)) + '</div>' +
      '<div class="cur-info">' +
        '<strong>' + lesson.title + '</strong>' +
        '<span>Lesson ' + (i + 1) + ' · ' + lesson.dur + '</span>' +
      '</div>' +
      '<div class="cur-meta">' +
        '<span><i class="fas fa-clock"></i> ' + lesson.dur + '</span>' +
        (isDone
          ? '<span class="cur-check"><i class="fas fa-check-circle"></i></span>'
          : (isLocked ? '<span class="cur-lock"><i class="fas fa-lock"></i></span>' : '')) +
      '</div>' +
    '</a>';
  }).join('');
}

// ---- OVERVIEW ----
function renderOverview(course) {
  var left  = document.getElementById('overview-left');
  var right = document.getElementById('what-learn');

  if (left) {
    left.innerHTML =
      '<p>This course covers everything you need to know about <strong>' + course.title + '</strong>. ' +
      'Whether you\'re a complete beginner or looking to level up, this course has structured lessons designed to take you from zero to confident.</p>' +
      '<p>Each lesson is short and focused — designed to fit into your day without overwhelming you. By the end of this course, you\'ll be able to build real-world projects with confidence.</p>' +
      '<p><strong>Level:</strong> ' + course.level + '<br>' +
      '<strong>Duration:</strong> ' + course.duration + '<br>' +
      '<strong>Lessons:</strong> ' + course.lessons + '</p>';
  }

  if (right) {
    right.innerHTML = '<h4>📌 What You\'ll Learn</h4>' +
      '<ul>' +
      course.topics.map(function(t) { return '<li>' + t + '</li>'; }).join('') +
      '</ul>';
  }
}

// ---- ENROLL BUTTON ----
function enrollCourse() {
  var id       = getCourseId();
  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');

  if (!enrolled.includes(id)) {
    enrolled.push(id);
    localStorage.setItem('ls_enrolled', JSON.stringify(enrolled));

    var btn = document.getElementById('enroll-btn');
    if (btn) {
      btn.textContent = '✓ Enrolled';
      btn.style.background = 'rgba(34,197,94,0.2)';
      btn.style.boxShadow  = 'none';
    }

    // go to first lesson
    window.location.href = 'lesson.html?id=' + id + '&lesson=0';
  } else {
    window.location.href = 'lesson.html?id=' + id + '&lesson=0';
  }
}

// ---- COURSE TAB SWITCHING ----
function showCourseTab(tab, btn) {
  document.querySelectorAll('.course-tab-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.ctab').forEach(function(b) {
    b.classList.remove('active');
  });

  var el = document.getElementById('ctab-' + tab);
  if (el)  el.classList.add('active');
  if (btn) btn.classList.add('active');
}

function showRoadmap() {
  var btn = document.querySelector('.ctab');
  showCourseTab('roadmap', btn);
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', initCoursePage);