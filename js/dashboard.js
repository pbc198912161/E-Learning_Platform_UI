/*
  LearnSpark - dashboard.js
  Dashboard: streak, stats, badges, analytics,
             weekly chart, heatmap, mood
*/

// ---- STREAK SYSTEM ----
function updateStreak() {
  var today     = new Date().toDateString();
  var lastVisit = localStorage.getItem('ls_last_visit');
  var streak    = parseInt(localStorage.getItem('ls_streak') || '0');

  if (lastVisit === today) {
    // already visited today, keep streak
  } else if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
    // visited yesterday — increase streak
    streak++;
    localStorage.setItem('ls_streak', streak);
    localStorage.setItem('ls_last_visit', today);
  } else {
    // missed a day — reset
    streak = 1;
    localStorage.setItem('ls_streak', streak);
    localStorage.setItem('ls_last_visit', today);
  }

  var el = document.getElementById('streak-count');
  if (el) el.textContent = streak;
}

// ---- TIME GREETING ----
function setGreeting() {
  var hour = new Date().getHours();
  var greet = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  var el = document.getElementById('time-greeting');
  if (el) el.textContent = greet;
}

// ---- QUICK STATS ----
function updateQuickStats() {
  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');
  var lessons  = 0;
  var hours    = 0;

  enrolled.forEach(function(id) {
    var done = progress[id] || 0;
    var course = COURSES.find(function(c) { return c.id === id; });
    if (course) {
      lessons += done;
      hours   += parseFloat(course.duration) * (done / course.lessons);
    }
  });

  var badges = JSON.parse(localStorage.getItem('ls_badges') || '[]');

  var el1 = document.getElementById('total-lessons');
  var el2 = document.getElementById('courses-enrolled');
  var el3 = document.getElementById('hours-learned');
  var el4 = document.getElementById('badges-earned');

  if (el1) el1.textContent = lessons;
  if (el2) el2.textContent = enrolled.length;
  if (el3) el3.textContent = hours.toFixed(1) + 'h';
  if (el4) el4.textContent = badges.length;
}

// ---- IN-PROGRESS COURSES ----
function renderInProgress() {
  var list     = document.getElementById('in-progress-list');
  if (!list) return;

  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');

  if (enrolled.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);font-size:0.88rem;">No courses enrolled yet. <a href="index.html#courses">Browse courses →</a></p>';
    return;
  }

  list.innerHTML = enrolled.map(function(id) {
    var course = COURSES.find(function(c) { return c.id === id; });
    if (!course) return '';

    var done = progress[id] || 0;
    var pct  = Math.round((done / course.lessons) * 100);

    return '<a class="progress-item" href="course.html?id=' + id + '">' +
      '<div class="progress-item-icon">' + course.emoji + '</div>' +
      '<div class="progress-item-info">' +
        '<strong>' + course.title + '</strong>' +
        '<span>' + done + ' of ' + course.lessons + ' lessons</span>' +
        '<div class="item-progress-bar">' +
          '<div class="item-progress-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
      '</div>' +
      '<div class="progress-item-pct">' + pct + '%</div>' +
    '</a>';
  }).join('');
}

// ---- WEEK CHART ----
function renderWeekChart() {
  var chart = document.getElementById('week-chart');
  if (!chart) return;

  var days    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var today   = new Date().getDay();
  var activity = JSON.parse(localStorage.getItem('ls_weekly') || '[0,0,0,0,0,0,0]');

  chart.innerHTML = days.map(function(day, i) {
    var val    = activity[i] || 0;
    var maxH   = 80;
    var height = Math.max(4, (val / 5) * maxH);
    var isToday = i === today;

    return '<div class="week-bar-wrap">' +
      '<div class="week-bar ' + (isToday ? 'today' : '') + '" style="height:' + height + 'px;"></div>' +
      '<span class="week-label">' + day + '</span>' +
    '</div>';
  }).join('');
}

