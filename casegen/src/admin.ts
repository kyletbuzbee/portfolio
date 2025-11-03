import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import { CaseStudyGenerator } from './generator.js';

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Initialize generator
const generator = new CaseStudyGenerator(
  path.join(process.cwd(), 'casegen/templates/case.hbs'),
  path.join(process.cwd(), 'casegen/templates/styles.css')
);

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Generator Admin</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .upload-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <h1>Portfolio Generator Admin</h1>

    <div class="upload-form">
        <h2>Upload Project Manifest</h2>
        <form id="uploadForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="manifest">Manifest JSON File:</label>
                <input type="file" id="manifest" name="manifest" accept=".json" required>
            </div>
            <div class="form-group">
                <label for="assets">Project Assets (optional):</label>
                <input type="file" id="assets" name="assets" multiple accept="image/*">
            </div>
            <button type="submit">Generate Case Study</button>
        </form>
    </div>

    <div id="result"></div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const resultDiv = document.getElementById('result');

            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            <h3>✅ Case study generated successfully!</h3>
                            <p><strong>HTML:</strong> <a href="\${result.htmlPath}" target="_blank">\${result.htmlPath}</a></p>
                            <p><strong>PDF:</strong> <a href="\${result.pdfPath}" target="_blank">\${result.pdfPath}</a></p>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`<div class="result error">❌ Error: \${result.error}</div>\`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`<div class="result error">❌ Error: \${error.message}</div>\`;
            }
        });
    </script>
</body>
</html>
  `);
});

// Handle case study generation
app.post('/generate', upload.fields([
  { name: 'manifest', maxCount: 1 },
  { name: 'assets', maxCount: 10 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files['manifest'] || files['manifest'].length === 0) {
      return res.status(400).json({ error: 'Manifest file is required' });
    }

    const manifestFile = files['manifest'][0];
    const manifestPath = manifestFile.path;

    // Read the manifest to get project ID (before cleanup)
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    const projectId = manifest.id;

    // Generate case study
    await generator.initialize();
    await generator.generate(manifestPath, './dist');

    // Clean up uploaded files
    await fs.unlink(manifestPath);
    if (files['assets']) {
      for (const asset of files['assets']) {
        await fs.unlink(asset.path);
      }
    }

    res.json({
      success: true,
      htmlPath: `/dist/${projectId}/index.html`,
      pdfPath: `/dist/${projectId}/${projectId}.pdf`
    });
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Serve generated files
app.use('/dist', express.static(path.join(process.cwd(), 'dist')));

// Initialize generator on startup
generator.initialize().then(() => {
  app.listen(port, () => {
    console.log(`Portfolio Generator Admin running at http://localhost:${port}`);
  });
}).catch(console.error);
