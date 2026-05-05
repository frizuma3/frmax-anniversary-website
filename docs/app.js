// EDIT THIS DATE/TIME when you know the exact anniversary day.
// Format: YYYY-MM-DDTHH:mm:ss+timezone. Example below is 19 September 2026 at 12 noon UK time.
const ANNIVERSARY_DATE = '2026-10-17T12:00:00+01:00';

const felicitationForm = document.getElementById('felicitationForm');
const statusBox = document.getElementById('status');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpStatus = document.getElementById('rsvpStatus');

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `status ${type}`.trim();
}

if (felicitationForm) {
  felicitationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(statusBox, 'Submitting your message...');

    const formData = new FormData(felicitationForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');

      felicitationForm.reset();
      setStatus(statusBox, 'Thank you. Your felicitation has been submitted successfully.', 'success');
    } catch (error) {
      setStatus(statusBox, error.message, 'error');
    }
  });
}

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(rsvpStatus, 'Submitting your RSVP...');

    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');

      rsvpForm.reset();
      setStatus(rsvpStatus, 'Thank you. Your RSVP has been submitted successfully.', 'success');
    } catch (error) {
      setStatus(rsvpStatus, error.message, 'error');
    }
  });
}

const verseList = [
  { text: '“You are a priest forever, according to the order of Melchizedek.”', ref: 'Psalm 110:4' },
  { text: '“I will give you shepherds after my own heart.”', ref: 'Jeremiah 3:15' },
  { text: '“Feed the flock of God that is among you.”', ref: '1 Peter 5:2' },
  { text: '“The harvest is plentiful, but the labourers are few.”', ref: 'Luke 10:2' },
  { text: '“Yes, I know what plans I have in mind for you, Yahweh declares.”', ref: 'Jer. 29:11' },
  { text: '“I have found David my servant and anoint him with my holy oil.”', ref: 'Psalm 89:20' },
  { text: '“My help comes from the Lord who made heaven and earth.”', ref: 'Psalm 121:2' }
];

let verseIndex = 0;
const verseText = document.getElementById('bibleVerse');
const verseReference = document.getElementById('bibleReference');

setInterval(() => {
  if (!verseText || !verseReference) return;
  verseIndex = (verseIndex + 1) % verseList.length;
  verseText.classList.add('fade-out');
  verseReference.classList.add('fade-out');
  setTimeout(() => {
    verseText.textContent = verseList[verseIndex].text;
    verseReference.textContent = verseList[verseIndex].ref;
    verseText.classList.remove('fade-out');
    verseReference.classList.remove('fade-out');
  }, 450);
}, 5500);

function updateCountdown() {
  const target = new Date(ANNIVERSARY_DATE).getTime();
  const now = Date.now();
  const distance = target - now;
  const label = document.getElementById('countdownDateLabel');

  if (label) {
    label.textContent = `Celebration date: ${new Date(ANNIVERSARY_DATE).toLocaleString()}`;
  }

  const ids = ['days', 'hours', 'minutes', 'seconds'];
  if (distance <= 0) {
    ids.forEach(id => document.getElementById(id).textContent = '00');
    if (label) label.textContent = 'The anniversary celebration day has arrived.';
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);




// Gregorian Chant Playlist

const tracks = [
  "audio/04Track4.mp3",
  "audio/Thanksgiving-of-Amazing-Grace.mp3",
  "audio/02Track2.mp3",
  "audio/05Track5.mp3",
  "audio/06Track6.mp3",
  "audio/Ekene-diri-Chukwu.mp3",
  "audio/Lord-I-come-with-my-gifts.mp3",
  "audio/My-story.mp3",
 
];

let currentTrack = 0;

const audioPlayer = document.getElementById("chantAudio");
const musicToggle = document.getElementById("musicToggle");
const nextTrack = document.getElementById("nextTrack");
const nowPlaying = document.getElementById("nowPlaying");

function loadTrack(index) {
  audioPlayer.src = tracks[index];

  const filename = tracks[index]
    .split("/")
    .pop()
    .replace(".mp3", "")
    .replace(/-/g, " ");

  nowPlaying.textContent = "Now Playing: " + filename;
}

loadTrack(currentTrack);

musicToggle.addEventListener("click", async () => {
  if (audioPlayer.paused) {
    await audioPlayer.play();
    musicToggle.textContent = "Pause Music";
  } else {
    audioPlayer.pause();
    musicToggle.textContent = "Play Music";
  }
});

nextTrack.addEventListener("click", () => {
  currentTrack++;

  if (currentTrack >= tracks.length) {
    currentTrack = 0;
  }

  loadTrack(currentTrack);
  audioPlayer.play();

  musicToggle.textContent = "Pause Music";
});

audioPlayer.addEventListener("ended", () => {
  currentTrack++;

  if (currentTrack >= tracks.length) {
    currentTrack = 0;
  }

  loadTrack(currentTrack);
  audioPlayer.play();
});