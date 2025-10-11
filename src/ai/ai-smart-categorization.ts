'use server';

/**
 * @fileOverview An AI agent that suggests relevant categories or tags based on the item's name and description.
 *
 * - suggestCategories - A function that handles the category suggestion process.
 * - SuggestCategoriesInput - The input type for the suggestCategories function.
 * - SuggestCategoriesOutput - The return type for the suggestCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoriesInputSchema = z.object({
  itemName: z.string().describe('The name of the item.'),
  itemDescription: z.string().describe('The description of the item.'),
});
export type SuggestCategoriesInput = z.infer<typeof SuggestCategoriesInputSchema>;

const SuggestCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested categories for the item.'),
  suggestedTags: z.array(z.string()).describe('An array of suggested tags for the item.'),
});
export type SuggestCategoriesOutput = z.infer<typeof SuggestCategoriesOutputSchema>;

export async function suggestCategories(
  input: SuggestCategoriesInput
): Promise<SuggestCategoriesOutput> {
  return suggestCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoriesPrompt',
  input: {schema: SuggestCategoriesInputSchema},
  output: {schema: SuggestCategoriesOutputSchema},
  prompt: `You are a helpful assistant that suggests relevant categories and tags for items based on their name and description.

  Given the following item name and description, suggest a list of categories and tags that would be appropriate for the item.

  Item Name: {{{itemName}}}
  Item Description: {{{itemDescription}}}

  Categories:
  Tags: `,
});

const suggestCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestCategoriesFlow',
    inputSchema: SuggestCategoriesInputSchema,
    outputSchema: SuggestCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
