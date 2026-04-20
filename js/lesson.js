/*
  LearnSpark - lesson.js
  Lesson page:
  video, reading mode, timestamp notes,
  focus mode, pomodoro, AI companion,
  progress tracking, badges
*/

// ---- URL PARAMS ----
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

var courseId    = getParam('id')     || 'js-basics';
var lessonIndex = parseInt(getParam('lesson') || '0');

// ---- LESSON CONTENT (reading mode) ----
var LESSON_CONTENT = {
  0: {
    title: 'Introduction to JavaScript',
    content:
      '<h2>What is JavaScript?</h2>' +
      '<p>JavaScript is a lightweight, interpreted programming language with first-class functions. It is most well-known as the scripting language for Web pages, but it\'s also used in many non-browser environments.</p>' +
      '<h3>Why Learn JavaScript?</h3>' +
      '<p>JavaScript is the only programming language that runs natively in all web browsers. If you want to build interactive websites, JavaScript is <code>essential</code>.</p>' +
      '<h3>Your First Program</h3>' +
      '<pre><code>// This is a comment\nconsole.log("Hello, World!");\n\n// Variables\nvar name = "Learner";\nlet age = 20;\nconst PI = 3.14;\n\nconsole.log("Hello " + name);</code></pre>' +
      '<p>Run this code in your browser\'s developer console (press F12) to see the output.</p>'
  },
  1: {
    title: 'Variables & Data Types',
    content:
      '<h2>Variables in JavaScript</h2>' +
      '<p>Variables are containers for storing data. JavaScript has three ways to declare variables: <code>var</code>, <code>let</code>, and <code>const</code>.</p>' +
      '<h3>Data Types</h3>' +
      '<pre><code>// String\nlet name = "Bharath";\n\n// Number\nlet age = 21;\n\n// Boolean\nlet isStudent = true;\n\n// Undefined\nlet x;\n\n// Null\nlet y = null;\n\n// Object\nlet person = { name: "Bharath", age: 21 };\n\n// Array\nlet skills = ["HTML", "CSS", "JS"];</code></pre>' +
      '<p>Use <code>typeof</code> to check the type of any variable.</p>'
  }
};

function getLessonContent(index) {
  if (LESSON_CONTENT[index]) return LESSON_CONTENT[index];
  return {
    title: 'Lesson ' + (index + 1),
    content:
      '<h2>Lesson ' + (index + 1) + '</h2>' +
      '<p>Switch to <strong>Video Mode</strong> to watch this lesson. ' +
      'Reading notes for this lesson will be added soon.</p>'
  };
}

// ---- INIT LESSON ----
function initLesson() {
  var course = COURSES.find(function(c) { return c.id === courseId; });
  if (!course) { window.location.href = 'index.html'; return; }

  var lessons = getLessonsData(course);
  var lesson  = lessons[lessonIndex] || lessons[0];

  // set topbar
  setText('topbar-course', course.title);
  setText('topbar-lesson',  lesson.title);

  // set sidebar course name
  setText('sidebar-course-name', course.title);

  // set progress bar
  var pct  = Math.round((lessonIndex / lessons.length) * 100);
  var fill = document.getElementById('lesson-progress-fill');
  if (fill) fill.style.width = pct + '%';
  setText('topbar-progress', (lessonIndex + 1) + ' / ' + lessons.length + ' lessons');

  // ---- SET VIDEO — this is the key fix ----
  var iframe = document.getElementById('lesson-iframe');
  if (iframe) {
    // build clean embed URL with required parameters
    var videoSrc = 'https://www.youtube.com/embed/' +
      course.videoId +
      '?rel=0&modestbranding=1&enablejsapi=1&origin=' +
      window.location.origin;
    iframe.setAttribute('src', videoSrc);
  }

  // set reading content
  var readContent = document.getElementById('reading-content');
  if (readContent) {
    var content = getLessonContent(lessonIndex);
    readContent.innerHTML = content.content;
  }

  // render lesson list in sidebar
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');
  var done     = progress[courseId] || 0;
  renderLessonList(lessons, done);

  // prev / next button visibility
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');

  if (prevBtn) {
    prevBtn.style.visibility = lessonIndex === 0 ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    nextBtn.innerHTML = lessonIndex >= lessons.length - 1
      ? 'Finish Course <i class="fas fa-flag-checkered"></i>'
      : 'Next <i class="fas fa-arrow-right"></i>';
  }

  // load saved notes for this lesson
  loadNotes();
}

