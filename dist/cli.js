#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CaseStudyGenerator } from './generator.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const program = new Command();
program
    .name('generate-case')
    .description('Generate case study HTML and PDF from project manifest')
    .version('1.0.0');
program
    .command('generate')
    .description('Generate case study from manifest')
    .requiredOption('-m, --manifest <path>', 'Path to project manifest JSON file')
    .option('-o, --output <dir>', 'Output directory', './dist')
    .option('-t, --template <path>', 'Path to Handlebars template', path.join(__dirname, '../casegen/templates/case.hbs'))
    .option('-s, --styles <path>', 'Path to CSS styles file', path.join(__dirname, '../casegen/templates/styles.css'))
    .action(async (options) => {
    try {
        const generator = new CaseStudyGenerator(options.template, options.styles);
        await generator.initialize();
        await generator.generate(options.manifest, options.output);
        console.log('✅ Case study generated successfully!');
    }
    catch (error) {
        console.error('❌ Error generating case study:', error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map