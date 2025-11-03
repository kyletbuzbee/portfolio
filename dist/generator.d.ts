import { ProjectManifest } from './types.js';
export declare class CaseStudyGenerator {
    private templatePath;
    private stylesPath;
    private template;
    constructor(templatePath: string, stylesPath: string);
    initialize(): Promise<void>;
    validateManifest(manifestPath: string): Promise<ProjectManifest>;
    optimizeImage(imagePath: string, outputPath: string): Promise<void>;
    generateHTML(manifest: ProjectManifest): Promise<string>;
    private generateJsonLd;
    private generateSeoMeta;
    generatePDF(html: string, outputPath: string): Promise<void>;
    generate(manifestPath: string, outputDir: string): Promise<void>;
}
//# sourceMappingURL=generator.d.ts.map