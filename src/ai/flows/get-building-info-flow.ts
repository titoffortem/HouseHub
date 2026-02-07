'use server';
/**
 * @fileOverview A flow to get building information from external websites.
 *
 * - getBuildingInfo - A function that gets building info for a given address.
 * - GetBuildingInfoInput - The input type for the getBuildingInfo function.
 * - GetBuildingInfoOutput - The return type for the getBuildingInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetBuildingInfoInputSchema = z.object({
  address: z.string().describe('The address of the building to look up.'),
});
export type GetBuildingInfoInput = z.infer<typeof GetBuildingInfoInputSchema>;

const GetBuildingInfoOutputSchema = z.object({
  year: z
    .number()
    .optional()
    .describe('The construction year of the building.'),
  series: z
    .string()
    .optional()
    .describe('The building series, e.g., "1-515/9ш".'),
});
export type GetBuildingInfoOutput = z.infer<typeof GetBuildingInfoOutputSchema>;

// Exported wrapper function to be called from client components.
export async function getBuildingInfo(input: GetBuildingInfoInput): Promise<GetBuildingInfoOutput> {
  return getBuildingInfoFlow(input);
}

const getBuildingInfoPrompt = ai.definePrompt({
  name: 'getBuildingInfoPrompt',
  input: {schema: GetBuildingInfoInputSchema},
  output: {schema: GetBuildingInfoOutputSchema},
  prompt: `You are an expert real estate data analyst. Your task is to find information about a building in the city of **Yaroslavl (Ярославль)** by searching ONLY the website dom.mingkh.ru.

You MUST find the page for the exact address provided within Yaroslavl. For example, if the address is "Ленина 10", your search query should effectively be "Ярославль, Ленина 10". Do not use information for similar addresses or for addresses in other cities.

Address to search for: {{{address}}}

From the building's page on dom.mingkh.ru, extract the following information:
1.  "Год постройки" (Year of construction). Return it as a number in the 'year' field.
2.  "Серия, тип постройки" (Series, type of construction). Return it as a string in the 'series' field.

If you cannot find the exact address on the site for Yaroslavl, or if the information is missing, do not guess or make up data. Return the fields as undefined.`,
});


const getBuildingInfoFlow = ai.defineFlow(
  {
    name: 'getBuildingInfoFlow',
    inputSchema: GetBuildingInfoInputSchema,
    outputSchema: GetBuildingInfoOutputSchema,
  },
  async input => {
    const {output} = await getBuildingInfoPrompt(input);
    return output!;
  }
);
