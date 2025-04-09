import { z } from 'zod';

/**
 * Skema validasi untuk komponen
 */
export const componentSchema = z.object({
  id: z.string(),
  type: z.string(),
  pageId: z.string(),
  parentId: z.string().nullable(),
  props: z.record(z.any()),
  order: z.number(),
  bindings: z.record(z.string()).optional(),
  value: z.any().optional(),
});

/**
 * Skema validasi untuk halaman
 */
export const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  layout: z.string(),
  isPublic: z.boolean(),
  showInNavigation: z.boolean(),
  content: z.string(),
  createdAt: z.string(),
  order: z.number(),
});

/**
 * Skema validasi untuk workflow
 */
export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean(),
  parentPageId: z.string(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.object({
        label: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
        config: z.record(z.any()).optional(),
      }),
      width: z.number().optional(),
      height: z.number().optional(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      type: z.string().optional(),
      animated: z.boolean().optional(),
      label: z.string().optional(),
    })
  ),
  triggers: z.array(
    z.object({
      type: z.enum(['schedule', 'webhook', 'event']),
      config: z.record(z.any()),
    })
  ),
});

/**
 * Skema validasi untuk state aplikasi
 */
export const appStateSchema = z.object({
  component: z.record(componentSchema),
  page: z.record(pageSchema),
  workflow: z.record(workflowSchema),
  pageAppState: z.record(z.record(z.any())).optional(),
  appState: z.record(z.any()).optional(), // For backward compatibility
  localStorage: z.record(z.any()),
});

/**
 * Validasi komponen
 * @param component - Komponen yang akan divalidasi
 * @returns Hasil validasi
 */
export function validateComponent(component: unknown) {
  return componentSchema.safeParse(component);
}

/**
 * Validasi halaman
 * @param page - Halaman yang akan divalidasi
 * @returns Hasil validasi
 */
export function validatePage(page: unknown) {
  return pageSchema.safeParse(page);
}

/**
 * Validasi workflow
 * @param workflow - Workflow yang akan divalidasi
 * @returns Hasil validasi
 */
export function validateWorkflow(workflow: unknown) {
  return workflowSchema.safeParse(workflow);
}

/**
 * Validasi state aplikasi
 * @param state - State aplikasi yang akan divalidasi
 * @returns Hasil validasi
 */
export function validateAppState(state: unknown) {
  return appStateSchema.safeParse(state);
}

/**
 * Validasi JSON string
 * @param jsonString - String JSON yang akan divalidasi
 * @param schema - Skema Zod untuk validasi
 * @returns Hasil validasi
 */
export function validateJson<T>(jsonString: string, schema: z.ZodType<T>) {
  try {
    const data = JSON.parse(jsonString);
    return schema.safeParse(data);
  } catch (error) {
    return { success: false, error: new Error('Invalid JSON string') };
  }
}