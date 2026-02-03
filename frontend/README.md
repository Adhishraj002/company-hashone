# Hashone Careers Website

A premium, modern single-page website for Hashone Careers recruitment company.

## Files Structure

**Only 3 files needed:**
- `index.html` - All HTML content (single file)
- `styles.css` - All styling and design
- `script.js` - All JavaScript functionality

## Features

- **Single Page Application**: All content in one HTML file with JavaScript-based navigation
- **Premium Design**: Modern, professional UI with gradient effects and animations
- **CRUD Operations**: Manage job roles (Create, Read, Update, Delete) with localStorage persistence
- **Responsive Design**: Fully responsive for all devices
- **Online Background Images**: Uses free stock images from Unsplash
- **Google Form Integration**: Ready for job application forms

## How It Works

The website uses JavaScript to show/hide different "pages" when you click navigation items. All content is in one HTML file, but it appears as separate pages to users.

## Setup Instructions

1. Open `index.html` in a web browser
2. Click navigation items to switch between pages
3. To access admin panel for managing jobs, add `?admin=true` to the URL
4. Update social media links in `script.js` (LinkedIn and Instagram URLs)

## Navigation

- **Home**: Overview of all sections with links to detail pages
- **About Us**: Full company information, founders, and team
- **Services**: Detailed information about all 4 services
- **Open Roles**: Job listings with CRUD functionality
- **Contact Us**: Complete contact information

## How to Change Background Images

See `BACKGROUND_IMAGES_GUIDE.md` for detailed instructions on:
- Finding free background images online
- Updating the hero section background
- Recommended image sources (Unsplash, Pexels, Pixabay)

**Quick Steps:**
1. Find an image on Unsplash.com
2. Copy the image URL
3. Open `styles.css`
4. Find the `.hero` section (around line 130)
5. Replace the URL in the `background-image` property

## Google Form Integration

For each job role:
1. Create a Google Form with fields: Name, Email, Phone, Role, Current CTC, Notice Period, Resume Upload
2. Get the form URL
3. Update the `formUrl` in the jobs array in `script.js` or use the admin panel

## Admin Panel Usage

1. Go to `index.html?admin=true`
2. Navigate to "Open Roles" page
3. Click "Manage Roles" button
4. Fill in the form to add/edit jobs
5. Click "Save Job" to save
6. Use Edit/Delete buttons on job cards to manage existing jobs

## Customization

- **Colors**: Update CSS variables in `styles.css` (`:root` section)
- **Fonts**: Currently using Inter font from Google Fonts
- **Content**: All content is in `index.html`, easy to edit
- **Background Images**: See `BACKGROUND_IMAGES_GUIDE.md`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All job data is stored in browser localStorage
- Social media links need to be updated in `script.js` (SOCIAL_LINKS object)
- About Us story section is ready for your content in the About page
- The website is optimized for performance and SEO
- No local images required - all backgrounds use online sources

## Contact

For any questions or updates, contact:
- Email: info@hashone.co.in
- Phone: +91 9789288938
