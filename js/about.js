(async function () {
  const site = await initLayout();
  if (!site) {
    document.getElementById("about-content").innerHTML =
      '<p class="empty-state">내용을 불러오지 못했습니다.</p>';
    return;
  }

  document.title = `학회 소개 | ${site.orgName}`;
  document.getElementById("hero-tagline").textContent = site.tagline || "";

  const about = site.about || {};

  // 인사말
  const greetingEl = document.getElementById("greeting-content");
  if (about.greeting) {
    greetingEl.innerHTML = `
      <div class="greeting">
        <p>${escapeHtml(about.greeting)}</p>
        ${
          about.greetingSignature
            ? `<p class="greeting-sign">${escapeHtml(about.greetingSignature)}</p>`
            : ""
        }
      </div>`;
  } else {
    hideSection("greeting");
  }

  // 학회 소개 / 설립 목적 / 조직
  const blocks = [
    { id: "intro-block", title: "학회 소개", text: about.intro },
    { id: "purpose", title: "설립 목적", text: about.purpose },
    { id: "organization", title: "조직 안내", text: about.organization },
  ].filter((b) => b.text);

  document.getElementById("about-content").innerHTML = blocks.length
    ? blocks
        .map(
          (b) => `
      <div class="about-block" id="${b.id}">
        <h3>${escapeHtml(b.title)}</h3>
        <p>${escapeHtml(b.text)}</p>
      </div>`
        )
        .join("")
    : '<p class="empty-state">등록된 소개 내용이 없습니다.</p>';

  // 연혁
  const history = (site.history || []).slice().sort((a, b) => (a.year < b.year ? 1 : -1));
  const timeline = document.getElementById("history-timeline");
  timeline.innerHTML = history.length
    ? history
        .map(
          (h) => `
      <div class="timeline-item">
        <span class="timeline-year">${escapeHtml(h.year)}</span>
        <span>${escapeHtml(h.event)}</span>
      </div>`
        )
        .join("")
    : '<p class="empty-state">등록된 연혁이 없습니다.</p>';

  // 사무국 안내
  const contact = site.contact || {};
  const rows = [
    ["이메일", contact.email, (v) => `<a href="mailto:${escapeHtml(v)}">${escapeHtml(v)}</a>`],
    ["전화", contact.phone],
    ["주소", contact.address],
    ["운영 시간", contact.officeHours],
  ].filter(([, value]) => value);

  const officeEl = document.getElementById("office-content");
  if (rows.length || contact.officeNote) {
    officeEl.innerHTML = `
      ${
        rows.length
          ? `<dl class="info-list">${rows
              .map(
                ([label, value, fmt]) =>
                  `<dt>${escapeHtml(label)}</dt><dd>${fmt ? fmt(value) : escapeHtml(value)}</dd>`
              )
              .join("")}</dl>`
          : ""
      }
      ${contact.officeNote ? `<p class="office-note">${escapeHtml(contact.officeNote)}</p>` : ""}`;
  } else {
    hideSection("office");
  }

  // 정관 및 규정
  const documents = (site.documents || []).filter((d) => d && d.file);
  const docsEl = document.getElementById("documents-content");
  if (documents.length) {
    docsEl.innerHTML = `
      <ul class="attachment-list">
        ${documents
          .map(
            (d) => `
          <li>
            <a href="${escapeHtml(d.file)}" download>
              <span class="attach-icon" aria-hidden="true">↓</span>
              <span class="attach-name">${escapeHtml(d.name || "문서")}</span>
            </a>
          </li>`
          )
          .join("")}
      </ul>`;
  } else {
    hideSection("documents");
  }

  function hideSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
    const link = document.querySelector(`.subnav a[href="#${id}"]`);
    if (link) link.style.display = "none";
  }
})();
