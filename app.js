const INSTALL_KEY = "family-students-hide-install-tip";
const main = document.querySelector("#main");
const tabBar = document.querySelector("#tabs");

const TABS = [
  { id: "tonight", label: "Tonight" },
  { id: "upcoming", label: "Coming up" },
  { id: "campuses", label: "Campuses" },
  { id: "new", label: "I'm new" },
];

const ICONS = {
  tonight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/></svg>',
  upcoming:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
  campuses:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  new: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></svg>',
  nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

function text(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function httpUrl(value) {
  const trimmed = text(value);
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function audienceLabel(code) {
  if (code === "Chapel") return "High school · Chapel";
  if (code === "Annex") return "Junior high · Annex";
  return code;
}

function normalize(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const campuses = Array.isArray(source.campuses)
    ? source.campuses
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const id = text(item.id);
          const name = text(item.name);
          if (!id || !name) return null;
          return {
            id,
            name,
            role: text(item.role),
            address: text(item.address),
            arrival: text(item.arrival),
            mapsUrl: httpUrl(item.mapsUrl),
          };
        })
        .filter(Boolean)
    : [];

  const gatheringSource = source.gathering && typeof source.gathering === "object" ? source.gathering : null;
  let gathering = null;
  if (gatheringSource) {
    const audiences = Array.isArray(gatheringSource.audiences)
      ? [...new Set(gatheringSource.audiences.map(text).filter(Boolean))].map((code) => ({
          code,
          label: audienceLabel(code),
        }))
      : [];
    gathering = {
      title: text(gatheringSource.title),
      when: text(gatheringSource.when),
      campusId: text(gatheringSource.campusId),
      room: text(gatheringSource.room),
      audiences,
      series: text(gatheringSource.series),
      bigIdea: text(gatheringSource.bigIdea),
      bullets: (Array.isArray(gatheringSource.bullets) ? gatheringSource.bullets : [])
        .map(text)
        .filter(Boolean)
        .slice(0, 3),
      directionsUrl: httpUrl(gatheringSource.directionsUrl),
    };
    const has =
      gathering.title ||
      gathering.when ||
      gathering.room ||
      gathering.series ||
      gathering.bigIdea ||
      gathering.bullets.length ||
      gathering.audiences.length ||
      gathering.directionsUrl;
    if (!has) gathering = null;
  }

  const events = Array.isArray(source.events)
    ? source.events
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const name = text(item.name);
          if (!name) return null;
          const ctaUrl = httpUrl(item.ctaUrl);
          return {
            name,
            when: text(item.when),
            campusId: text(item.campusId),
            summary: text(item.summary),
            ctaLabel: ctaUrl ? text(item.ctaLabel) : null,
            ctaUrl,
          };
        })
        .filter(Boolean)
    : [];

  const first = source.firstTime && typeof source.firstTime === "object" ? source.firstTime : {};
  const blocks = Array.isArray(first.blocks)
    ? first.blocks
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const title = text(item.title);
          const body = text(item.body);
          if (!title || !body) return null;
          return { title, body };
        })
        .filter(Boolean)
    : [];

  return {
    sample: source.sample === true,
    wordmark: text(source.wordmark) || "Family Students",
    tagline: text(source.tagline),
    leadersNote: text(source.leadersNote),
    leadersUrl: httpUrl(source.leadersUrl),
    gathering,
    events,
    campuses,
    firstTime: { intro: text(first.intro), blocks },
  };
}

function campusById(content, id) {
  if (!id) return null;
  return content.campuses.find((campus) => campus.id === id) || null;
}

function splitWhen(when) {
  const marker = " · ";
  const index = when.indexOf(marker);
  if (index === -1) return { date: when, time: null };
  const date = when.slice(0, index).trim();
  const time = when.slice(index + marker.length).trim();
  if (!date || !time) return { date: when, time: null };
  return { date, time };
}

function showsEasternTime(time) {
  return Boolean(time && /\d/.test(time) && /\b(AM|PM)\b/i.test(time));
}

function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value != null) node.textContent = value;
  return node;
}

function icon(name) {
  const wrap = document.createElement("span");
  wrap.innerHTML = ICONS[name];
  return wrap.firstElementChild;
}

function externalLink(className, href, label, iconName) {
  const link = el("a", className);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (className.includes("btn") && iconName) link.append(icon(iconName));
  link.append(document.createTextNode(label));
  if (!className.includes("btn") && iconName) link.append(icon(iconName));
  return link;
}

