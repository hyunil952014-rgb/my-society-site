(async function () {
  const site = await initLayout();
  const container = document.getElementById("notices-container");

  let notices = [];
  try {
    const data = await fetchJSON("/content/notices.json");
    notices = (data.notices || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="empty-state">공지사항을 불러오지 못했습니다.</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const orgName = site ? site.orgName : "학회";

  if (id) {
    const notice = notices.find((n) => String(n.id) === String(id));
    if (!notice) {
      container.innerHTML = `
        <a class="back-link" href="/notices.html">&larr; 목록으로</a>
        <p class="empty-state">존재하지 않는 공지사항입니다.</p>`;
      document.title = `공지사항 | ${orgName}`;
      return;
    }
    document.title = `${notice.title} | ${orgName}`;
    container.innerHTML = `
      <a class="back-link" href="/notices.html">&larr; 목록으로</a>
      <div class="notice-detail">
        <h2>${escapeHtml(notice.title)}</h2>
        <div class="notice-meta">${escapeHtml(notice.category || "일반")} · ${escapeHtml(notice.date)}</div>
        <div class="notice-body">${escapeHtml(notice.body)}</div>
      </div>`;
    return;
  }

  document.title = `공지사항 | ${orgName}`;

  if (notices.length === 0) {
    container.innerHTML = '<p class="empty-state">등록된 공지사항이 없습니다.</p>';
    return;
  }

  container.innerHTML = `
    <div class="notice-list">
      ${notices
        .map(
          (n) => `
        <a class="notice-row" href="/notices.html?id=${encodeURIComponent(n.id)}">
          <span class="notice-category">${escapeHtml(n.category || "일반")}</span>
          <span class="notice-title">${escapeHtml(n.title)}</span>
          <span class="notice-date">${escapeHtml(n.date)}</span>
        </a>`
        )
        .join("")}
    </div>`;
})();
