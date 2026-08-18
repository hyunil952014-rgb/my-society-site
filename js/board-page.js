// Shared list/detail rendering for the notice, education and resource boards.
// Each page calls initBoardPage() with the bits that differ.

const PAGE_SIZE = 15;

function attachmentsHtml(attachments) {
  if (!attachments || !attachments.length) return "";
  const rows = attachments
    .map(
      (a) => `
      <li>
        <a href="${escapeHtml(a.file)}" download>
          <span class="attach-icon" aria-hidden="true">↓</span>
          <span class="attach-name">${escapeHtml(a.name)}</span>
        </a>
      </li>`
    )
    .join("");
  return `
    <div class="attachments">
      <h3 class="attachments-title">첨부파일</h3>
      <ul class="attachment-list">${rows}</ul>
    </div>`;
}

// Newest first, but anything pinned floats to the top.
function sortItems(items) {
  return items.slice().sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}

function matchesQuery(item, q) {
  if (!q) return true;
  const haystack = [
    item.title,
    item.category,
    // bodyHtml is generated markup; strip tags so searches hit the words only.
    String(item.bodyHtml || "").replace(/<[^>]*>/g, " "),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function initBoardPage({ path, wrapperKey, page, emptyText, labels }) {
  const container = document.getElementById("board-container");

  (async function () {
    const site = await initLayout();
    const orgName = site ? site.orgName : "학회";

    let items = [];
    try {
      const data = await fetchJSON(path);
      items = data[wrapperKey] || [];
    } catch (e) {
      console.error(e);
      container.innerHTML = '<p class="empty-state">목록을 불러오지 못했습니다.</p>';
      document.title = `${labels.title} | ${orgName}`;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      renderDetail(items.find((n) => String(n.id) === String(id)), orgName);
      return;
    }

    document.title = `${labels.title} | ${orgName}`;
    renderList(items, params.get("q") || "", Number(params.get("page")) || 1);
  })();

  function renderDetail(item, orgName) {
    if (!item) {
      container.innerHTML = `
        <a class="back-link" href="${page}">&larr; 목록으로</a>
        <p class="empty-state">존재하지 않는 게시물입니다.</p>`;
      document.title = `${labels.title} | ${orgName}`;
      return;
    }
    document.title = `${item.title} | ${orgName}`;
    container.innerHTML = `
      <a class="back-link" href="${page}">&larr; 목록으로</a>
      <article class="notice-detail">
        <h2>${escapeHtml(item.title)}</h2>
        <div class="notice-meta">${escapeHtml(item.category || "")} · ${escapeHtml(item.date)}</div>
        <div class="notice-body rich">${item.bodyHtml || ""}</div>
        ${attachmentsHtml(item.attachments)}
      </article>`;
  }

  function renderList(allItems, query, pageNum) {
    const filtered = sortItems(allItems).filter((n) => matchesQuery(n, query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(Math.max(1, pageNum), totalPages);
    const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    const searchBar = `
      <form class="board-search" id="board-search" role="search">
        <input type="search" name="q" id="board-search-input"
               placeholder="제목·내용 검색" value="${escapeHtml(query)}"
               aria-label="${escapeHtml(labels.title)} 검색" />
        <button type="submit">검색</button>
        ${query ? `<a class="search-clear" href="${page}">검색 취소</a>` : ""}
      </form>`;

    if (filtered.length === 0) {
      container.innerHTML = `
        ${searchBar}
        <p class="empty-state">${query ? `‘${escapeHtml(query)}’에 대한 검색 결과가 없습니다.` : emptyText}</p>`;
      bindSearch();
      return;
    }

    const rows = slice
      .map(
        (n) => `
      <a class="notice-row" href="${page}?id=${encodeURIComponent(n.id)}">
        <span class="notice-category">${escapeHtml(n.category || "일반")}</span>
        <span class="notice-title">
          ${n.pinned ? '<span class="pin-badge">중요</span>' : ""}
          ${escapeHtml(n.title)}
          ${n.attachments && n.attachments.length ? '<span class="attach-mark" title="첨부파일 있음">📎</span>' : ""}
        </span>
        <span class="notice-date">${escapeHtml(n.date)}</span>
      </a>`
      )
      .join("");

    container.innerHTML = `
      ${searchBar}
      ${query ? `<p class="search-summary">‘${escapeHtml(query)}’ 검색 결과 ${filtered.length}건</p>` : ""}
      <div class="notice-list">${rows}</div>
      ${paginationHtml(current, totalPages, query)}`;
    bindSearch();
  }

  function paginationHtml(current, totalPages, query) {
    if (totalPages <= 1) return "";
    const href = (p) => {
      const qs = new URLSearchParams();
      if (query) qs.set("q", query);
      if (p > 1) qs.set("page", String(p));
      const s = qs.toString();
      return s ? `${page}?${s}` : page;
    };
    const links = [];
    for (let p = 1; p <= totalPages; p++) {
      links.push(
        `<a class="page-link ${p === current ? "active" : ""}" href="${href(p)}">${p}</a>`
      );
    }
    return `
      <nav class="pagination" aria-label="페이지">
        ${current > 1 ? `<a class="page-link" href="${href(current - 1)}">이전</a>` : ""}
        ${links.join("")}
        ${current < totalPages ? `<a class="page-link" href="${href(current + 1)}">다음</a>` : ""}
      </nav>`;
  }

  function bindSearch() {
    const form = document.getElementById("board-search");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("board-search-input").value.trim();
      window.location.href = q ? `${page}?q=${encodeURIComponent(q)}` : page;
    });
  }
}
