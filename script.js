/* ================= CONFIG ================= */
const API_BASE = typeof window !== "undefined" && window.API_BASE_URL ? window.API_BASE_URL : "https://company-hashone.onrender.com";

// Page Navigation System
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (pageId === "roles") {
    loadJobs();
  }
  if (pageId === "home" || pageId === "about" || pageId === "contact") {
    loadWebsiteContent();
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-page") === pageId) {
      link.classList.add("active");
    }
  });

  const navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.classList.remove("active");
  }
}

const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const scrollToTopBtn = document.getElementById("scrollToTop");

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if (link) {
    e.preventDefault();
    const pageId = link.getAttribute("data-page");
    showPage(pageId);
    window.location.hash = pageId;
  }
});

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.substring(1) || "home";
  showPage(hash);
});

window.addEventListener("load", () => {
  const hash = window.location.hash.substring(1) || "home";
  showPage(hash);
});

if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    if (window.scrollY > 300) scrollToTopBtn.classList.add("show");
    else scrollToTopBtn.classList.remove("show");
  });
}

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
}

// Count Up Animation
function animateCountUp(element, target, suffix = "", duration = 2000) {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);
    element.textContent = current + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target + suffix;
    }
  }
  requestAnimationFrame(update);
}

function initCountUpAnimations() {
  const countUpElements = document.querySelectorAll(".count-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains("counted")) {
          entry.target.classList.add("counted");
          const target = parseInt(entry.target.getAttribute("data-target"), 10) || 0;
          const suffix = entry.target.getAttribute("data-suffix") || "";
          animateCountUp(entry.target, target, suffix);
        }
      });
    },
    { threshold: 0.5 }
  );
  countUpElements.forEach((el) => observer.observe(el));
}

// ================= JOBS (from backend) =================
let jobs = [];

function loadJobs() {
  fetch(`${API_BASE}/api/jobs`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    })
    .then((data) => {
      jobs = data;
      renderJobs();
      loadJobsPreview();
    })
    .catch((err) => console.error(err));
}

function renderJobs() {
  const rolesGrid = document.getElementById("rolesGrid");
  if (!rolesGrid) return;

  rolesGrid.innerHTML = "";
  jobs.forEach((job, index) => {
    const jobCard = document.createElement("div");
    jobCard.className = "role-card";
    jobCard.setAttribute("data-aos", "fade-up");
    jobCard.setAttribute("data-aos-delay", (index * 100).toString());
    jobCard.innerHTML = `
      <div class="role-header">
        <h3 class="role-title">${escapeHtml(job.title)}</h3>
        <div class="role-meta">
          <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
          <span class="meta-item"><i class="fas fa-briefcase"></i> ${escapeHtml(job.experience)}</span>
          <span class="meta-item"><i class="fas fa-clock"></i> ${escapeHtml(job.job_type)}</span>
        </div>
      </div>
      <p class="role-description">${escapeHtml(job.description)}</p>
      <div class="role-actions">
        <a href="${escapeAttr(job.formUrl)}" target="_blank" rel="noopener" class="btn-apply">Apply Now</a>
      </div>
    `;
    rolesGrid.appendChild(jobCard);
  });

  if (typeof AOS !== "undefined") AOS.refresh();
}

function loadJobsPreview() {
  const rolesPreview = document.getElementById("rolesPreview");
  if (!rolesPreview) return;

  rolesPreview.innerHTML = "";
  const previewJobs = jobs.slice(0, 3);
  previewJobs.forEach((job, index) => {
    const jobCard = document.createElement("div");
    jobCard.className = "role-card";
    jobCard.setAttribute("data-aos", "fade-up");
    jobCard.setAttribute("data-aos-delay", (index * 100).toString());
    const desc = (job.description || "").substring(0, 1000);
    jobCard.innerHTML = `
      <div class="role-header">
        <h3 class="role-title">${escapeHtml(job.title)}</h3>
        <div class="role-meta">
          <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
          <span class="meta-item"><i class="fas fa-briefcase"></i> ${escapeHtml(job.experience)}</span>
          <span class="meta-item"><i class="fas fa-clock"></i> ${escapeHtml(job.job_type)}</span>
        </div>
      </div>
      <p class="role-description">${escapeHtml(desc)}${job.description && job.description.length > 1000 ? "..." : ""}</p>
      <a href="#" data-page="roles" class="btn-apply">View Details</a>
    `;
    rolesPreview.appendChild(jobCard);
  });
  if (typeof AOS !== "undefined") AOS.refresh();
}

