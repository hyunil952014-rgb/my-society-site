// Number of days ahead an item still counts as an "upcoming" event.
const UPCOMING_WINDOW_DAYS = 180;

function todayAtMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(str) {
  // Dates are stored as YYYY-MM-DD; build them in local time so the
  // day difference is not shifted by the timezone offset.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || "").trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function daysUntil(date) {
  return Math.round((date - todayAtMidnight()) / 86400000);
}

function ddayLabel(days) {
  if (days === 0) return "오늘";
  return `D-${days}`;
}

(async function () {
  const site = await initLayout();

  if (site) {
    document.getElementById("hero-title").textContent = site.orgName;
    document.getElementById("hero-tagline").textContent = site.tagline || "";
    document.title = `홈 | ${site.orgName}`;

    const introText = site.homeIntro || (site.about && site.about.intro) || "";
    if (introText) {
      // Fall back to the first paragraph when reusing the longer about text.
      document.getElementById("intro-text").textContent = introText.split("\n\n")[0];
      document.getElementById("intro-section").style.display = "";
    }

    const links = socialLinks(site.social);
    if (links.length) {
      const descriptions = {
        페이스북: "학회 소식과 활동 사진을 확인하실 수 있습니다.",
        "네이버 카페": "회원 간 자료 공유와 소통이 이루어지는 공간입니다.",
      };
      document.getElementById("social-links").innerHTML = links
        .map(
          (l) => `
        <a class="card social-card" href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer">
          <h3>${l.label}</h3>
          <p>${escapeHtml(descriptions[l.label] || "")}</p>
          <span class="social-go">바로가기 &rarr;</span>
        </a>`
        )
        .join("");
      document.getElementById("social-section").style.display = "";
    }
  }

  async function loadBoard(path, wrapperKey) {
    try {
      const data = await fetchJSON(path);
      return data[wrapperKey] || [];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function renderBoard(items, { page, containerId, emptyText }) {
    const container = document.getElementById(containerId);
    if (items === null) {
      container.innerHTML = '<p class="empty-state">목록을 불러오지 못했습니다.</p>';
      return;
    }
    if (items.length === 0) {
      container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
      return;
    }
    container.innerHTML = items
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6)
      .map(
        (n) => `
      <a class="notice-row" href="${page}?id=${encodeURIComponent(n.id)}">
        <span class="notice-category">${escapeHtml(n.category || "일반")}</span>
        <span class="notice-title">${escapeHtml(n.title)}</span>
        <span class="notice-date">${escapeHtml(n.date)}</span>
      </a>`
      )
      .join("");
  }

  const [notices, education, conference, members] = await Promise.all([
    loadBoard("/content/notices.json", "notices"),
    loadBoard("/content/education.json", "items"),
    loadBoard("/content/conference.json", "items"),
    loadBoard("/content/board.json", "members"),
  ]);

  renderBoard(notices, {
    page: "/notices.html",
    containerId: "recent-notices",
    emptyText: "등록된 공지사항이 없습니다.",
  });
  renderBoard(education, {
    page: "/education.html",
    containerId: "recent-education",
    emptyText: "등록된 교육안내가 없습니다.",
  });

  // 임원진: 회장단을 우선 노출
  const leaders = (members || [])
    .slice()
    .sort((a, b) => (a.group === "회장단" ? -1 : 1) - (b.group === "회장단" ? -1 : 1))
    .slice(0, 4);
  if (leaders.length) {
    document.getElementById("home-board").innerHTML = leaders
      .map(
        (m) => `
      <a class="member-card" href="/board.html">
        ${
          m.photo
            ? `<img class="member-photo" src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" loading="lazy" />`
            : '<div class="member-photo placeholder" aria-hidden="true">사진 없음</div>'
        }
        <p class="member-name">${escapeHtml(m.name)}</p>
        <p class="member-title">${escapeHtml(m.title)}</p>
        ${m.affiliation ? `<p class="member-affiliation">${escapeHtml(m.affiliation)}</p>` : ""}
      </a>`
      )
      .join("");
    document.getElementById("board-section").style.display = "";
  }

  // Upcoming events: anything dated from today onward, across all event boards.
  const upcoming = [
    ...(notices || []).map((n) => ({ ...n, page: "/notices.html" })),
    ...(education || []).map((n) => ({ ...n, page: "/education.html" })),
    ...(conference || []).map((n) => ({ ...n, page: "/conference.html" })),
  ]
    .map((n) => ({ ...n, parsed: parseDate(n.date) }))
    .filter((n) => n.parsed)
    .map((n) => ({ ...n, days: daysUntil(n.parsed) }))
    .filter((n) => n.days >= 0 && n.days <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  if (upcoming.length) {
    document.getElementById("upcoming-list").innerHTML = upcoming
      .map(
        (n) => `
      <a class="upcoming-card" href="${n.page}?id=${encodeURIComponent(n.id)}">
        <span class="upcoming-dday">${ddayLabel(n.days)}</span>
        <span class="upcoming-title">${escapeHtml(n.title)}</span>
        <span class="upcoming-meta">${escapeHtml(n.category || "")} · ${escapeHtml(n.date)}</span>
      </a>`
      )
      .join("");
    document.getElementById("upcoming-section").style.display = "";
  }
})();
