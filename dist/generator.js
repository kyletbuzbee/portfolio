import * as fs from 'fs/promises';
import * as path from 'path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { ProjectManifestSchema } from './types.js';
import Handlebars from 'handlebars';
export class CaseStudyGenerator {
    constructor(templatePath, stylesPath) {
        this.templatePath = templatePath;
        this.stylesPath = stylesPath;
    }
    async initialize() {
        const templateContent = await fs.readFile(this.templatePath, 'utf-8');
        const stylesContent = await fs.readFile(this.stylesPath, 'utf-8');
        // Register helpers
        Handlebars.registerHelper('formatDate', (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });
        Handlebars.registerHelper('join', (array, separator) => {
            return array.join(separator);
        });
        // Compile template
        this.template = Handlebars.compile(templateContent);
        // Register styles as partial
        Handlebars.registerPartial('styles', `<style>${stylesContent}</style>`);
    }
    async validateManifest(manifestPath) {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifestData = JSON.parse(manifestContent);
        return ProjectManifestSchema.parse(manifestData);
    }
    async optimizeImage(imagePath, outputPath) {
        await sharp(imagePath)
            .webp({ quality: 85 })
            .toFile(outputPath);
    }
    async generateHTML(manifest) {
        const html = this.template({
            ...manifest,
            jsonLd: this.generateJsonLd(manifest),
            seoMeta: this.generateSeoMeta(manifest)
        });
        return html;
    }
    generateJsonLd(manifest) {
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": manifest.title,
            "description": manifest.shortDescription,
            "datePublished": manifest.date,
            "author": {
                "@type": "Person",
                "jobTitle": manifest.role
            },
            "about": manifest.techStack.map((tech) => ({
                "@type": "Technology",
                "name": tech
            })),
            "image": manifest.heroImage,
            "url": manifest.liveUrl || manifest.repoUrl
        };
        return JSON.stringify(jsonLd, null, 2);
    }
    generateSeoMeta(manifest) {
        return {
            title: `${manifest.title} - Case Study`,
            description: manifest.shortDescription,
            keywords: manifest.tags?.join(', ') || '',
            ogImage: manifest.heroImage,
            ogUrl: manifest.liveUrl || manifest.repoUrl
        };
    }
    async generatePDF(html, outputPath) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            // Wait for images to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1in',
                    right: '1in',
                    bottom: '1in',
                    left: '1in'
                }
            });
        }
        finally {
            await browser.close();
        }
    }
    async generate(manifestPath, outputDir) {
        // Validate manifest
        const manifest = await this.validateManifest(manifestPath);
        // Create output directory
        const projectDir = path.join(outputDir, manifest.id);
        await fs.mkdir(projectDir, { recursive: true });
        // Generate HTML
        const html = await this.generateHTML(manifest);
        const htmlPath = path.join(projectDir, 'index.html');
        await fs.writeFile(htmlPath, html);
        // Generate PDF
        const pdfPath = path.join(projectDir, `${manifest.id}.pdf`);
        await this.generatePDF(html, pdfPath);
        console.log(`Generated case study for ${manifest.title}`);
        console.log(`HTML: ${htmlPath}`);
        console.log(`PDF: ${pdfPath}`);
    }
}
//# sourceMappingURL=generator.js.map