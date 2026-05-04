const passwordInput = document.getElementById('adminPassword');
const loadButton = document.getElementById('loadDashboard');
const statusBox = document.getElementById('adminStatus');
const messagesList = document.getElementById('messagesList');
const rsvpList = document.getElementById('rsvpList');
const messageCount = document.getElementById('messageCount');
const rsvpCount = document.getElementById('rsvpCount');
const printButton = document.getElementById('printMessages');

let currentPassword = '';

function escapeHTML(text) {
  return String(text || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function formatDate(value) {
  return new Date(value + 'Z').toLocaleString();
}

async function postAdmin(url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: currentPassword })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to load dashboard.');
  return result;
}

async function loadDashboard() {
  currentPassword = passwordInput.value.trim();
  statusBox.textContent = 'Loading dashboard...';
  statusBox.className = 'status';
  messagesList.innerHTML = '';
  rsvpList.innerHTML = '';

  try {
    const [messagesResult, rsvpResult] = await Promise.all([
      postAdmin('/api/admin/messages'),
      postAdmin('/api/admin/rsvps')
    ]);

    const messages = messagesResult.messages || [];
    const rsvps = rsvpResult.rsvps || [];

    messageCount.textContent = `${messages.length} Message${messages.length === 1 ? '' : 's'}`;
    rsvpCount.textContent = `${rsvps.length} RSVP${rsvps.length === 1 ? '' : 's'}`;

    messagesList.innerHTML = messages.map(item => `
      <article class="message-card">
        <div class="message-top">
          <div>
            <h3>${escapeHTML(item.name)}</h3>
            <p>${escapeHTML(item.location || 'No location provided')}</p>
          </div>
          <span>${formatDate(item.created_at)}</span>
        </div>
        <p class="message-text">${escapeHTML(item.message).replace(/\n/g, '<br>')}</p>
        ${item.email ? `<p class="email">Email: ${escapeHTML(item.email)}</p>` : ''}
        <button class="delete-btn" onclick="deleteMessage(${item.id})">Delete</button>
      </article>
    `).join('') || '<p class="empty">No messages have been submitted yet.</p>';

    rsvpList.innerHTML = rsvps.map(item => `
      <article class="message-card rsvp-card">
        <div class="message-top">
          <div>
            <h3>${escapeHTML(item.name)}</h3>
            <p>${escapeHTML(item.attendance)}</p>
          </div>
          <span>${formatDate(item.created_at)}</span>
        </div>
        <p><strong>Number attending:</strong> ${escapeHTML(item.guest_count || 'Not provided')}</p>
        ${item.location ? `<p><strong>Parish / City:</strong> ${escapeHTML(item.location)}</p>` : ''}
        ${item.email ? `<p><strong>Email:</strong> ${escapeHTML(item.email)}</p>` : ''}
        ${item.phone ? `<p><strong>Phone:</strong> ${escapeHTML(item.phone)}</p>` : ''}
        ${item.note ? `<p class="message-text">${escapeHTML(item.note).replace(/\n/g, '<br>')}</p>` : ''}
        <button class="delete-btn" onclick="deleteRsvp(${item.id})">Delete</button>
      </article>
    `).join('') || '<p class="empty">No RSVP responses have been submitted yet.</p>';

    statusBox.textContent = '';
  } catch (error) {
    statusBox.textContent = error.message;
    statusBox.classList.add('error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  await fetch(`/api/admin/messages/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: currentPassword })
  });
  loadDashboard();
}

async function deleteRsvp(id) {
  if (!confirm('Delete this RSVP?')) return;
  await fetch(`/api/admin/rsvps/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: currentPassword })
  });
  loadDashboard();
}

loadButton.addEventListener('click', loadDashboard);
printButton.addEventListener('click', () => window.print());
