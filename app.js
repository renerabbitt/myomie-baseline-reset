const chapters = window.BASELINE_CHAPTERS;
const nav = document.querySelector("#nav");
const reader = document.querySelector("#reader");
const rail = document.querySelector("#rail");
const menu = document.querySelector("#menu");
const scrim = document.querySelector("#scrim");
let mode = "flip";

const escapeHTML = value => String(value ?? "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
const chapterIndexFromUrl = () => {
  let slug = "";
  try { slug = new URLSearchParams(location.search).get("chapter") || location.hash.slice(1); } catch {}
  const found = chapters.findIndex(chapter => chapter.slug === String(slug).toLowerCase());
  return found >= 0 ? found : 0;
};
let active = chapterIndexFromUrl();

function graphic(type, accent) {
  const base = `<circle cx="210" cy="210" r="150" fill="${accent}" opacity=".10"/><circle cx="210" cy="210" r="114" fill="none" stroke="${accent}" stroke-width="2" opacity=".28"/>`;
  const common = `fill="none" stroke="#18233d" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"`;
  const art = {
    welcome: `<path d="M92 238c42-84 95-126 159-126 34 0 63 12 87 36-63-14-111 7-143 63-26 45-58 73-96 84" ${common}/><circle cx="252" cy="210" r="34" fill="${accent}"/>`,
    drift: `<path d="M104 244c38-78 92-117 161-117 38 0 69 12 92 37-57-9-103 12-139 63-29 41-63 66-102 76" ${common}/><circle cx="316" cy="104" r="19" fill="${accent}"/><path d="M287 128 267 153" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 18"/>`,
    awareness: `<path d="M76 211c38-53 82-80 134-80s96 27 134 80c-38 53-82 80-134 80s-96-27-134-80Z" ${common}/><circle cx="210" cy="211" r="46" fill="${accent}"/><circle cx="210" cy="211" r="17" fill="#fffefa"/>`,
    relationship: `<path d="M96 246c20-76 59-114 116-114 40 0 70 22 91 66" ${common}/><path d="M324 246c-20-76-59-114-116-114-40 0-70 22-91 66" fill="none" stroke="${accent}" stroke-width="22" stroke-linecap="round"/><circle cx="210" cy="236" r="28" fill="#18233d"/>`,
    baseline: `<path d="M82 236h256" stroke="#18233d" stroke-width="18" stroke-linecap="round"/><path d="M112 203c38-54 73-81 106-81 34 0 64 23 91 69" fill="none" stroke="${accent}" stroke-width="20" stroke-linecap="round"/><circle cx="210" cy="236" r="26" fill="${accent}"/>`,
    fitness: `<path d="M94 267c25-88 64-132 116-132s91 44 116 132" ${common}/><path d="M127 267c18-60 46-90 83-90s65 30 83 90" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round"/><circle cx="210" cy="267" r="28" fill="#18233d"/>`,
    reset: `<path d="M112 272c-20-82 8-139 84-172 61-26 118 3 122 62 4 55-52 101-103 80-37-15-41-64-8-83 27-15 59 3 58 30" ${common}/><circle cx="265" cy="189" r="20" fill="${accent}"/>`,
    breath: `<path d="M82 223c36 0 36-72 72-72s36 122 72 122 36-72 72-72 36 22 40 22" ${common}/><circle cx="154" cy="151" r="17" fill="${accent}"/><circle cx="226" cy="273" r="17" fill="${accent}"/>`,
    practice: `<circle cx="210" cy="210" r="112" fill="#18233d"/><path d="m188 157 82 53-82 53Z" fill="#fffefa"/><path d="M103 125c28-39 64-62 107-68" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>`,
    thanks: `<path d="M210 303S102 242 102 158c0-42 30-69 68-69 24 0 42 13 40 36-2-23 17-36 41-36 38 0 68 27 68 69 0 84-109 145-109 145Z" fill="${accent}"/><path d="M142 180c26-58 65-81 117-69" fill="none" stroke="#fffefa" stroke-width="18" stroke-linecap="round"/>`
  }[type] || "";
  return `<svg viewBox="0 0 420 420" role="img" aria-label="Abstract illustration for this chapter">${base}${art}</svg>`;
}

function blockHTML(block) {
  if (block.type === "quote") return `<blockquote>${escapeHTML(block.text)}</blockquote>`;
  if (block.type === "prompt") return `<p class="prompt">${escapeHTML(block.text)}</p>`;
  if (block.type === "signature") return `<p class="signature">${escapeHTML(block.text)}</p>`;
  if (block.type === "actions") return `<div class="actions">${block.items.map(item => `<a class="${item.secondary ? "secondary" : ""}" href="${escapeHTML(item.href)}" ${item.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}><span>${escapeHTML(item.label)}</span><span aria-hidden="true">→</span></a>`).join("")}</div>`;
  return `<p>${escapeHTML(block.text)}</p>`;
}

function chapterHTML(chapter, index) {
  return `<article id="chapter-${index}" class="chapter" style="--accent:${chapter.accent}">
    <div class="chapter-kicker">CHAPTER ${String(index + 1).padStart(2, "0")} · BASELINE RESET</div>
    <h1>${escapeHTML(chapter.title)}</h1>
    <p class="deck">${escapeHTML(chapter.description)}</p>
    <div class="lesson">
      <div class="prose">${chapter.blocks.map(blockHTML).join("")}</div>
      <aside class="chapter-art">
        <div class="art-card">${graphic(chapter.art, chapter.accent)}</div>
        <p class="art-caption">${escapeHTML(chapter.artCaption)}</p>
      </aside>
    </div>
  </article>`;
}

function setUrl(index, replace = false) {
  const url = new URL(location.href);
  url.searchParams.set("chapter", chapters[index].slug);
  url.hash = "";
  history[replace ? "replaceState" : "pushState"]({chapter: chapters[index].slug}, "", url);
}

function closeRail() {
  rail.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  scrim.hidden = true;
}

function render() {
  [...nav.children].forEach((button, index) => button.classList.toggle("active", index === active));
  reader.innerHTML = mode === "flip" ? chapterHTML(chapters[active], active) : chapters.map(chapterHTML).join("");
  document.title = `${chapters[active].title} | Baseline Reset · Myomie`;
}

function go(index, updateUrl = true) {
  active = Math.max(0, Math.min(chapters.length - 1, index));
  if (updateUrl) setUrl(active);
  render();
  closeRail();
  if (mode === "scroll") document.querySelector(`#chapter-${active}`)?.scrollIntoView({behavior:"smooth"});
  else scrollTo({top:0, behavior:"smooth"});
}

chapters.forEach((chapter, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.style.setProperty("--accent", chapter.accent);
  button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHTML(chapter.title)}</strong><small>${escapeHTML(chapter.description)}</small></div>`;
  button.addEventListener("click", () => go(index));
  nav.append(button);
});

document.querySelector("#count").textContent = chapters.length;
menu.addEventListener("click", () => {
  const open = !rail.classList.contains("open");
  rail.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  scrim.hidden = !open;
});
scrim.addEventListener("click", closeRail);
document.querySelector("#flip").addEventListener("click", () => {
  mode = "flip";
  document.querySelector("#flip").classList.add("active");
  document.querySelector("#scroll").classList.remove("active");
  render();
});
document.querySelector("#scroll").addEventListener("click", () => {
  mode = "scroll";
  document.querySelector("#scroll").classList.add("active");
  document.querySelector("#flip").classList.remove("active");
  render();
});
document.querySelector("#search").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  [...nav.children].forEach((button, index) => {
    const haystack = JSON.stringify(chapters[index]).toLowerCase();
    button.hidden = Boolean(query) && !haystack.includes(query);
  });
});
window.addEventListener("popstate", () => { active = chapterIndexFromUrl(); render(); });
setUrl(active, true);
render();
