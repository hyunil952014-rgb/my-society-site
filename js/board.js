(async function () {
  const site = await initLayout();
  if (site) document.title = `임원진 소개 | ${site.orgName}`;

  try {
    const data = await fetchJSON("/content/board.json");
    const members = data.members || [];
    const list = document.getElementById("board-list");

    if (members.length === 0) {
      list.innerHTML = '<p class="empty-state">등록된 임원진 정보가 없습니다.</p>';
      return;
    }

    list.innerHTML = members
      .map((m) => {
        const photo = m.photo
          ? `<img class="member-photo" src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" />`
          : `<div class="member-photo placeholder">사진 없음</div>`;
        return `
      <div class="member-card">
        ${photo}
        <p class="member-name">${escapeHtml(m.name)}</p>
        <p class="member-title">${escapeHtml(m.title)}</p>
        ${m.affiliation ? `<p class="member-affiliation">${escapeHtml(m.affiliation)}</p>` : ""}
        ${m.bio ? `<p class="member-bio">${escapeHtml(m.bio)}</p>` : ""}
      </div>`;
      })
      .join("");
  } catch (e) {
    console.error(e);
    document.getElementById("board-list").innerHTML =
      '<p class="empty-state">임원진 정보를 불러오지 못했습니다.</p>';
  }
})();