function tabFromHash() {
  const hash = location.hash.replace("#", "");
  return TABS.some((tab) => tab.id === hash) ? hash : "tonight";
}

function scrollTop() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  main.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

let content = null;
let tab = "tonight";

function renderTabs() {
  tabBar.replaceChildren();
  for (const item of TABS) {
    const button = el("button", "tab");
    button.type = "button";
    button.append(icon(item.id));
    button.append(el("span", null, item.label));
    if (tab === item.id) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => go(item.id));
    tabBar.append(button);
  }
}

function go(next) {
  const hash = `#${next}`;
  if (location.hash !== hash) history.pushState(null, "", hash);
  tab = next;
  render();
  scrollTop();
}

function render() {
  renderTabs();
  const panel = el("div", "panel");
  if (tab === "tonight") panel.append(renderTonight());
  if (tab === "upcoming") panel.append(renderUpcoming());
  if (tab === "campuses") panel.append(renderCampuses());
  if (tab === "new") panel.append(renderFirstTime());
  main.replaceChildren(panel);
}

function renderTonight() {
  const screen = el("div", "screen");
  const header = el("header");
  const row = el("div", "hero-row");
  const mark = el("div", "mark");
  mark.append(el("span", "mark-bar"));
  const title = el("h1", "wordmark");
  title.setAttribute("aria-label", content.wordmark);
  const family = el("span", null, "Family");
  family.setAttribute("aria-hidden", "true");
  const students = el("span", "wordmark-accent", "Students");
  students.setAttribute("aria-hidden", "true");
  title.append(family, students);
  mark.append(title);
  row.append(mark);
  if (content.sample) row.append(el("p", "sample-flag", "PLACEHOLDER"));
  header.append(row);
  if (content.tagline) header.append(el("p", "tagline", content.tagline));
  screen.append(header);

  const gathering = content.gathering;
  const campus = campusById(content, gathering && gathering.campusId);
  if (!gathering) {
    screen.append(el("p", "empty", "Nothing is posted for this week yet."));
  } else {
    const section = el("section", "cluster");
    section.setAttribute("aria-label", "This week");
    section.append(el("p", "eyebrow", "This week"));
    if (gathering.title) section.append(el("h2", "gather-title", gathering.title));
    if (gathering.when) {
      const when = splitWhen(gathering.when);
      if (when.time) {
        section.append(el("p", "date", when.date));
        section.append(el("p", "time", when.time));
        if (showsEasternTime(when.time)) section.append(el("p", "tz", "Eastern Time"));
      } else {
        section.append(el("p", "gather-title", gathering.when));
      }
    }
    if (campus) section.append(el("p", "place", campus.name));
    if (gathering.room) section.append(el("p", "room", `Room ${gathering.room}`));
    if (gathering.audiences.length) {
      const chips = el("div", "chips");
      for (const audience of gathering.audiences) chips.append(el("span", "chip", audience.label));
      section.append(chips);
    }
    screen.append(section);

    if (gathering.series || gathering.bigIdea) {
      const series = el("section", "cluster");
      if (gathering.series) {
        series.append(el("p", "eyebrow", "Series"));
        series.append(el("h2", "series-name", gathering.series));
      }
      if (gathering.bigIdea) series.append(el("p", "big-idea", gathering.bigIdea));
      screen.append(series);
    }

    if (gathering.bullets.length) {
      const list = el("ul", "bullets");
      for (const bullet of gathering.bullets) list.append(el("li", null, bullet));
      screen.append(list);
    }
  }

  const actions = el("div", "actions");
  if (gathering && gathering.directionsUrl) {
    actions.append(externalLink("btn btn-primary", gathering.directionsUrl, "Get directions", "nav"));
    const secondary = el("button", "btn btn-secondary", "I'm new");
    secondary.type = "button";
    secondary.addEventListener("click", () => go("new"));
    actions.append(secondary);
  } else {
    const primary = el("button", "btn btn-primary", "I'm new");
    primary.type = "button";
    primary.addEventListener("click", () => go("new"));
    actions.append(primary);
  }
  screen.append(actions);
  screen.append(renderInstallTip());
  const leaders = renderLeaders();
  if (leaders) screen.append(leaders);
  return screen;
}