// ---- HELPER: get lessons array for a course ----
function getLessonsData(course) {
  if (LESSON_DATA[course.id]) return LESSON_DATA[course.id];
  var arr = [];
  for (var i = 0; i < course.lessons; i++) {
    arr.push({ title: 'Lesson ' + (i + 1), dur: '10 min' });
  }
  return arr;
}

// ---- HELPER: set text content ----
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ---- LESSON LIST SIDEBAR ----
function renderLessonList(lessons, done) {
  var el = document.getElementById('lesson-list');
  if (!el) return;

  el.innerHTML = lessons.map(function(lesson, i) {
    var isDone    = i < done;
    var isCurrent = i === lessonIndex;
    var iconClass = isDone ? 'done' : (isCurrent ? 'active' : '');
    var icon      = isDone
      ? '<i class="fas fa-check"></i>'
      : (isCurrent ? '<i class="fas fa-play"></i>' : (i + 1));

    return '<div class="lesson-list-item ' + (isCurrent ? 'active' : '') +
      '" onclick="gotoLesson(' + i + ')">' +
      '<div class="lli-icon ' + iconClass + '">' + icon + '</div>' +
      '<div class="lli-info">' +
        '<div class="lli-title">' + lesson.title + '</div>' +
        '<div class="lli-dur">' + lesson.dur + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function gotoLesson(index) {
  window.location.href = 'lesson.html?id=' + courseId + '&lesson=' + index;
}

// ---- MARK COMPLETE ----
function markComplete() {
  var course   = COURSES.find(function(c) { return c.id === courseId; });
  var progress = JSON.parse(localStorage.getItem('ls_progress') || '{}');
  var current  = progress[courseId] || 0;

  // only advance if this lesson hasn't been marked yet
  if (lessonIndex >= current) {
    progress[courseId] = lessonIndex + 1;
    localStorage.setItem('ls_progress', JSON.stringify(progress));
  }

  // update weekly activity chart data
  var weekly = JSON.parse(localStorage.getItem('ls_weekly') || '[0,0,0,0,0,0,0]');
  var day    = new Date().getDay();
  weekly[day] = Math.min(5, (weekly[day] || 0) + 1);
  localStorage.setItem('ls_weekly', JSON.stringify(weekly));

  // check for badge unlocks
  checkBadges(progress[courseId], course);

  // update button appearance
  var btn = document.getElementById('complete-btn');
  if (btn) {
    btn.innerHTML    = '<i class="fas fa-check-circle"></i> Completed!';
    btn.style.background = 'rgba(34,197,94,0.2)';
    btn.style.boxShadow  = 'none';
    btn.style.color      = 'var(--green)';
    btn.style.border     = '1px solid rgba(34,197,94,0.3)';
  }
}

// ---- NEXT / PREV LESSON ----
function nextLesson() {
  var course  = COURSES.find(function(c) { return c.id === courseId; });
  var lessons = getLessonsData(course);

  markComplete();

  setTimeout(function() {
    if (lessonIndex < lessons.length - 1) {
      window.location.href = 'lesson.html?id=' + courseId + '&lesson=' + (lessonIndex + 1);
    } else {
      // all lessons done — go back to course page
      window.location.href = 'course.html?id=' + courseId;
    }
  }, 400);
}

function prevLesson() {
  if (lessonIndex > 0) {
    window.location.href = 'lesson.html?id=' + courseId + '&lesson=' + (lessonIndex - 1);
  }
}

// ---- BADGE SYSTEM ----
function checkBadges(done, course) {
  var earned = JSON.parse(localStorage.getItem('ls_badges') || '[]');

  // First lesson done
  if (done >= 1 && !earned.includes('first_step')) {
    earned.push('first_step');
    localStorage.setItem('ls_badges', JSON.stringify(earned));
    showBadgePopup('👟', 'First Step!');
    return;
  }

  // Half way through course
  if (done >= Math.floor(course.lessons / 2) && !earned.includes('half_way')) {
    earned.push('half_way');
    localStorage.setItem('ls_badges', JSON.stringify(earned));
    showBadgePopup('🌗', 'Half Way There!');
    return;
  }

  // Course completed
  if (done >= course.lessons && !earned.includes('completer')) {
    earned.push('completer');
    localStorage.setItem('ls_badges', JSON.stringify(earned));
    showBadgePopup('🏆', 'Course Completer!');
    return;
  }
}

function showBadgePopup(emoji, name) {
  var popup  = document.getElementById('badge-popup');
  var icon   = document.getElementById('badge-popup-icon');
  var nameEl = document.getElementById('badge-popup-name');

  if (popup)  popup.classList.remove('hidden');
  if (icon)   icon.textContent  = emoji;
  if (nameEl) nameEl.textContent = name;
}

function closeBadgePopup() {
  var popup = document.getElementById('badge-popup');
  if (popup) popup.classList.add('hidden');
}

// ---- VIDEO / READING MODE TOGGLE ----
var isReadingMode = false;

function toggleMode() {
  isReadingMode = !isReadingMode;

  var videoPanel   = document.getElementById('video-mode');
  var readingPanel = document.getElementById('reading-mode');
  var btn          = document.getElementById('mode-btn');

  if (isReadingMode) {
    videoPanel.classList.remove('active');
    readingPanel.classList.add('active');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-video"></i> <span>Video Mode</span>';
      btn.classList.add('active');
    }
  } else {
    videoPanel.classList.add('active');
    readingPanel.classList.remove('active');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-book"></i> <span>Read Mode</span>';
      btn.classList.remove('active');
    }
  }
}

// ---- FOCUS MODE ----
var isFocusMode = false;

function toggleFocus() {
  isFocusMode = !isFocusMode;
  document.body.classList.toggle('focus-mode', isFocusMode);

  var btn = document.getElementById('focus-btn');
  if (btn) btn.classList.toggle('active', isFocusMode);
}

// ---- SIDEBAR TOGGLE (mobile) ----
function toggleSidebar() {
  var sidebar = document.getElementById('lesson-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function closeSidebar() {
  var sidebar = document.getElementById('lesson-sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// ---- AI COMPANION ----
var aiOpen = false;

function toggleAI() {
  aiOpen = !aiOpen;
  var sidebar = document.getElementById('ai-sidebar');
  if (sidebar) sidebar.classList.toggle('open', aiOpen);
}

// ---- AI RESPONSE ENGINE ----
var lessonTopics = {
  'js-basics':   ['variables', 'functions', 'DOM manipulation', 'events', 'async/await'],
  'html-css':    ['HTML elements', 'CSS selectors', 'flexbox', 'grid', 'media queries'],
  'react-intro': ['components', 'props', 'state', 'hooks', 'JSX'],
  'python-basics':['variables', 'loops', 'functions', 'lists', 'OOP'],
  'ai-ml':       ['machine learning', 'neural networks', 'training data', 'models', 'AI ethics'],
  'prompt-eng':  ['prompt structure', 'chain of thought', 'few-shot prompting', 'AI agents', 'JSON prompts'],
  'ui-design':   ['color theory', 'typography', 'wireframing', 'Figma', 'prototyping'],
  'cybersec':    ['ethical hacking', 'networking', 'encryption', 'Wireshark', 'Nmap'],
  'default':     ['this concept', 'this topic', 'this feature']
};

function sendAIMessage() {
  var input    = document.getElementById('ai-input');
  var messages = document.getElementById('ai-messages');
  if (!input || !messages) return;

  var text = input.value.trim();
  if (!text) return;

  // add user message to chat
  messages.innerHTML +=
    '<div class="ai-msg user-msg">' +
      '<div class="msg-bubble">' + escapeHtml(text) + '</div>' +
    '</div>';

  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // show typing indicator
  var typingId = 'typing-' + Date.now();
  messages.innerHTML +=
    '<div class="ai-msg bot-msg ai-typing" id="' + typingId + '">' +
      '<div class="msg-bubble">Thinking</div>' +
    '</div>';
  messages.scrollTop = messages.scrollHeight;

  // simulate response after short delay
  setTimeout(function() {
    var typing = document.getElementById(typingId);
    if (typing) typing.remove();

    var topics   = lessonTopics[courseId] || lessonTopics['default'];
    var topic    = topics[Math.floor(Math.random() * topics.length)];
    var response = generateAIResponse(text, topic);

    messages.innerHTML +=
      '<div class="ai-msg bot-msg">' +
        '<div class="msg-bubble">' + response + '</div>' +
      '</div>';
    messages.scrollTop = messages.scrollHeight;
  }, 1200);
}

function generateAIResponse(question, topic) {
  var q = question.toLowerCase();

  if (q.includes('what is') || q.includes('explain') || q.includes('define') || q.includes('mean')) {
    return 'Great question! <strong>' + topic + '</strong> is one of the key concepts in this lesson. ' +
      'It refers to how your code interacts with data and the environment. ' +
      'Try breaking it down with a small example first — that\'s the fastest way to understand it!';
  }

  if (q.includes('how') || q.includes('use') || q.includes('work') || q.includes('implement')) {
    return 'To use <strong>' + topic + '</strong>, start with a simple example in your editor. ' +
      'The key is understanding the flow — how data moves through your code. ' +
      'Want me to give you a mini-challenge to try it hands-on?';
  }

  if (q.includes('why') || q.includes('important') || q.includes('need') || q.includes('benefit')) {
    return '<strong>' + topic + '</strong> is important because it makes your code more readable, ' +
      'efficient, and scalable. Real-world projects use this constantly. ' +
      'Once you get comfortable with it, you\'ll see it everywhere!';
  }

  if (q.includes('example') || q.includes('code') || q.includes('sample') || q.includes('show')) {
    return 'Here\'s the core idea for <strong>' + topic + '</strong>: ' +
      'start with the simplest possible version — just a few lines. ' +
      'Get that working first, then add complexity. ' +
      'Try writing it in your code editor right now while the video is fresh!';
  }

  if (q.includes('difference') || q.includes('vs') || q.includes('compare')) {
    return 'Good comparison question! With <strong>' + topic + '</strong>, the main difference is ' +
      'about how and when your code runs. One approach is synchronous, the other asynchronous. ' +
      'The best way to see this clearly is to run both versions side by side.';
  }

  return 'That\'s a thoughtful question about <strong>' + topic + '</strong>! ' +
    'The best approach is always hands-on practice. ' +
    'Try writing a small version based on what you just watched. ' +
    'If something specific is confusing, describe exactly which part and I\'ll break it down further!';
}

// prevent XSS in user messages
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- TIMESTAMP NOTES ----
var notesKey  = 'ls_notes_' + courseId + '_' + lessonIndex;
var fakeTime  = 0;

function addTimestampNote() {
  // simulate a timestamp incrementing through the video
  fakeTime += Math.floor(Math.random() * 60) + 15;
  var mins = Math.floor(fakeTime / 60);
  var secs = fakeTime % 60;
  var timestamp = mins + ':' + (secs < 10 ? '0' + secs : secs);

  var notesList = document.getElementById('notes-list');
  if (!notesList) return;

  // remove any existing input row first
  var existing = document.getElementById('note-input-row');
  if (existing) existing.remove();

  // inject input row
  var inputRow = document.createElement('div');
  inputRow.className = 'note-input-row';
  inputRow.id        = 'note-input-row';
  inputRow.innerHTML =
    '<input type="text" id="note-text-input" placeholder="Note at ' + timestamp + '..." />' +
    '<button class="note-save-btn" onclick="saveNote(\'' + timestamp + '\')">Save</button>';

  notesList.appendChild(inputRow);

  var noteInput = document.getElementById('note-text-input');
  if (noteInput) noteInput.focus();

  // allow saving with Enter key
  if (noteInput) {
    noteInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') saveNote(timestamp);
    });
  }
}

function saveNote(timestamp) {
  var input = document.getElementById('note-text-input');
  if (!input || !input.value.trim()) return;

  var notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
  notes.push({ time: timestamp, text: input.value.trim() });
  localStorage.setItem(notesKey, JSON.stringify(notes));

  var row = document.getElementById('note-input-row');
  if (row) row.remove();

  renderNotes();
}

function loadNotes() {
  renderNotes();
}

function renderNotes() {
  var el = document.getElementById('notes-list');
  if (!el) return;

  var notes = JSON.parse(localStorage.getItem(notesKey) || '[]');

  if (notes.length === 0) {
    el.innerHTML = '<p class="no-notes">No notes yet. Click "Add Note Here" while watching!</p>';
    return;
  }

  el.innerHTML = notes.map(function(note, i) {
    return '<div class="note-item">' +
      '<span class="note-timestamp" title="Note at ' + note.time + '">' + note.time + '</span>' +
      '<span class="note-text">' + escapeHtml(note.text) + '</span>' +
      '<button class="note-delete" onclick="deleteNote(' + i + ')" title="Delete note">' +
        '<i class="fas fa-trash-alt"></i>' +
      '</button>' +
    '</div>';
  }).join('');
}

function deleteNote(index) {
  var notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
  notes.splice(index, 1);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderNotes();
}

// ---- POMODORO TIMER ----
var pomoRunning  = false;
var pomoIsBreak  = false;
var pomoSeconds  = 25 * 60;
var pomoTotal    = 25 * 60;
var pomoInterval = null;

function openPomo() {
  var overlay = document.getElementById('pomo-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function togglePomo() {
  if (pomoRunning) {
    // pause
    clearInterval(pomoInterval);
    pomoRunning = false;
    updatePomoBtn(false);
  } else {
    // start / resume
    var overlay = document.getElementById('pomo-overlay');
    if (overlay) overlay.classList.remove('hidden');

    pomoRunning = true;
    updatePomoBtn(true);

    pomoInterval = setInterval(function() {
      if (pomoSeconds > 0) {
        pomoSeconds--;
        updatePomoDisplay();
      } else {
        // timer done — switch modes
        clearInterval(pomoInterval);
        pomoRunning = false;
        updatePomoBtn(false);

        if (!pomoIsBreak) {
          // switch to break
          pomoIsBreak = true;
          pomoSeconds = 5 * 60;
          pomoTotal   = 5 * 60;
        } else {
          // switch back to focus
          pomoIsBreak = false;
          pomoSeconds = 25 * 60;
          pomoTotal   = 25 * 60;
        }

        updatePomoLabel();
        updatePomoDisplay();
      }
    }, 1000);
  }
}

function updatePomoDisplay() {
  var mins = Math.floor(pomoSeconds / 60);
  var secs = pomoSeconds % 60;
  var str  = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

  var disp = document.getElementById('pomo-display');
  var big  = document.getElementById('pomo-timer-big');
  var fill = document.getElementById('pomo-progress-fill');

  if (disp) disp.textContent = str;
  if (big)  big.textContent  = str;

  var pct = ((pomoTotal - pomoSeconds) / pomoTotal) * 100;
  if (fill) fill.style.width = pct + '%';
}

function updatePomoBtn(running) {
  var btn  = document.getElementById('pomo-toggle-btn');
  var pBtn = document.getElementById('pomo-play-btn');

  if (btn)  btn.textContent = running ? '⏸' : '▶';
  if (pBtn) pBtn.innerHTML  = running
    ? '<i class="fas fa-pause"></i>'
    : '<i class="fas fa-play"></i>';
}

function updatePomoLabel() {
  var label = document.getElementById('pomo-mode-label');
  var note  = document.getElementById('pomo-note');

  if (pomoIsBreak) {
    if (label) label.textContent = '☕ Break Time!';
    if (note)  note.textContent  = 'Take a proper 5-minute break. Stand up, stretch, breathe.';
  } else {
    if (label) label.textContent = '🍅 Focus Time';
    if (note)  note.textContent  = 'Stay focused. 25 minutes of deep work.';
  }
}

function resetPomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoIsBreak = false;
  pomoSeconds = 25 * 60;
  pomoTotal   = 25 * 60;
  updatePomoDisplay();
  updatePomoBtn(false);
  updatePomoLabel();
}

function closePomo() {
  var overlay = document.getElementById('pomo-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ---- INIT on page load ----
document.addEventListener('DOMContentLoaded', initLesson);