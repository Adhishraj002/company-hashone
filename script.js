
const API_BASE = "https://company-hashone.onrender.com";

// Page Navigation System
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.remove('active');
        
    }
}

// Navigation functionality
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Handle navigation clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (link) {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
        // Update URL hash
        window.location.hash = pageId;
    }
});

// Handle hash changes (back/forward buttons)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    showPage(hash);
});

// Initialize page on load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1) || 'home';
    showPage(hash);
});

// Navbar scroll effect
if (navbar) {
    window.addEventListener("scroll", () => {
  if (window.scrollY > 50) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");

  if (window.scrollY > 300) scrollToTopBtn.classList.add("show");
  else scrollToTopBtn.classList.remove("show");
});

}

// Mobile menu toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Count Up Animation Function
function animateCountUp(element, target, suffix = '', duration = 2000) {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
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

// Initialize Count Up Animations when elements are visible
function initCountUpAnimations() {
    const countUpElements = document.querySelectorAll('.count-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'));
                const suffix = entry.target.getAttribute('data-suffix') || '';
                animateCountUp(entry.target, target, suffix);
            }
        });
    }, {
        threshold: 0.5
    });
    
    countUpElements.forEach(element => {
        observer.observe(element);
    });
}

// Job Roles CRUD Operations
let jobs = [];

// Load jobs from localStorage on page load
function loadJobs() {
    fetch(`${API_BASE}/jobs`)
        .then(res => res.json())
        .then(data => {
            jobs = data;
            renderJobs();
            loadJobsPreview();
        })
        .catch(err => console.error("Job load error:", err));
}



// Render jobs to the page (public view - no admin controls)
function renderJobs() {
    const rolesGrid = document.getElementById('rolesGrid');
    if (!rolesGrid) return;
    
    rolesGrid.innerHTML = '';
    
    jobs.forEach((job, index) => {
        const jobCard = document.createElement('div');
        jobCard.className = 'role-card';
        jobCard.setAttribute('data-aos', 'fade-up');
        jobCard.setAttribute('data-aos-delay', (index * 100).toString());
        jobCard.innerHTML = `
            <div class="role-header">
                <h3 class="role-title">${job.title}</h3>
                <div class="role-meta">
                    <span class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.location}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-briefcase"></i>
                        ${job.experience}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ${job.type}
                    </span>
                </div>
            </div>
            <p class="role-description">${job.description}</p>
            <div class="role-actions">
                <a href="${job.formUrl}" target="_blank" class="btn-apply">Apply Now</a>
            </div>
        `;
        rolesGrid.appendChild(jobCard);
    });
    
    // Re-initialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Load preview jobs on home page
function loadJobsPreview() {
    const rolesPreview = document.getElementById('rolesPreview');
    if (!rolesPreview) return;
    
    rolesPreview.innerHTML = '';
    const previewJobs = jobs.slice(0, 3); // Show only 3 jobs on home page
    
    previewJobs.forEach((job, index) => {
        const jobCard = document.createElement('div');
        jobCard.className = 'role-card';
        jobCard.setAttribute('data-aos', 'fade-up');
        jobCard.setAttribute('data-aos-delay', (index * 100).toString());
        jobCard.innerHTML = `
            <div class="role-header">
                <h3 class="role-title">${job.title}</h3>
                <div class="role-meta">
                    <span class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.location}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-briefcase"></i>
                        ${job.experience}
                    </span>
                </div>
            </div>
            <p class="role-description">${job.description.substring(0, 100)}...</p>
            <a href="#" data-page="roles" class="btn-apply">View Details</a>
        `;
        rolesPreview.appendChild(jobCard);
    });
    
    // Re-initialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Load website content from localStorage
function loadWebsiteContent() {
    const savedContent = localStorage.getItem('hashoneContent');
    if (savedContent) {
        const content = JSON.parse(savedContent);
        
        // Update Home page
        if (content.home) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroTitle && content.home.heroTitle) heroTitle.textContent = content.home.heroTitle;
            if (heroSubtitle && content.home.heroSubtitle) heroSubtitle.textContent = content.home.heroSubtitle;
            
            // Update stats
            if (content.home.statClients) {
                const clientsStat = document.querySelector('.stat-item:nth-child(1) .count-up');
                if (clientsStat) {
                    clientsStat.setAttribute('data-target', content.home.statClients);
                    clientsStat.textContent = '0+';
                }
            }
            if (content.home.statPlacements) {
                const placementsStat = document.querySelector('.stat-item:nth-child(2) .count-up');
                if (placementsStat) {
                    placementsStat.setAttribute('data-target', content.home.statPlacements);
                    placementsStat.textContent = '0+';
                }
            }
            if (content.home.statExperience) {
                const experienceStat = document.querySelector('.stat-item:nth-child(3) .count-up');
                if (experienceStat) {
                    experienceStat.setAttribute('data-target', content.home.statExperience);
                    experienceStat.textContent = '0+';
                }
            }
        }
        
        // Update About page
        if (content.about) {
            const aboutEstablished = document.querySelector('#about .info-item:nth-child(1) p');
            if (aboutEstablished && content.about.established) {
                aboutEstablished.textContent = content.about.established;
            }
            
            const teamCount = document.querySelector('#about .info-item:nth-child(2) .count-up');
            if (teamCount && content.about.teamCount) {
                teamCount.setAttribute('data-target', content.about.teamCount);
                teamCount.textContent = '0';
            }
            
            const clientsCount = document.querySelector('#about .info-item:nth-child(3) .count-up');
            if (clientsCount && content.about.clientsCount) {
                clientsCount.setAttribute('data-target', content.about.clientsCount);
                clientsCount.textContent = '0+';
            }
            
            const mission = document.querySelector('#about .info-item:nth-child(4) p.justify-text');
            if (mission && content.about.mission) {
                mission.textContent = content.about.mission;
            }
            
            // Update founders (new layout ids)
            const f1Name = document.getElementById('founder1NameDisplay');
            const f1Role = document.getElementById('founder1RoleDisplay');
            const f1Bio = document.getElementById('founder1BioDisplay');
            const f2Name = document.getElementById('founder2NameDisplay');
            const f2Role = document.getElementById('founder2RoleDisplay');
            const f2Bio = document.getElementById('founder2BioDisplay');
            const f1Photo = document.getElementById('founder1Photo');
            const f2Photo = document.getElementById('founder2Photo');

            if (f1Name && content.about.founder1Name) f1Name.textContent = content.about.founder1Name;
            if (f1Role && content.about.founder1Role) f1Role.textContent = content.about.founder1Role;
            if (f1Bio && content.about.founder1Bio) f1Bio.textContent = content.about.founder1Bio;
            if (f2Name && content.about.founder2Name) f2Name.textContent = content.about.founder2Name;
            if (f2Role && content.about.founder2Role) f2Role.textContent = content.about.founder2Role;
            if (f2Bio && content.about.founder2Bio) f2Bio.textContent = content.about.founder2Bio;
            if (f1Photo && content.about.founder1Photo) f1Photo.src = content.about.founder1Photo;
            if (f2Photo && content.about.founder2Photo) f2Photo.src = content.about.founder2Photo;
        }
        
        // Update Contact page
        if (content.contact) {
            const contactAddress = document.querySelector('#contact .contact-card:nth-child(1) p');
            if (contactAddress && content.contact.address) {
                contactAddress.innerHTML = content.contact.address.replace(/\n/g, '<br>');
            }
            
            const contactPhone = document.querySelector('#contact .contact-card:nth-child(2) p a');
            if (contactPhone && content.contact.phone) {
                contactPhone.textContent = content.contact.phone;
                contactPhone.href = 'tel:' + content.contact.phone.replace(/\s/g, '');
            }
            
            const contactEmail = document.querySelector('#contact .contact-card:nth-child(3) p a');
            if (contactEmail && content.contact.email) {
                contactEmail.textContent = content.contact.email;
                contactEmail.href = 'mailto:' + content.contact.email;
            }
            
            const contactHours = document.querySelector('#contact .contact-card:nth-child(4) p');
            if (contactHours && content.contact.hours) {
                contactHours.innerHTML = content.contact.hours.replace(/\n/g, '<br>');
            }
            
            const contactGST = document.querySelector('#contact .contact-card:nth-child(5) p');
            if (contactGST && content.contact.gst) {
                contactGST.textContent = content.contact.gst;
            }
            
            // Update social links
            const linkedinLink = document.getElementById('linkedinLink');
            if (linkedinLink && content.contact.linkedin) {
                linkedinLink.href = content.contact.linkedin;
            }
            
            const instagramLink = document.getElementById('instagramLink');
            if (instagramLink && content.contact.instagram) {
                instagramLink.href = content.contact.instagram;
            }
        }
    }
}

