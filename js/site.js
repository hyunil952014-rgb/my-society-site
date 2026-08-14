// Shared header/footer rendering and small utilities used across all pages.

const NAV_ITEMS = [
  { href: "/index.html", label: "홈" },
  { href: "/about.html", label: "학회 소개" },
  { href: "/board.html", label: "임원진 소개" },
  { href: "/notices.html", label: "공지사항" },
];

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function currentPath() {
  const p = window.location.pathname;
  if (p === "/" || p.endsWith("/")) return "/index.html";
  return p;
}

function renderHeader(orgName, orgNameEn) {
  const active = currentPath();
  const navHtml = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.href === active ? "active" : ""}">${item.label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <div class="container">
      <a href="/index.html" class="brand">
        ${escapeHtml(orgName)}
        <small>${escapeHtml(orgNameEn || "")}</small>
      </a>
      <nav class="nav" id="site-nav">${navHtml}</nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="메뉴 열기">&#9776;</button>
    </div>
  `;

  document.getElementById("nav-toggle").addEventListener("click", () => {
    document.getElementById("site-nav").classList.toggle("open");
  });
}

function renderFooter(orgName, contact) {
  const parts = [];
  if (contact && contact.email) parts.push(`이메일 ${escapeHtml(contact.email)}`);
  if (contact && contact.phone) parts.push(`전화 ${escapeHtml(contact.phone)}`);
  if (contact && contact.address) parts.push(escapeHtml(contact.address));

  document.getElementById("site-footer").innerHTML = `
    <div class="container">
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(orgName)}. All rights reserved.</span>
      <span>${parts.join(" · ")}</span>
    </div>
  `;
}

async function initLayout() {
  try {
    const site = await fetchJSON("/content/site.json");
    renderHeader(site.orgName, site.orgNameEn);
    renderFooter(site.orgName, site.contact);
    return site;
  } catch (e) {
    console.error(e);
    renderHeader("학회", "");
    renderFooter("학회", {});
    return null;
  }
}
