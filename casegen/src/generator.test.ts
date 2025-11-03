import { CaseStudyGenerator } from './generator.js';
import { ProjectManifestSchema } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('CaseStudyGenerator', () => {
  const templatePath = path.join(__dirname, '../templates/case.hbs');
  const stylesPath = path.join(__dirname, '../templates/styles.css');
  let generator: CaseStudyGenerator;

  beforeEach(() => {
    generator = new CaseStudyGenerator(templatePath, stylesPath);
  });

  describe('validateManifest', () => {
    it('should validate a correct manifest', async () => {
      const manifestData = {
        id: 'test-project',
        title: 'Test Project',
        heroImage: 'https://example.com/hero.jpg',
        shortDescription: 'A test project',
        role: 'Developer',
        techStack: ['React', 'Node.js'],
        challenge: 'Test challenge',
        solution: 'Test solution',
        metrics: [{ label: 'Users', value: '1000' }],
        screenshots: [{ url: 'https://example.com/screenshot.jpg', alt: 'Screenshot' }],
        date: '2024-01-01'
      };

      // Create temporary manifest file
      const tempManifestPath = path.join(__dirname, '../../test-manifest.json');
      await fs.writeFile(tempManifestPath, JSON.stringify(manifestData));

      const result = await generator.validateManifest(tempManifestPath);
      expect(result.id).toBe('test-project');
      expect(result.title).toBe('Test Project');

      // Cleanup
      await fs.unlink(tempManifestPath);
    });

    it('should reject invalid manifest', async () => {
      const invalidManifestData = {
        title: 'Test Project'
        // Missing required fields
      };

      const tempManifestPath = path.join(__dirname, '../../invalid-test-manifest.json');
      await fs.writeFile(tempManifestPath, JSON.stringify(invalidManifestData));

      await expect(generator.validateManifest(tempManifestPath)).rejects.toThrow();

      // Cleanup
      await fs.unlink(tempManifestPath);
    });
  });

  describe('generateHTML', () => {
    it('should generate HTML from manifest', async () => {
      await generator.initialize();

      const manifest: any = {
        id: 'test-project',
        title: 'Test Project',
        heroImage: 'https://example.com/hero.jpg',
        shortDescription: 'A test project',
        role: 'Developer',
        techStack: ['React', 'Node.js'],
        challenge: 'Test challenge',
        solution: 'Test solution',
        metrics: [{ label: 'Users', value: '1000' }],
        screenshots: [{ url: 'https://example.com/screenshot.jpg', alt: 'Screenshot' }],
        date: '2024-01-01'
      };

      const html = await generator.generateHTML(manifest);
      expect(html).toContain('Test Project');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test Project - Case Study');
      expect(html).toContain('og:title');
    });
  });
});
