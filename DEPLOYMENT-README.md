# GitHub Pages Deployment Guide

This guide explains how to deploy multiple projects from your manifest to GitHub Pages.

## Projects Suitable for GitHub Pages

Based on your manifest.json, these projects can be deployed to GitHub Pages:

✅ **Deployable Projects:**
- `accessible-design-system` (React/TypeScript/Storybook)
- `ai-code-review-assistant` (Next.js)
- `conversion-landing-page-suite` (React/TypeScript/Vite)
- `kl-recycling-website` (HTML/CSS/JS/PWA)
- `outreach-admin-dashboard` (React/TypeScript)
- `interactive-messaging-app` (React)
- `gemini-recipe-generator` (React/TypeScript/Vite)

❌ **Not Suitable:**
- `kl-crm` (Python/Streamlit - requires server)
- `kl-recycling-app` (Flutter - mobile app)

## Quick Start

### 1. Prerequisites

```bash
# Install dependencies for deployment script
npm install gh-pages

# Make sure you have access to all project repositories
# Update manifest.json repoUrl fields with actual GitHub URLs
```

### 2. Automated Deployment

Run the deployment script:

```bash
node deploy-to-github-pages.js
```

This will:
- Clone/pull all project repositories
- Install dependencies
- Build projects
- Deploy to GitHub Pages
- Update manifest with live URLs

### 3. Manual Deployment per Project

For individual projects:

```bash
# 1. Clone the project
git clone https://github.com/username/project-repo
cd project-repo

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Deploy to GitHub Pages
npx gh-pages -d dist  # or build/output directory
```

## Framework-Specific Instructions

### React + Vite Projects
```bash
npm run build  # builds to 'dist'
npx gh-pages -d dist
```

### Next.js Projects
```bash
# Add to package.json scripts:
"export": "next export"

npm run export  # builds to 'out'
npx gh-pages -d out
```

### Create React App
```bash
npm run build  # builds to 'build'
npx gh-pages -d build
```

## GitHub Actions Automation

The included workflow (`.github/workflows/deploy-projects.yml`) automatically deploys when:
- `manifest.json` is updated
- Manually triggered

## Custom Domain Setup

For custom domains, add `CNAME` file to your build directory:

```bash
echo "yourdomain.com" > dist/CNAME
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are installed
2. **404 errors**: Ensure correct build directory is specified
3. **Permission denied**: Check repository access and GitHub token
4. **Next.js routing**: May need `next.config.js` adjustments for static export

### Next.js Static Export Config

For Next.js projects, add to `next.config.js`:

```javascript
module.exports = {
  trailingSlash: true,
  exportPathMap: function() {
    return {
      '/': { page: '/' }
    };
  },
};
```

## Live URLs

After deployment, projects will be available at:
`https://{username}.github.io/{repository-name}`

Update your manifest.json `liveUrl` fields with these URLs.

## Batch Deployment Script

The `deploy-to-github-pages.js` script handles:
- Automatic project detection from manifest
- Framework-specific build commands
- Error handling and logging
- Parallel deployment (can be modified)

## Security Notes

- Never commit sensitive data to GitHub Pages
- Use environment variables for API keys
- Consider using GitHub Actions secrets for automated deployments
