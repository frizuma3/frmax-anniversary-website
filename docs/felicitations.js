(() => {
  const message = document.getElementById('goodwillMessage');
  const author = document.getElementById('goodwillAuthor');
  const counter = document.getElementById('goodwillCounter');
  const panel = document.getElementById('goodwillPanel');
  if (!message || !author || !panel) return;
  let entries = [], index = 0, timer;
  let paused = false;
  const csvUrl = 'felicitations.csv';

  function parseCSV(csv) {
    const rows = []; let row = [], field = '', quoted = false;
    csv = csv.replace(/^\uFEFF/, '');
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      if (ch === '"') {
        if (quoted && csv[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === ',' && !quoted) { row.push(field); field = ''; }
      else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && csv[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += ch;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    if (rows.length && /^(name|sender|author|person)$/i.test(rows[0][0].trim())) rows.shift();
    return rows.filter(r => r.length >= 2 && r[0].trim() && r[1].trim())
      .map(r => ({ name: r[0].trim(), text: r.slice(1).join(',').trim() }));
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || !entries.length) return;
    const words = entries[index].text.split(/\s+/).length;
    timer = setTimeout(() => show((index + 1) % entries.length), Math.max(5000, Math.min(20000, words * 320)));
  }
  function show(next) {
    index = next;
    const entry = entries[index];
    message.textContent = entry.text;
    author.textContent = '— ' + entry.name;
    counter.textContent = `${index + 1} of ${entries.length}`;
    schedule();
  }
  function load(csv) {
    const parsed = parseCSV(csv);
    if (!parsed.length) { message.textContent = 'No messages found. Please check that your CSV has two columns: Name, Message.'; author.textContent = ''; return; }
    entries = parsed; show(0);
  }
  panel.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); });
  panel.addEventListener('mouseleave', () => { paused = false; schedule(); });
  panel.addEventListener('focusin', () => { paused = true; clearTimeout(timer); });
  panel.addEventListener('focusout', () => { paused = false; schedule(); });
  document.getElementById('goodwillPrevious').addEventListener('click', () => { if (entries.length) show((index - 1 + entries.length) % entries.length); });
  document.getElementById('goodwillNext').addEventListener('click', () => { if (entries.length) show((index + 1) % entries.length); });
  fetch(csvUrl, {cache:'no-store'}).then(r => { if (!r.ok) throw new Error('Missing CSV'); return r.text(); }).then(load)
    .catch(() => { message.textContent = 'Your goodwill messages will appear here soon.'; author.textContent = ''; counter.textContent = ''; });
})();
