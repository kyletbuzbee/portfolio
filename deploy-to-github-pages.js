#!/usr/bin/env node

/**
 * GitHub Pages Deployment Script
 * Deploys multiple projects from manifest.json to GitHub Pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// Projects suitable for GitHub Pages deployment
const deployableProjects = manifest.projects.filter(project =>
  project.techStack.some(tech =>
    ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'Vite', 'Next.js'].includes(tech)
  ) &&
  !project.techStack.includes('Flutter') &&
  !project.techStack.includes('Python') &&
  !project.techStack.includes('Streamlit')
);

console.log(`Found ${deployableProjects.length} deployable projects:`);
deployableProjects.forEach(p => console.log(`- ${p.id}: ${p.title}`));

async function deployProject(project) {
  const repoName = project.repoUrl.split('/').pop();
  const repoPath = path.join(process.cwd(), 'repos', repoName);

  console.log(`\n🚀 Deploying ${project.title}...`);

  try {
    // Clone or pull repository
    if (!fs.existsSync(repoPath)) {
      execSync(`git clone ${project.repoUrl} "${repoPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`cd "${repoPath}" && git pull`, { stdio: 'inherit' });
    }

    process.chdir(repoPath);

    // Install dependencies
    if (fs.existsSync('package.json')) {
      execSync('npm install', { stdio: 'inherit' });
    }

    // Build project based on tech stack
    if (project.techStack.includes('Vite')) {
      execSync('npm run build', { stdio: 'inherit' });
      // Vite builds to 'dist' by default
    } else if (project.techStack.includes('Next.js')) {
      // Export Next.js for static hosting
      execSync('npm run export', { stdio: 'inherit' });
    } else if (project.techStack.includes('React') && fs.existsSync('build')) {
      execSync('npm run build', { stdio: 'inherit' });
    }

    // Deploy to GitHub Pages
    const buildDir = getBuildDirectory(project);
    if (fs.existsSync(buildDir)) {
      execSync(`npx gh-pages -d ${buildDir} -b gh-pages`, { stdio: 'inherit' });
      console.log(`✅ ${project.title} deployed to https://${repoName}.github.io`);
    } else {
      console.log(`❌ Build directory ${buildDir} not found for ${project.title}`);
    }

  } catch (error) {
    console.error(`❌ Failed to deploy ${project.title}:`, error.message);
  } finally {
    process.chdir(process.cwd());
  }
}

function getBuildDirectory(project) {
  if (project.techStack.includes('Vite')) return 'dist';
  if (project.techStack.includes('Next.js')) return 'out';
  if (project.techStack.includes('React')) return 'build';
  return 'dist'; // fallback
}

// Deploy all suitable projects
async function deployAll() {
  for (const project of deployableProjects) {
    await deployProject(project);
  }
  console.log('\n🎉 All deployments completed!');
}

// Run deployment
deployAll().catch(console.error);
