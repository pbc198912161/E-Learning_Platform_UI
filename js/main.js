/*
  LearnSpark - main.js
  Shared across all pages
  Navbar scroll, hamburger, course data, mood picker
*/

// ---- NAVBAR SCROLL ----
var navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ---- HAMBURGER ----
function toggleNav() {
  var links = document.getElementById('nav-links');
  if (links) links.classList.toggle('open');
}

// ---- COURSE DATA (shared across pages) ----
var COURSES = [
  {
    id: 'js-basics',
    title: 'JavaScript Fundamentals',
    category: 'webdev',
    catLabel: 'Web Dev',
    desc: 'Master the core concepts of JavaScript — variables, functions, DOM, events, ES6 and more.',
    emoji: '🟨',
    bg: 'linear-gradient(135deg,#1a1a00,#3a3a00)',
    lessons: 12,
    duration: '6h',
    level: 'beginner',
    rating: 4.9,
    topics: ['Variables & Data Types','Functions & Scope','DOM Manipulation','Events','ES6 Features','Async JS'],
    videoId: 'PkZNo7MFNFg'
  },
  {
    id: 'html-css',
    title: 'HTML & CSS Complete',
    category: 'webdev',
    catLabel: 'Web Dev',
    desc: 'Build beautiful, responsive websites from scratch. Flexbox, Grid, animations and more.',
    emoji: '🌐',
    bg: 'linear-gradient(135deg,#0a0a2e,#1a0a3e)',
    lessons: 10,
    duration: '5h',
    level: 'beginner',
    rating: 4.8,
    topics: ['HTML5 Basics','CSS Selectors','Flexbox','Grid','Responsive Design','Animations'],
    videoId: 'qz0aGYrrlhU'
  },
  {
    id: 'react-intro',
    title: 'React.js for Beginners',
    category: 'webdev',
    catLabel: 'Web Dev',
    desc: 'Learn React from zero. Components, hooks, state management and building real apps.',
    emoji: '⚛️',
    bg: 'linear-gradient(135deg,#001a2e,#002a4e)',
    lessons: 15,
    duration: '8h',
    level: 'intermediate',
    rating: 4.9,
    topics: ['JSX','Components','Props & State','Hooks','Context API','React Router'],
    videoId: 'bMknfKXIFA8'
  },
  {
    id: 'python-basics',
    title: 'Python Programming',
    category: 'python',
    catLabel: 'Python',
    desc: 'Start your programming journey with Python. Clean, simple and powerful.',
    emoji: '🐍',
    bg: 'linear-gradient(135deg,#0a1a00,#1a3a00)',
    lessons: 14,
    duration: '7h',
    level: 'beginner',
    rating: 4.8,
    topics: ['Syntax','Data Types','Loops','Functions','OOP','File Handling'],
    videoId: '_uQrJ0TkZlc'
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    category: 'ai',
    catLabel: 'AI & ML',
    desc: 'Understand how AI works, build your first ML models, and explore neural networks.',
    emoji: '🤖',
    bg: 'linear-gradient(135deg,#1a001a,#3a003a)',
    lessons: 18,
    duration: '10h',
    level: 'intermediate',
    rating: 4.7,
    topics: ['ML Concepts','Supervised Learning','Neural Networks','NLP Basics','Model Training','AI Ethics'],
    videoId: 'GwIo3gDZCVQ'
  },
  {
    id: 'prompt-eng',
    title: 'Prompt Engineering',
    category: 'ai',
    catLabel: 'AI & ML',
    desc: 'Master the art of writing effective prompts. Get better outputs from any AI model.',
    emoji: '💬',
    bg: 'linear-gradient(135deg,#001a1a,#003a3a)',
    lessons: 8,
    duration: '4h',
    level: 'beginner',
    rating: 4.9,
    topics: ['Prompt Basics','Chain of Thought','Few-Shot Learning','JSON Prompts','Claude CLI','AI Agents'],
    videoId: 'T9aRN5JkmL8'
  },
  {
    id: 'ui-design',
    title: 'UI/UX Design Fundamentals',
    category: 'design',
    catLabel: 'Design',
    desc: 'Design beautiful interfaces. Learn color theory, typography, wireframing and Figma.',
    emoji: '🎨',
    bg: 'linear-gradient(135deg,#1a0a00,#3a1a00)',
    lessons: 11,
    duration: '6h',
    level: 'beginner',
    rating: 4.8,
    topics: ['Design Principles','Color Theory','Typography','Wireframing','Figma Basics','Prototyping'],
    videoId: 'c9Wg6Cb_YlU'
  },
  {
    id: 'cybersec',
    title: 'Cybersecurity Essentials',
    category: 'cyber',
    catLabel: 'Cybersecurity',
    desc: 'Understand ethical hacking, network security, tools like Wireshark, Nmap and more.',
    emoji: '🔐',
    bg: 'linear-gradient(135deg,#1a0000,#3a0000)',
    lessons: 16,
    duration: '9h',
    level: 'intermediate',
    rating: 4.7,
    topics: ['Networking Basics','Ethical Hacking','Wireshark','Nmap','Cryptography','Pen Testing'],
    videoId: 'hXSFdwIIsXc'
  }
];