function renderInstallTip() {
  const aside = el("aside", "install-tip");
  let hidden = false;
  try {
    hidden = localStorage.getItem(INSTALL_KEY) === "1";
  } catch {
    hidden = false;
  }
  if (hidden) {
    aside.hidden = true;
    return aside;
  }
  const copy = el("div");
  copy.append(el("p", "install-title", "Add to Home Screen"));
  copy.append(el("p", "install-copy", "On iPhone, tap Share, then Add to Home Screen."));
  const dismiss = el("button", "icon-btn");
  dismiss.type = "button";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.append(icon("x"));
  dismiss.addEventListener("click", () => {
    aside.remove();
    try {
      localStorage.setItem(INSTALL_KEY, "1");
    } catch {
      /* private mode */
    }
  });
  aside.append(copy, dismiss);
  return aside;
}

function renderLeaders() {
  const note = content.leadersNote;
  const url = content.leadersUrl;
  if (!note && !url) return null;
  const paragraph = el("p", "leaders");
  const label = "Stage Ready";
  if (note && url && note.includes(label)) {
    const index = note.indexOf(label);
    paragraph.append(document.createTextNode(note.slice(0, index)));
    const link = el("a", null, label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    paragraph.append(link);
    paragraph.append(document.createTextNode(note.slice(index + label.length)));
    return paragraph;
  }
  paragraph.append(document.createTextNode(note || "Leaders: use "));
  if (url) {
    const link = el("a", null, "Stage Ready");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (note) paragraph.append(document.createTextNode(" "));
    paragraph.append(link);
  }
  return paragraph;
}

function renderUpcoming() {
  const screen = el("div", "screen");
  const header = el("header", "cluster");
  header.append(el("p", "eyebrow", "Family Students"));
  header.append(el("h1", "page-title", "Coming up"));
  header.append(el("p", "lede", "Public events only. A missing detail is not posted yet."));
  screen.append(header);
  if (!content.events.length) {
    screen.append(el("p", "empty", "No public events are posted yet."));
    return screen;
  }
  const list = el("ul", "card-list");
  for (const event of content.events) {
    const campus = campusById(content, event.campusId);
    const card = el("li", "card");
    card.append(el("h2", "card-title", event.name));
    if (event.when) card.append(el("p", "date", event.when));
    if (campus) card.append(el("p", "place", campus.name));
    if (event.summary) card.append(el("p", "summary", event.summary));
    if (event.ctaUrl) {
      card.append(externalLink("text-link", event.ctaUrl, event.ctaLabel || "Open link", "out"));
    }
    list.append(card);
  }
  screen.append(list);
  return screen;
}

function renderCampuses() {
  const screen = el("div", "screen");
  const header = el("header", "cluster");
  header.append(el("p", "eyebrow", "Family Church"));
  header.append(el("h1", "page-title", "Campuses"));
  header.append(
    el(
      "p",
      "lede",
      "Students meet at two Family Church campuses. Tonight names the one for this week.",
    ),
  );
  screen.append(header);
  if (!content.campuses.length) {
    screen.append(el("p", "empty", "Campus details are not posted yet."));
    return screen;
  }
  const list = el("ul", "card-list");
  for (const campus of content.campuses) {
    const card = el("li", "card");
    if (campus.role) card.append(el("p", "eyebrow", campus.role));
    card.append(el("h2", "card-title", campus.name));
    if (campus.address) card.append(el("p", "summary", campus.address));
    if (campus.arrival) card.append(el("p", "summary", campus.arrival));
    if (campus.mapsUrl) card.append(externalLink("text-link", campus.mapsUrl, "Get directions", "out"));
    list.append(card);
  }
  screen.append(list);
  return screen;
}

function renderFirstTime() {
  const screen = el("div", "screen");
  const header = el("header", "cluster");
  header.append(el("p", "eyebrow", "First time"));
  header.append(el("h1", "page-title", "I'm new"));
  if (content.firstTime.intro) header.append(el("p", "lede", content.firstTime.intro));
  screen.append(header);
  if (!content.firstTime.blocks.length) {
    screen.append(el("p", "empty", "First-time details are not posted yet."));
    return screen;
  }
  const list = el("ul", "block-list");
  for (const block of content.firstTime.blocks) {
    const item = el("li", "block");
    item.append(el("h2", "block-title", block.title));
    item.append(el("p", "block-body", block.body));
    list.append(item);
  }
  screen.append(list);
  return screen;
}

function showError(message) {
  main.replaceChildren(el("p", "empty", message));
}

async function boot() {
  tab = tabFromHash();
  try {
    const response = await fetch("content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("missing");
    content = normalize(await response.json());
  } catch {
    showError("The week could not be loaded. Check the connection and try again.");
    return;
  }
  render();
  addEventListener("hashchange", () => {
    tab = tabFromHash();
    render();
  });
  addEventListener("popstate", () => {
    tab = tabFromHash();
    render();
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

boot();
