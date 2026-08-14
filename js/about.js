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
  const blocks = [
    { title: "학회 소개", text: about.intro },
    { title: "설립 목적", text: about.purpose },
    { title: "조직 안내", text: about.organization },
  ].filter((b) => b.text);

  const container = document.getElementById("about-content");
  container.innerHTML = blocks.length
    ? blocks
        .map(
          (b) => `
      <div class="about-block">
        <h3>${escapeHtml(b.title)}</h3>
        <p>${escapeHtml(b.text)}</p>
      </div>`
        )
        .join("")
    : '<p class="empty-state">등록된 소개 내용이 없습니다.</p>';

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
})();