// Load team members from localStorage
function loadTeamMembers() {
    const savedMembers = localStorage.getItem('hashoneTeamMembers');
    if (savedMembers) {
        const members = JSON.parse(savedMembers);
        const teamGrid = document.querySelector('.team-grid');
        if (teamGrid && members.length > 0) {
            teamGrid.innerHTML = '';
            members.forEach((member, index) => {
                const memberCard = document.createElement('div');
                memberCard.className = 'team-member';
                memberCard.setAttribute('data-aos', 'flip-left');
                memberCard.setAttribute('data-aos-delay', ((index + 1) * 100).toString());
                
                const avatar = member.photo 
                    ? `<img src="${member.photo}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : '<i class="fas fa-user"></i>';
                
                memberCard.innerHTML = `
                    <div class="team-avatar">
                        ${avatar}
                    </div>
                    <h4>${member.name}</h4>
                    <p>${member.role}</p>
                    ${member.bio ? `<p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.5rem;">${member.bio}</p>` : ''}
                `;
                teamGrid.appendChild(memberCard);
            });
            
            // Re-initialize AOS
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    loadJobs();
    loadWebsiteContent();
    loadTeamMembers();
    
    // Initialize count-up animations after a short delay
    setTimeout(() => {
        initCountUpAnimations();
    }, 1000);

});

// Social Media Links Configuration
const SOCIAL_LINKS = {
    linkedin: '#', // Replace with your LinkedIn URL
    instagram: '#'  // Replace with your Instagram URL
};

// Set social media links
document.addEventListener('DOMContentLoaded', () => {
    const linkedinLink = document.getElementById('linkedinLink');
    const instagramLink = document.getElementById('instagramLink');
    
    if (linkedinLink) {
        linkedinLink.href = SOCIAL_LINKS.linkedin;
    }
    if (instagramLink) {
        instagramLink.href = SOCIAL_LINKS.instagram;
    }
    
    // Initialize animations
    if (typeof AOS !== 'undefined') {
        window.addEventListener("load", () => {
            AOS.init({
                duration: 800,
                once: true,
                offset: 120
            });
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add subtle parallax effect to hero section (optional - can be disabled if it causes issues)
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        if (scrolled < heroHeight) {
            const rate = scrolled * 0.3;
            hero.style.transform = `translateY(${rate}px)`;
        }
    }
});

document.querySelectorAll(".read-more-btn").forEach(btn => {
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
});
