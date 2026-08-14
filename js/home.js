(async function () {
  const site = await initLayout();
  if (site) {
    document.getElementById("hero-title").textContent = site.orgName;
    document.getElementById("hero-tagline").textContent = site.tagline || "";
    document.title = `홈 | ${site.orgName}`;
  }

  try {
    const data = await fetchJSON("/content/notices.json");
    const notices = (data.notices || [])
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    const list = document.getElementById("recent-notices");
    if (notices.length === 0) {
      list.innerHTML = `<p class="empty-state">등록된 공지사항이 없습니다.</p>`;
      return;
    }

    list.innerHTML = notices
      .map(
        (n) => `
      <a class="notice-row" href="/notices.html?id=${encodeURIComponent(n.id)}">
        <span class="notice-category">${escapeHtml(n.category || "일반")}</span>
        <span class="notice-title">${escapeHtml(n.title)}</span>
        <span class="notice-date">${escapeHtml(n.date)}</span>
      </a>`
      )
      .join("");
  } catch (e) {
    console.error(e);
    document.getElementById("recent-notices").innerHTML =
      '<p class="empty-state">공지사항을 불러오지 못했습니다.</p>';
  }
})();
