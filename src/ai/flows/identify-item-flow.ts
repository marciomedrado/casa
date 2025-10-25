
'use server';

/**
 * @fileOverview An AI agent that identifies an item from a photo.
 *
 * - identifyItem - A function that handles the item identification process.
 * - IdentifyItemInput - The input type for the identifyItem function.
 * - IdentifyItemOutput - The return type for the identifyItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyItemInput = z.infer<typeof IdentifyItemInputSchema>;

const IdentifyItemOutputSchema = z.object({
  itemName: z.string().describe('A concise, descriptive name for the item in Portuguese.'),
});
export type IdentifyItemOutput = z.infer<typeof IdentifyItemOutputSchema>;

export async function identifyItem(input: IdentifyItemInput): Promise<IdentifyItemOutput> {
  return identifyItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyItemPrompt',
  input: {schema: IdentifyItemInputSchema},
  output: {schema: IdentifyItemOutputSchema},
  prompt: `Analise o objeto principal nesta imagem e forneça um nome conciso e descritivo para ele em português.

Photo: {{media url=photoDataUri}}`,
});

const identifyItemFlow = ai.defineFlow(
  {
    name: 'identifyItemFlow',
    inputSchema: IdentifyItemInputSchema,
    outputSchema: IdentifyItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    