// store selected filter
var currentFilter = 'all';
var currentSearch = '';

// ---- RENDER COURSE GRID (index.html) ----
function renderCourses() {
  var grid = document.getElementById('course-grid');
  if (!grid) return;

  var enrolled = JSON.parse(localStorage.getItem('ls_enrolled') || '[]');
  var progress  = JSON.parse(localStorage.getItem('ls_progress') || '{}');

  var filtered = COURSES.filter(function(c) {
    var matchCat    = currentFilter === 'all' || c.category === currentFilter;
    var matchSearch = c.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
                      c.catLabel.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;padding:2rem 0;">No courses found. Try a different search.</p>';
    return;
  }

  grid.innerHTML = filtered.map(function(c) {
    var isEnrolled = enrolled.includes(c.id);
    var pct        = progress[c.id] ? Math.round((progress[c.id] / c.lessons) * 100) : 0;

    return '<a class="course-card" href="course.html?id=' + c.id + '">' +
      '<div class="course-thumb" style="background:' + c.bg + '">' +
        (isEnrolled ? '<span class="enrolled-badge">Enrolled</span>' : '') +
        '<span style="position:relative;z-index:1;">' + c.emoji + '</span>' +
      '</div>' +
      '<div class="course-body">' +
        '<div class="course-cat">' + c.catLabel + '</div>' +
        '<div class="course-card-title">' + c.title + '</div>' +
        '<div class="course-card-desc">' + c.desc + '</div>' +
        (isEnrolled ?
          '<div class="card-progress-bar"><div class="card-progress-fill" style="width:' + pct + '%"></div></div>' : '') +
        '<div class="course-card-footer">' +
          '<div class="course-meta-small">' +
            '<span><i class="fas fa-book-open"></i> ' + c.lessons + ' lessons</span>' +
            '<span><i class="fas fa-clock"></i> ' + c.duration + '</span>' +
          '</div>' +
          '<span class="course-level-badge level-' + c.level + '">' + c.level + '</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }).join('');
}

function filterCourses() {
  currentSearch = document.getElementById('search-input').value;
  renderCourses();
}

function setFilter(btn, cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  renderCourses();
}

// ---- MOOD PICKER (index.html) ----
var moodData = {
  focused: {
    icon: '🎯',
    title: 'Great for deep focus!',
    desc: "You're in the zone. We recommend deep-dive courses like AI & ML or Cybersecurity today."
  },
  motivated: {
    icon: '🚀',
    title: 'Let\'s go!',
    desc: 'Your energy is high. Perfect time to start something new — try React or Python today.'
  },
  tired: {
    icon: '😴',
    title: 'Keep it light!',
    desc: 'Low energy? Try short courses under 5 hours like Prompt Engineering or UI/UX Design.'
  },
  stressed: {
    icon: '🧘',
    title: 'Take it slow.',
    desc: 'Try a short creative course like UI/UX Design. Small wins reduce stress effectively.'
  }
};

function pickMood(btn, mood) {
  document.querySelectorAll('.mood-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');

  var data = moodData[mood];
  var sug  = document.getElementById('mood-suggestion');
  var ph   = document.getElementById('mood-placeholder');

  if (sug) {
    document.getElementById('mood-icon').textContent  = data.icon;
    document.getElementById('mood-title').textContent = data.title;
    document.getElementById('mood-desc').textContent  = data.desc;
    sug.classList.remove('hidden');
  }

  if (ph) ph.classList.add('hidden');

  // save mood
  localStorage.setItem('ls_mood', mood);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  renderCourses();

  // restore saved mood
  var savedMood = localStorage.getItem('ls_mood');
  if (savedMood) {
    var btn = document.querySelector('.mood-btn[data-mood="' + savedMood + '"]');
    if (btn) pickMood(btn, savedMood);
  }
});