function escapeHtml(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  if (str == null) return "#";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ================= WEBSITE CONTENT (from backend) =================
function loadWebsiteContent() {
  fetch(`${API_BASE}/api/site-content`)
    .then((res) => (res.ok ? res.json() : {}))
    .then((sections) => {
      applyWebsiteContent(sections);
    })
    .catch(() => {
      applyWebsiteContent({});
    });
}

function applyWebsiteContent(sections) {
  const content = {
    home: sections.home || {},
    about: sections.about || {},
    contact: sections.contact || {},
  };

  // Home
  if (content.home) {
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    if (heroTitle && content.home.heroTitle) heroTitle.textContent = content.home.heroTitle;
    if (heroSubtitle && content.home.heroSubtitle) heroSubtitle.textContent = content.home.heroSubtitle;

    const clientsStat = document.querySelector(".hero-stats .stat-item:nth-child(1) .count-up");
    const placementsStat = document.querySelector(".hero-stats .stat-item:nth-child(2) .count-up");
    const experienceStat = document.querySelector(".hero-stats .stat-item:nth-child(3) .count-up");
    if (clientsStat && content.home.statClients != null) {
      clientsStat.setAttribute("data-target", String(content.home.statClients));
      clientsStat.textContent = "0+";
      clientsStat.classList.remove("counted");
    }
    if (placementsStat && content.home.statPlacements != null) {
      placementsStat.setAttribute("data-target", String(content.home.statPlacements));
      placementsStat.textContent = "0+";
      placementsStat.classList.remove("counted");
    }
    if (experienceStat && content.home.statExperience != null) {
      experienceStat.setAttribute("data-target", String(content.home.statExperience));
      experienceStat.textContent = "0+";
      experienceStat.classList.remove("counted");
    }
  }

  // About (home preview stats + about page)
  if (content.about) {
    const aboutEstablished = document.querySelector("#about .info-item:nth-child(1) p");
    if (aboutEstablished && content.about.established) aboutEstablished.textContent = content.about.established;

    const teamCountEl = document.querySelector("#about .info-item:nth-child(2) .count-up");
    if (teamCountEl && content.about.teamCount != null) {
      teamCountEl.setAttribute("data-target", String(content.about.teamCount));
      teamCountEl.textContent = "0";
      teamCountEl.classList.remove("counted");
    }
    const clientsCountEl = document.querySelector("#about .info-item:nth-child(3) .count-up");
    if (clientsCountEl && content.about.clientsCount != null) {
      clientsCountEl.setAttribute("data-target", String(content.about.clientsCount));
      clientsCountEl.textContent = "0+";
      clientsCountEl.classList.remove("counted");
    }
    const mission = document.querySelector("#about .info-item:nth-child(4) p.justify-text");
    if (mission && content.about.mission) mission.textContent = content.about.mission;

    const f1Name = document.getElementById("founder1NameDisplay");
    const f1Role = document.getElementById("founder1RoleDisplay");
    const f1Bio = document.getElementById("founder1BioDisplay");
    const f2Name = document.getElementById("founder2NameDisplay");
    const f2Role = document.getElementById("founder2RoleDisplay");
    const f2Bio = document.getElementById("founder2BioDisplay");
    const f1Photo = document.getElementById("founder1Photo");
    const f2Photo = document.getElementById("founder2Photo");
    if (f1Name && content.about.founder1Name) f1Name.textContent = content.about.founder1Name;
    if (f1Role && content.about.founder1Role) f1Role.textContent = content.about.founder1Role;
    if (f1Bio && content.about.founder1Bio) f1Bio.textContent = content.about.founder1Bio;
    if (f2Name && content.about.founder2Name) f2Name.textContent = content.about.founder2Name;
    if (f2Role && content.about.founder2Role) f2Role.textContent = content.about.founder2Role;
    if (f2Bio && content.about.founder2Bio) f2Bio.textContent = content.about.founder2Bio;
    if (f1Photo && content.about.founder1Photo) f1Photo.src = content.about.founder1Photo;
    if (f2Photo && content.about.founder2Photo) f2Photo.src = content.about.founder2Photo;
  }

  // Contact
  if (content.contact) {
    const phoneLink = document.querySelector("#contact .contact-info .contact-card:first-child p a");
    if (phoneLink && content.contact.phone) {
      phoneLink.textContent = content.contact.phone;
      phoneLink.href = "tel:" + content.contact.phone.replace(/\s/g, "");
    }
    const emailLink = document.querySelector("#contact .contact-info .contact-card:nth-child(2) p a");
    if (emailLink && content.contact.email) {
      emailLink.textContent = content.contact.email;
      emailLink.href = "mailto:" + content.contact.email;
    }
    const socialLinks = document.querySelectorAll("#contact .social-icons a.social-link");
    if (content.contact.linkedin && socialLinks[0]) socialLinks[0].href = content.contact.linkedin;
    if (content.contact.instagram && socialLinks[2]) socialLinks[2].href = content.contact.instagram;
  }

  initCountUpAnimations();
}

// ================= TEAM MEMBERS (from backend) =================
function loadTeamMembers() {
  fetch(`${API_BASE}/api/team-members`)
    .then((res) => (res.ok ? res.json() : []))
    .then((members) => {
      renderTeamMembers(members);
    })
    .catch(() => renderTeamMembers([]));
}

function renderTeamMembers(members) {
  const teamGrid = document.querySelector("#about .team-grid");
  if (!teamGrid) return;

  if (!members || members.length === 0) {
    return; // keep default HTML when no backend data
  }

  teamGrid.innerHTML = "";
  members.forEach((member, index) => {
    const card = document.createElement("div");
    card.className = "team-member";
    card.setAttribute("data-aos", "flip-left");
    card.setAttribute("data-aos-delay", String((index + 1) * 100));
    const avatar = member.photo
      ? `<img src="${escapeAttr(member.photo)}" alt="${escapeHtml(member.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      : '<i class="fas fa-user"></i>';
    card.innerHTML = `
      <div class="team-avatar">${avatar}</div>
      <h4>${escapeHtml(member.name)}</h4>
      <p>${escapeHtml(member.role)}</p>
      ${member.bio ? `<p style="font-size:0.85rem;color:var(--text-light);margin-top:0.5rem;">${escapeHtml(member.bio)}</p>` : ""}
    `;
    teamGrid.appendChild(card);
  });
  if (typeof AOS !== "undefined") AOS.refresh();
}

// Initialize on load
window.addEventListener("load", () => {
  loadJobs();
  loadWebsiteContent();
  loadTeamMembers();
  setTimeout(() => initCountUpAnimations(), 800);
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    window.addEventListener("load", () => {
      AOS.init({ duration: 800, once: true, offset: 120 });
    });
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("scroll", () => {
  const hero = document.querySelector(".hero");
  if (hero && window.innerWidth > 768) {
    const scrolled = window.pageYOffset;
    const heroHeight = hero.offsetHeight;
    if (scrolled < heroHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }
});

document.querySelectorAll(".read-more-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const benefits = this.nextElementSibling;
    if (benefits.style.display === "block") {
      benefits.style.display = "none";
      this.textContent = "Read More";
    } else {
      benefits.style.display = "block";
      this.textContent = "Hide Benefits";
    }
  });

  window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;

  document.querySelectorAll(".page-section").forEach(sec => {
    sec.classList.remove("active");
  });

  const target = document.getElementById(hash);
  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === hash);
  });
});

});