// ---- SUBJECT BARS ----
function renderSubjectBars() {
  var el = document.getElementById('subject-bars');
  if (!el) return;

  var subjects = [
    { name: 'Web Development', pct: 75, color: 'linear-gradient(90deg,#7c3aed,#a855f7)' },
    { name: 'Python',          pct: 45, color: 'linear-gradient(90deg,#06b6d4,#0891b2)' },
    { name: 'AI & ML',         pct: 30, color: 'linear-gradient(90deg,#f59e0b,#d97706)' },
    { name: 'Cybersecurity',   pct: 20, color: 'linear-gradient(90deg,#ef4444,#dc2626)' },
    { name: 'Design',          pct: 60, color: 'linear-gradient(90deg,#22c55e,#16a34a)' }
  ];

  el.innerHTML = subjects.map(function(s) {
    return '<div class="subject-row">' +
      '<div class="subject-row-top">' +
        '<span>' + s.name + '</span>' +
        '<span>' + s.pct + '%</span>' +
      '</div>' +
      '<div class="subject-bar-bg">' +
        '<div class="subject-bar-fill" style="width:' + s.pct + '%;background:' + s.color + ';"></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ---- QUIZ STATS ----
function renderQuizStats() {
  var el = document.getElementById('quiz-stats');
  if (!el) return;

  var stats = [
    { label: 'Average Score',      val: '82%' },
    { label: 'Quizzes Completed',  val: '14' },
    { label: 'Perfect Scores',     val: '3' },
    { label: 'Questions Answered', val: '126' }
  ];

  el.innerHTML = stats.map(function(s) {
    return '<div class="quiz-row">' +
      '<span>' + s.label + '</span>' +
      '<strong>' + s.val + '</strong>' +
    '</div>';
  }).join('');
}

// ---- HEATMAP ----
function renderHeatmap() {
  var el = document.getElementById('heatmap');
  if (!el) return;

  var cells = '';
  for (var i = 0; i < 84; i++) {
    var level = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
    cells += '<div class="heatmap-cell level-' + level + '" title="Day ' + (i+1) + '"></div>';
  }
  el.innerHTML = cells;
}

// ---- BADGES ----
var ALL_BADGES = [
  { id: 'first_step',   emoji: '👟', name: 'First Step',     desc: 'Completed your first lesson',      earned: true  },
  { id: 'fast_learner', emoji: '⚡', name: 'Fast Learner',   desc: 'Finished a lesson in under 10 min', earned: true  },
  { id: 'quiz_master',  emoji: '🧠', name: 'Quiz Master',    desc: 'Scored 100% on a quiz',             earned: false },
  { id: 'half_way',     emoji: '🌗', name: 'Half Way There', desc: 'Reached 50% on any course',         earned: true  },
  { id: 'streak_7',     emoji: '🔥', name: '7 Day Streak',   desc: 'Learned 7 days in a row',           earned: false },
  { id: 'completer',    emoji: '🏆', name: 'Course Completer','desc':'Finished your first full course', earned: false },
  { id: 'night_owl',    emoji: '🦉', name: 'Night Owl',      desc: 'Studied after midnight',            earned: false },
  { id: 'bookworm',     emoji: '📚', name: 'Bookworm',       desc: 'Read 5 lessons in reading mode',    earned: false }
];

function renderBadges() {
  var el = document.getElementById('badges-grid');
  if (!el) return;

  var earned = JSON.parse(localStorage.getItem('ls_badges') || '[]');

  el.innerHTML = ALL_BADGES.map(function(b) {
    var isEarned = b.earned || earned.includes(b.id);
    return '<div class="badge-item ' + (isEarned ? 'earned' : 'locked') + '">' +
      '<div class="badge-emoji">' + b.emoji + '</div>' +
      '<div class="badge-name">' + b.name + '</div>' +
      '<div class="badge-desc">' + b.desc + '</div>' +
    '</div>';
  }).join('');
}

// ---- MY COURSES ----
function renderMyCourses() {
  var el = document.getElementById('my-courses-list');
  if (!el) return;

  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');

  if (enrolled.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;">You haven\'t enrolled in any course yet. <a href="index.html#courses">Browse courses →</a></p>';
    return;
  }

  el.innerHTML = enrolled.map(function(id) {
    var course = COURSES.find(function(c) { return c.id === id; });
    if (!course) return '';

    var done = progress[id] || 0;
    var pct  = Math.round((done / course.lessons) * 100);

    return '<div class="my-course-row">' +
      '<div class="my-course-icon">' + course.emoji + '</div>' +
      '<div class="my-course-info">' +
        '<strong>' + course.title + '</strong>' +
        '<span>' + course.catLabel + ' · ' + course.level + '</span>' +
      '</div>' +
      '<div class="my-course-bar">' +
        '<div class="my-bar-label"><span>Progress</span><span>' + pct + '%</span></div>' +
        '<div class="my-bar-track"><div class="my-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<a href="lesson.html?id=' + id + '" class="my-course-btn">Continue →</a>' +
    '</div>';
  }).join('');
}

// ---- DASHBOARD MOOD ----
function dashMood(btn, mood) {
  document.querySelectorAll('.mood-pill').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');

  var data = {
    focused:   'You\'re focused! Try AI & ML or Cybersecurity for deep learning sessions. 🎯',
    motivated: 'Great energy! Start something new — React.js or Python are perfect right now. 🚀',
    tired:     'Low energy? Try short lessons under 10 minutes. Prompt Engineering is a good pick! 😴',
    stressed:  'Take it slow. UI/UX Design or HTML & CSS will keep things light and creative. 🧘'
  };

  var result = document.getElementById('dash-mood-result');
  if (result) {
    result.textContent = data[mood];
    result.classList.remove('hidden');
  }

  localStorage.setItem('ls_mood', mood);
}

// ---- TAB SWITCHING ----
function showTab(tab, link) {
  // hide all tabs
  document.querySelectorAll('.dash-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  // remove active from links
  document.querySelectorAll('.dash-link').forEach(function(l) {
    l.classList.remove('active');
  });

  // show selected
  var tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  if (link)  link.classList.add('active');

  // prevent default href navigation
  return false;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  updateStreak();
  setGreeting();
  updateQuickStats();
  renderInProgress();
  renderWeekChart();
  renderSubjectBars();
  renderQuizStats();
  renderHeatmap();
  renderBadges();
  renderMyCourses();

  // restore mood
  var savedMood = localStorage.getItem('ls_mood');
  if (savedMood) {
    var btn = document.querySelector('.mood-pill[data-mood="' + savedMood + '"]');
    if (btn) dashMood(btn, savedMood);
  }

  // add demo weekly activity if empty
  var weekly = localStorage.getItem('ls_weekly');
  if (!weekly) {
    localStorage.setItem('ls_weekly', JSON.stringify([1,3,2,4,2,5,1]));
    renderWeekChart();
  }
});