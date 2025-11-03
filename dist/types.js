import { z } from 'zod';
export const MetricSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional(),
});
export const ScreenshotSchema = z.object({
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
});
export const ProjectManifestSchema = z.object({
    id: z.string(),
    title: z.string(),
    heroImage: z.string(),
    shortDescription: z.string(),
    role: z.string(),
    techStack: z.array(z.string()),
    challenge: z.string(),
    solution: z.string(),
    metrics: z.array(MetricSchema),
    screenshots: z.array(ScreenshotSchema),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    date: z.string(), // ISO date
    tags: z.array(z.string()).optional(),
});
//# sourceMappingURL=types.js.map