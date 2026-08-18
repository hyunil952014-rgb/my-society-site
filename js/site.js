// Shared header/footer rendering, auth (Netlify Identity), and small utilities
// used across all pages.

const NAV_ITEMS = [
  { href: "/index.html", label: "홈" },
  { href: "/about.html", label: "학회 소개" },
  { href: "/board.html", label: "임원진 소개" },
  { href: "/education.html", label: "교육안내" },
  { href: "/notices.html", label: "공지사항" },
  { href: "/resources.html", label: "자료실" },
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
        <img src="/images/logo-mark.png" alt="" class="brand-mark" />
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(orgName)}</span>
          <small>${escapeHtml(orgNameEn || "")}</small>
        </span>
      </a>
      <nav class="nav" id="site-nav">
        ${navHtml}
        <span class="auth-area" id="auth-area"></span>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="메뉴 열기">&#9776;</button>
    </div>
  `;

  document.getElementById("nav-toggle").addEventListener("click", () => {
    document.getElementById("site-nav").classList.toggle("open");
  });
}

function socialLinks(social) {
  if (!social) return [];
  const links = [];
  if (social.facebook) links.push({ href: social.facebook, label: "페이스북" });
  if (social.naverCafe) links.push({ href: social.naverCafe, label: "네이버 카페" });
  return links;
}

function renderFooter(orgName, contact, social) {
  const parts = [];
  if (contact && contact.email) parts.push(`이메일 ${escapeHtml(contact.email)}`);
  if (contact && contact.phone) parts.push(`전화 ${escapeHtml(contact.phone)}`);
  if (contact && contact.address) parts.push(escapeHtml(contact.address));

  const links = socialLinks(social)
    .map(
      (l) =>
        `<a href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
    )
    .join("");

  document.getElementById("site-footer").innerHTML = `
    <div class="container">
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(orgName)}. All rights reserved.</span>
      <span>${parts.join(" · ")}</span>
      ${links ? `<span class="footer-social">${links}</span>` : ""}
    </div>
  `;
}

function isAdmin(user) {
  return !!(
    user &&
    user.app_metadata &&
    Array.isArray(user.app_metadata.roles) &&
    user.app_metadata.roles.includes("admin")
  );
}

function renderAuthArea(user) {
  const area = document.getElementById("auth-area");
  if (!area) return;

  if (!user) {
    area.innerHTML = `
      <a href="/join.html" class="auth-link">회원가입</a>
      <button type="button" class="auth-btn" id="auth-login-btn">로그인</button>
    `;
    document.getElementById("auth-login-btn").addEventListener("click", () => {
      window.netlifyIdentity && window.netlifyIdentity.open("login");
    });
    return;
  }

  // Fall back to the local part of the email — a full address is long enough
  // to squeeze the nav out of the header.
  const displayName =
    (user.user_metadata && user.user_metadata.full_name) ||
    String(user.email || "").split("@")[0];
  const adminLink = isAdmin(user)
    ? `<a href="/admin/" class="auth-link admin-link">사이트 편집</a>`
    : "";

  area.innerHTML = `
    <span class="auth-user">${escapeHtml(displayName)}님</span>
    ${adminLink}
    <button type="button" class="auth-btn" id="auth-logout-btn">로그아웃</button>
  `;
  document.getElementById("auth-logout-btn").addEventListener("click", () => {
    window.netlifyIdentity && window.netlifyIdentity.logout();
  });
}

function initAuth() {
  if (!window.netlifyIdentity) {
    renderAuthArea(null);
    return;
  }

  window.netlifyIdentity.on("init", (user) => {
    renderAuthArea(user);
  });

  window.netlifyIdentity.on("login", (user) => {
    renderAuthArea(user);
    window.netlifyIdentity.close();
  });

  window.netlifyIdentity.on("logout", () => {
    renderAuthArea(null);
  });

  // The CDN widget initializes itself on load. Calling init() again spawns a
  // second iframe that covers the page and swallows every click.
  if (!document.getElementById("netlify-identity-widget")) {
    window.netlifyIdentity.init();
  }

  renderAuthArea(window.netlifyIdentity.currentUser());
}

async function initLayout() {
  let site = null;
  try {
    site = await fetchJSON("/content/site.json");
    renderHeader(site.orgName, site.orgNameEn);
    renderFooter(site.orgName, site.contact, site.social);
  } catch (e) {
    console.error(e);
    renderHeader("학회", "");
    renderFooter("학회", {}, null);
  }
  initAuth();
  return site;
}
