// Order groups are displayed in; anyone with an unknown/blank group falls to the end.
const GROUP_ORDER = ["회장단", "이사진"];

(async function () {
  const site = await initLayout();
  if (site) document.title = `임원진 소개 | ${site.orgName}`;

  const list = document.getElementById("board-list");

  let members = [];
  try {
    const data = await fetchJSON("/content/board.json");
    members = data.members || [];
  } catch (e) {
    console.error(e);
    list.innerHTML = '<p class="empty-state">임원진 정보를 불러오지 못했습니다.</p>';
    return;
  }

  if (members.length === 0) {
    list.innerHTML = '<p class="empty-state">등록된 임원진 정보가 없습니다.</p>';
    return;
  }

  function memberCard(m) {
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
  }

  const groupNames = GROUP_ORDER.filter((g) => members.some((m) => m.group === g));
  const ungrouped = members.filter((m) => !GROUP_ORDER.includes(m.group));

  const sections = groupNames.map((g) => ({
    name: g,
    items: members.filter((m) => m.group === g),
  }));
  if (ungrouped.length) sections.push({ name: "기타", items: ungrouped });

  list.innerHTML = sections
    .map(
      (s) => `
    <section class="board-group">
      <h2 class="board-group-title">${escapeHtml(s.name)}</h2>
      <div class="card-grid">${s.items.map(memberCard).join("")}</div>
    </section>`
    )
    .join("");
})();
