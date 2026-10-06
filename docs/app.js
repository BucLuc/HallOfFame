let archiveOpen = false;
const app = document.querySelector('#app');
let exhibits = [];
let query = '';
let author = '';
let sort = 'newest';
const escape = (value)=>value.replace(/[&<>"']/g, (c)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[c]);
const number = (n)=>String(n).padStart(3, '0');
const href = (s) => `#message/${s.id}`;
const date = (s)=>s.writtenAt.split(',')[0];
const reading = (s)=>Math.max(1, Math.ceil(s.story.split(/\s+/).length / 220));
const preview = (s)=>escape(s.story.replace(/\s+/g, ' ').slice(0, 185)) + (s.story.length > 185 ? '…' : '');
const meta = (s)=>`<span>${escape(s.author)}</span><span>${date(s)}</span><span>${reading(s)} min read</span>`;
function overview() {
    document.title = 'The Hall of Fame — Words of questionable wisdom';
    const featured = exhibits[Math.min(6, exhibits.length - 1)];
    app.innerHTML = `<section class="hero"><div class="eyebrow"><span></span> A MONUMENT TO ARTIFICIAL BRILLIANCE <span></span></div><div class="crest" aria-hidden="true">✦</div><h1>Some words deserve<br>to live <em>forever.</em></h1><p>A sacred collection of questionable wisdom, accidental genius,<br class="desktop"> and messages that had absolutely no business going this hard.</p><a class="gold-button" href="#collection">Enter the hall <span>↓</span></a><div class="hero-stats"><span><strong>${exhibits.length}</strong> IMMORTAL MESSAGES</span><span><strong>${new Set(exhibits.map((s)=>s.author)).size}</strong> LEGENDARY MINDS</span><span><strong>∞</strong> UNNECESSARY GRANDEUR</span></div><div class="hero-word" aria-hidden="true">IMMORTAL</div></section>
    <section class="featured"><div class="featured-label"><span>✧</span> THE CROWN JEWEL <small>A fittingly majestic introduction</small></div><div class="featured-content"><span class="eyebrow">EXHIBIT ${number(featured.id + 1)} · IMMORTALIZED ${featured.year}</span><h2>${escape(featured.title)}</h2><p>${preview(featured)}</p><div class="meta">${meta(featured)}</div></div><a class="round-link" href="${href(featured)}" aria-label="Read ${escape(featured.title)}">↗</a></section>
    <section id="collection" class="collection"><div class="collection-heading"><div><div class="eyebrow">THE PERMANENT COLLECTION</div><h2>The stuff of <em>legends.</em></h2></div><p>Every masterpiece. Every questionable decision.<br>All enshrined in one excessively fancy place.</p></div><div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search the sacred archives…" aria-label="Search messages" value="${escape(query)}"><kbd>/</kbd></label><label class="select-wrap"><span class="sr-only">Filter by author</span><select id="author"><option value="">All minds</option>${Array.from(new Set(exhibits.map((s)=>s.author))).sort().map((a)=>`<option ${a === author ? 'selected' : ''} value="${escape(a)}">${escape(a)}</option>`).join('')}</select></label><label class="select-wrap"><span class="sr-only">Sort messages</span><select id="sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option><option value="longest">Longest legends</option></select></label></div><div class="results-line"><span id="count"></span><span>CURATED CHAOS. ETERNAL GLORY.</span></div><div id="grid" class="grid"></div></section><section class="closing"><span>✦</span><p>Artificial intelligence.<br><em>Real masterpieces.</em></p><small>NOT ALL THAT GLITTERS IS SENSIBLE.</small></section>`;
    document.querySelector('#sort').value = sort;
    document.querySelector('#search').addEventListener('input', (e)=>{
        query = e.target.value;
        cards();
    });
    document.querySelector('#author').addEventListener('change', (e)=>{
        author = e.target.value;
        cards();
    });
    document.querySelector('#sort').addEventListener('change', (e)=>{
        sort = e.target.value;
        cards();
    });
    cards();
}
function cards() {
    const matching = exhibits.filter((s)=>(!author || s.author === author) && `${s.title} ${s.story} ${s.author}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    matching.sort((a, b)=>sort === 'title' ? a.title.localeCompare(b.title) : sort === 'longest' ? b.story.length - a.story.length : sort === 'oldest' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
    document.querySelector('#count').textContent = `${matching.length} ${matching.length === 1 ? 'legend' : 'legends'} on display`;
    document.querySelector('#grid').innerHTML = matching.length ? matching.map((s)=>`<a class="card" href="${href(s)}"><div class="card-top"><span>NO. ${number(s.id + 1)}</span><span class="card-sigil" aria-hidden="true">${[
            '✦',
            '♜',
            '❖',
            '✧'
        ][s.id % 4]}</span><span>${s.year}</span></div><h3>${escape(s.title)}</h3><p>${preview(s)}</p><div class="card-bottom"><span>${escape(s.author)} <i>·</i> ${date(s)}</span><span class="card-arrow">↗</span></div></a>`).join('') : '<div class="empty"><span>✧</span><h3>No legends found.</h3><p>Even this hallowed archive has its limits. Try another search.</p><button id="clear" class="gold-button">Clear filters</button></div>';
    document.querySelector('#clear')?.addEventListener('click', ()=>{
        query = '';
        author = '';
        overview();
    });
}
function detail(id) {
    const s = exhibits[id];
    if (!s) {
        app.innerHTML = '<section class="not-found"><h1>This legend is lost.</h1><a class="gold-button" href="#collection">Return to the collection</a></section>';
        return;
    }
    document.title = `${s.title} — The Hall of Fame`;
    app.innerHTML = `<article class="detail"><a class="back" href="#collection">← Back to the collection</a><header class="detail-header"><div class="eyebrow">✧ &nbsp; EXHIBIT ${number(s.id + 1)} · THE IMMORTAL ARCHIVE</div><h1>${escape(s.title)}</h1><div class="meta">${meta(s)}</div><div class="detail-actions"><button id="copy">Copy masterpiece <span>⧉</span></button><button id="share">Copy link <span>↗</span></button></div><span id="status" class="copy-status" role="status"></span></header><div class="manuscript"><span class="manuscript-label">THE ORIGINAL MASTERPIECE</span><div class="story ${/[⣀-⣿]/u.test(s.story) ? 'ascii' : ''}">${escape(s.story)}</div><div class="end-mark" aria-hidden="true">✦</div></div><nav class="detail-nav" aria-label="Other messages">${id > 0 ? `<a href="${href(exhibits[id - 1])}"><small>← PREVIOUS LEGEND</small><span>${escape(exhibits[id - 1].title)}</span></a>` : '<span></span>'}${id < exhibits.length - 1 ? `<a href="${href(exhibits[id + 1])}"><small>NEXT LEGEND →</small><span>${escape(exhibits[id + 1].title)}</span></a>` : '<span></span>'}</nav></article>`;
    const copy = async (text, message)=>{
        try {
            await navigator.clipboard.writeText(text);
            document.querySelector('#status').textContent = message;
        } catch  {
            document.querySelector('#status').textContent = 'Clipboard unavailable. Please select and copy the text.';
        }
    };
    document.querySelector('#copy').addEventListener('click', ()=>copy(s.story, 'Masterpiece copied. Handle with reverence.'));
    document.querySelector('#share').addEventListener('click', ()=>copy(location.href, 'Link copied. Spread the glory.'));
}
function route() {
    if (!archiveOpen) return;
    const match = location.hash.match(/^#message\/(\d+)(?:\/.*)?$/);
    if (match) {
        detail(Number(match[1]));
        window.scrollTo(0, 0);
    } else {
        overview();
        if (location.hash === '#collection') document.querySelector('#collection').scrollIntoView();
        else window.scrollTo(0, 0);
    }
}
document.querySelector('#random').addEventListener('click', ()=>{
    if (exhibits.length) location.hash = href(exhibits[Math.floor(Math.random() * exhibits.length)]);
});
document.addEventListener('keydown', (e)=>{
    if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement) && !e.ctrlKey && !e.metaKey) {
        const search = document.querySelector('#search');
        if (search) {
            e.preventDefault();
            search.focus();
        }
    }
});
window.addEventListener('hashchange', route);
function init(data) {
    try {

        if (!Array.isArray(data.stories)) throw new Error('Expected a stories array');
        exhibits = data.stories.map((s, id)=>{
            const parts = s.writtenAt.match(/(\d{2})\.(\d{2})\.(\d{2}),\s*(\d{2}):(\d{2}):(\d{2})/);
            return {
                ...s,
                id,
                year: parts ? `20${parts[3]}` : 'Unknown',
                timestamp: parts ? new Date(2000 + Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]), Number(parts[4]), Number(parts[5]), Number(parts[6])).getTime() : 0
            };
        });
        if (!exhibits.length) {
            app.innerHTML = '<section class="not-found"><h1>The hall awaits its legends.</h1><p>Add messages to data/data.json to begin the collection.</p></section>';
            return;
        }
        archiveOpen = true;
        route();
    } catch  {
        app.innerHTML = '<section class="not-found"><h1>The gates are temporarily closed.</h1><p>Das entschlüsselte Archiv konnte nicht angezeigt werden.</p></section>';
    }
}

document.addEventListener('archive-unlocked', event => init(event.detail));
document.addEventListener('archive-locked', () => {
    archiveOpen = false;
    exhibits = []; query = ''; author = ''; sort = 'newest';
    document.querySelector('#app').replaceChildren();
});

