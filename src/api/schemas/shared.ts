import {z} from 'zod';
import {CONTRACT_VERSION} from '../../config';


export const supportedContractVersion = CONTRACT_VERSION;

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
};

export const richTextNodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    text: z.string().optional(),
    children: z.array(richTextNodeSchema).optional(),
  }),
);

const richTextSchema = z.object({
  root: z
    .object({
      children: z.array(richTextNodeSchema).default([]),
    })
    .optional(),
});

const mediaSizeSchema = z
  .object({
    url: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .passthrough();

export const mediaSchema = z
  .object({
    url: z.string().optional(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    filename: z.string().optional(),
    sizes: z
      .object({
        thumbnail: mediaSizeSchema.optional(),
        square: mediaSizeSchema.optional(),
        small: mediaSizeSchema.optional(),
        medium: mediaSizeSchema.optional(),
        large: mediaSizeSchema.optional(),
        xlarge: mediaSizeSchema.optional(),
        og: mediaSizeSchema.optional(),
      })
      .optional(),
    caption: richTextSchema.optional(),
  })
  .passthrough();

export const destinationSchema = z
  .object({
    key: z.string().optional(),
    label: z.string().optional(),
    path: z.string().optional(),
    href: z.string().optional(),
    supportedPlatforms: z.array(z.string()).optional(),
  })
  .passthrough();

export const ctaSchema = z
  .object({
    label: z.string().optional(),
    destination: destinationSchema.optional(),
    href: z.string().optional(),
  })
  .passthrough();

export type Media = z.infer<typeof mediaSchema>;
export type Destination = z.infer<typeof destinationSchema>;
export type Cta = z.infer<typeof ctaSchema>;

export function extractPlainText(root?: {
  children?: Array<{
    text?: string;
    children?: Array<{text?: string; children?: Array<{text?: string}>}>;
  }>;
}): string {
  const collect = (nodes: any[]): string =>
    nodes
      .map(n => (typeof n?.text === 'string' ? n.text : collect(n?.children ?? [])))
      .join('');
  return collect(root?.children ?? []).trim();
}
