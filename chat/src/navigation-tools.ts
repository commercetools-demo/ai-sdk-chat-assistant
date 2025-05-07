import {  tool } from 'ai';
import { z } from 'zod';

const navigateToProductTool = tool({
  description: 'Navigate to a specific product details page or PDP by product SKU',
  parameters: z.object({
    sku: z.string().describe('The sku of the product to navigate to'),
  }),
});

const navigateToProductListTool = tool({
  description: 'Navigate to a specific product list page or PLP by category key',
  parameters: z.object({
    categoryKey: z.string().describe('The key of the category to navigate to'),
  }),
});

const navigateToSearchResultsTool = tool({
  description: 'Search for a product by name or description or SKU',
  parameters: z.object({
    searchQuery: z.string().describe('The search query to navigate to'),
  }),
});

const navigateToCartTool = tool({
  description: 'Navigate to the cart page',
  parameters: z.object({}),
});

const navigateToCheckoutTool = tool({
  description: 'Navigate to the checkout page',
  parameters: z.object({}),
});

export const injectNavigationTools = (tools: Record<string, any>) => {
  return {
    ...tools,
    'navigateToProduct': navigateToProductTool,
    'navigateToProductList': navigateToProductListTool,
    'navigateToSearchResults': navigateToSearchResultsTool,
    'navigateToCart': navigateToCartTool,
    'navigateToCheckout': navigateToCheckoutTool,
  };
};


