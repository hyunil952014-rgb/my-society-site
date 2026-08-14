(async function () {
  const site = await initLayout();
  if (site) {
    document.getElementById("hero-title").textContent = site.orgName;
    document.getElementById("hero-tagline").textContent = site.tagline || "";
    document.title = `홈 | ${site.orgName}`;

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

  // Renders the latest posts of one board into the given container.
  async function renderBoard({ path, wrapperKey, page, containerId, emptyText }) {
    const container = document.getElementById(containerId);
    try {
      const data = await fetchJSON(path);
      const items = (data[wrapperKey] || [])
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6);

      if (items.length === 0) {
        container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
        return;
      }

      container.innerHTML = items
        .map(
          (n) => `
        <a class="notice-row" href="${page}?id=${encodeURIComponent(n.id)}">
          <span class="notice-category">${escapeHtml(n.category || "일반")}</span>
          <span class="notice-title">${escapeHtml(n.title)}</span>
          <span class="notice-date">${escapeHtml(n.date)}</span>
        </a>`
        )
        .join("");
    } catch (e) {
      console.error(e);
      container.innerHTML = '<p class="empty-state">목록을 불러오지 못했습니다.</p>';
    }
  }

  await Promise.all([
    renderBoard({
      path: "/content/notices.json",
      wrapperKey: "notices",
      page: "/notices.html",
      containerId: "recent-notices",
      emptyText: "등록된 공지사항이 없습니다.",
    }),
    renderBoard({
      path: "/content/education.json",
      wrapperKey: "items",
      page: "/education.html",
      containerId: "recent-education",
      emptyText: "등록된 교육안내가 없습니다.",
    }),
  ]);
})();
