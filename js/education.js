(async function () {
  const site = await initLayout();
  const container = document.getElementById("education-container");

  let items = [];
  try {
    const data = await fetchJSON("/content/education.json");
    items = (data.items || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="empty-state">교육안내를 불러오지 못했습니다.</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const orgName = site ? site.orgName : "학회";

  if (id) {
    const item = items.find((n) => String(n.id) === String(id));
    if (!item) {
      container.innerHTML = `
        <a class="back-link" href="/education.html">&larr; 목록으로</a>
        <p class="empty-state">존재하지 않는 게시물입니다.</p>`;
      document.title = `교육안내 | ${orgName}`;
      return;
    }
    document.title = `${item.title} | ${orgName}`;
    container.innerHTML = `
      <a class="back-link" href="/education.html">&larr; 목록으로</a>
      <div class="notice-detail">
        <h2>${escapeHtml(item.title)}</h2>
        <div class="notice-meta">${escapeHtml(item.category || "안내")} · ${escapeHtml(item.date)}</div>
        <div class="notice-body">${escapeHtml(item.body)}</div>
      </div>`;
    return;
  }

  document.title = `교육안내 | ${orgName}`;

  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">등록된 교육안내가 없습니다.</p>';
    return;
  }

  container.innerHTML = `
    <div class="notice-list">
      ${items
        .map(
          (n) => `
        <a class="notice-row" href="/education.html?id=${encodeURIComponent(n.id)}">
          <span class="notice-category">${escapeHtml(n.category || "안내")}</span>
          <span class="notice-title">${escapeHtml(n.title)}</span>
          <span class="notice-date">${escapeHtml(n.date)}</span>
        </a>`
        )
        .join("")}
    </div>`;
})();
