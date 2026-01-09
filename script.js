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
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
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

// Job Roles CRUD Operations
let jobs = [
    {
        id: 1,
        title: "Business Development Executive – Digital Marketing",
        location: "Coimbatore",
        experience: "1–3 Years",
        type: "Full-Time",
        description: "Experience in client acquisition and business development for digital marketing services. Strong understanding of digital marketing offerings and client engagement.",
        formUrl: "#"
    },
    {
        id: 2,
        title: "Video Editor",
        location: "Coimbatore",
        experience: "1–3 Years",
        type: "Full-Time",
        description: "Experience in editing short-form and long-form videos for digital platforms. Strong understanding of storytelling, transitions, and visual pacing.",
        formUrl: "#"
    },
    {
        id: 3,
        title: "HR Intern",
        location: "Coimbatore",
        experience: "Fresher / Student",
        type: "Internship",
        description: "Interest in recruitment, HR operations, and candidate coordination. Strong communication skills and willingness to learn.",
        formUrl: "#"
    },
    {
        id: 4,
        title: "UI/UX Intern",
        location: "Coimbatore",
        experience: "Fresher / Student",
        type: "Internship",
        description: "Basic understanding of UI/UX principles, wireframing, and user-centric design. Familiarity with design tools such as Figma or similar platforms.",
        formUrl: "#"
    }
];

// Load jobs from localStorage on page load
function loadJobs() {
    const savedJobs = localStorage.getItem('hashoneJobs');
    if (savedJobs) {
        jobs = JSON.parse(savedJobs);
    }
    renderJobs();
    loadJobsPreview();
}

// Save jobs to localStorage
function saveJobs() {
    localStorage.setItem('hashoneJobs', JSON.stringify(jobs));
}

// Render jobs to the page
function renderJobs() {
    const rolesGrid = document.getElementById('rolesGrid');
    if (!rolesGrid) return;
    
    rolesGrid.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'role-card';
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
                <button class="btn-edit" onclick="editJob(${job.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteJob(${job.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        rolesGrid.appendChild(jobCard);
    });
}

// Load preview jobs on home page
function loadJobsPreview() {
    const rolesPreview = document.getElementById('rolesPreview');
    if (!rolesPreview) return;
    
    rolesPreview.innerHTML = '';
    const previewJobs = jobs.slice(0, 3); // Show only 3 jobs on home page
    
    previewJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'role-card';
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
}

// Add or Update Job
const jobForm = document.getElementById('jobForm');
if (jobForm) {
    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const jobId = document.getElementById('jobId').value;
        const jobData = {
            title: document.getElementById('jobTitle').value,
            location: document.getElementById('jobLocation').value,
            experience: document.getElementById('jobExperience').value,
            type: document.getElementById('jobType').value,
            description: document.getElementById('jobDescription').value,
            formUrl: document.getElementById('jobFormUrl').value
        };
        
        if (jobId) {
            // Update existing job
            const index = jobs.findIndex(job => job.id === parseInt(jobId));
            if (index !== -1) {
                jobs[index] = { ...jobs[index], ...jobData };
            }
        } else {
            // Add new job
            const newId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;
            jobs.push({ id: newId, ...jobData });
        }
        
        saveJobs();
        renderJobs();
        loadJobsPreview();
        resetForm();
        toggleAdminPanel();
    });
}

// Edit Job
function editJob(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        document.getElementById('jobId').value = job.id;
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobExperience').value = job.experience;
        document.getElementById('jobType').value = job.type;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('jobFormUrl').value = job.formUrl;
        
        toggleAdminPanel();
        const jobForm = document.getElementById('jobForm');
        if (jobForm) {
            jobForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Delete Job
function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job posting?')) {
        jobs = jobs.filter(job => job.id !== id);
        saveJobs();
        renderJobs();
        loadJobsPreview();
    }
}

// Reset Form
function resetForm() {
    const jobForm = document.getElementById('jobForm');
    if (jobForm) {
        jobForm.reset();
        const jobId = document.getElementById('jobId');
        if (jobId) {
            jobId.value = '';
        }
    }
}

// Toggle Admin Panel
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
    }
}

// Check for admin parameter in URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminToggle = document.querySelector('.admin-toggle');
    if (adminToggle) {
        if (urlParams.get('admin') === 'true') {
            adminToggle.style.display = 'block';
        } else {
            adminToggle.style.display = 'none';
        }
    }
    
    loadJobs();
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
});
