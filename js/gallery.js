// Gallery: albums of photos, each album optionally with a short description.
(async function () {
  const container = document.getElementById("board-container");
  const site = await initLayout();
  const orgName = site ? site.orgName : "학회";
  document.title = `갤러리 | ${orgName}`;

  let albums = [];
  try {
    const data = await fetchJSON("/content/gallery.json");
    albums = (data.items || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="empty-state">갤러리를 불러오지 못했습니다.</p>';
    return;
  }

  const withPhotos = albums.filter((a) => (a.photos || []).length);
  if (!withPhotos.length) {
    container.innerHTML = '<p class="empty-state">등록된 사진이 없습니다.</p>';
    return;
  }

  container.innerHTML = withPhotos
    .map(
      (album) => `
    <section class="album">
      <div class="album-head">
        <h2 class="album-title">${escapeHtml(album.title)}</h2>
        <span class="album-date">${escapeHtml(album.date)}</span>
      </div>
      ${album.bodyHtml ? `<div class="album-desc rich">${album.bodyHtml}</div>` : ""}
      <div class="photo-grid">
        ${album.photos
          .map(
            (p) => `
          <figure class="photo">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.caption || album.title)}" loading="lazy" />
            ${p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ""}
          </figure>`
          )
          .join("")}
      </div>
    </section>`
    )
    .join("");
})();
