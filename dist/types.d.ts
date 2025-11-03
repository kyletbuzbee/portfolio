import { z } from 'zod';
export declare const MetricSchema: z.ZodObject<{
    label: z.ZodString;
    value: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label: string;
    value: string;
    description?: string | undefined;
}, {
    label: string;
    value: string;
    description?: string | undefined;
}>;
export declare const ScreenshotSchema: z.ZodObject<{
    url: z.ZodString;
    alt: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    url: string;
    alt: string;
    caption?: string | undefined;
}, {
    url: string;
    alt: string;
    caption?: string | undefined;
}>;
export declare const ProjectManifestSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    heroImage: z.ZodString;
    shortDescription: z.ZodString;
    role: z.ZodString;
    techStack: z.ZodArray<z.ZodString, "many">;
    challenge: z.ZodString;
    solution: z.ZodString;
    metrics: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        value: string;
        description?: string | undefined;
    }, {
        label: string;
        value: string;
        description?: string | undefined;
    }>, "many">;
    screenshots: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        alt: string;
        caption?: string | undefined;
    }, {
        url: string;
        alt: string;
        caption?: string | undefined;
    }>, "many">;
    repoUrl: z.ZodOptional<z.ZodString>;
    liveUrl: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    heroImage: string;
    shortDescription: string;
    role: string;
    techStack: string[];
    date: string;
    challenge: string;
    solution: string;
    metrics: {
        label: string;
        value: string;
        description?: string | undefined;
    }[];
    screenshots: {
        url: string;
        alt: string;
        caption?: string | undefined;
    }[];
    repoUrl?: string | undefined;
    liveUrl?: string | undefined;
    tags?: string[] | undefined;
}, {
    id: string;
    title: string;
    heroImage: string;
    shortDescription: string;
    role: string;
    techStack: string[];
    date: string;
    challenge: string;
    solution: string;
    metrics: {
        label: string;
        value: string;
        description?: string | undefined;
    }[];
    screenshots: {
        url: string;
        alt: string;
        caption?: string | undefined;
    }[];
    repoUrl?: string | undefined;
    liveUrl?: string | undefined;
    tags?: string[] | undefined;
}>;
export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type Screenshot = z.infer<typeof ScreenshotSchema>;
//# sourceMappingURL=types.d.ts.map