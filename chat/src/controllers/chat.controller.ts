import { CommercetoolsAgentToolkit } from '@commercetools-demo/ct-agent-toolkit/ai-sdk';
import { CoreMessage, pipeDataStreamToResponse, streamText } from 'ai';
import { Request, Response } from 'express';
import { injectNavigationTools } from '../navigation-tools';
import ModelProvider from '../services/modelProvider';
import { logger } from '../utils/logger.utils';

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

/**
 * Safely parses the AVAILABLE_ACTIONS environment variable
 * Handles both regular JSON and escaped JSON strings
 */
export function parseAvailableActions(availableActionsStr: string): Object {
  try {
    // First try to parse as regular JSON
    return JSON.parse(availableActionsStr);
  } catch (error) {
    try {
      // If the first parse fails, try unescaping the string first
      // This handles double-encoded JSON strings like "{\"key\":\"value\"}"
      const unescaped = availableActionsStr.replace(/\\"/g, '"');
      return JSON.parse(unescaped);
    } catch (nestedError) {
      // If both parsing attempts fail, log the error and return an empty object
      logger.error(`Failed to parse AVAILABLE_ACTIONS: ${availableActionsStr}`);
      return {};
    }
  }
}

export const createCommercetoolsAgentToolkit = (
  clientId: string,
  clientSecret: string,
  authUrl: string,
  projectKey: string,
  apiUrl: string,
  availableActions: Object,
  context: {
    customerId: string,
    cartId: string,
  }
) => {
  return new CommercetoolsAgentToolkit({
    clientId,
    clientSecret,
    authUrl,
    projectKey,
    apiUrl,

    configuration: {
      context: {
        ...(context.customerId && {customerId: context.customerId}),
        ...(context.cartId && {cartId: context.cartId}),
      },
      actions: availableActions,
    },
  });
};

export const post = async (request: Request, response: Response) => {
  try {
    if (!process.env.CTP_CLIENT_ID || !process.env.CTP_CLIENT_SECRET || !process.env.CTP_AUTH_URL || !process.env.CTP_PROJECT_KEY || !process.env.CTP_API_URL || !process.env.AVAILABLE_ACTIONS) {
      return response.status(500).json({ error: 'Missing required environment variables' });
    }
    if (!process.env.AI_MODEL) {
      return response.status(500).json({ error: 'AI_MODEL is not set' });
    }
    if (!process.env.AI_PROVIDER) {
      return response.status(500).json({ error: 'AI_PROVIDER is not set' });
    }

    
    const { messages } = request.body as { messages: CoreMessage[] };
  
    if (!messages) {
      return response.status(400).json({ error: 'Messages are required' });
    }
    
    
    const { customerId, cartId } = request.query;
    const availableActions = parseAvailableActions(process.env.AVAILABLE_ACTIONS);
    
  
    const commercetoolsAgentToolkit = createCommercetoolsAgentToolkit(
      process.env.CTP_CLIENT_ID,
      process.env.CTP_CLIENT_SECRET,
      process.env.CTP_AUTH_URL,
      process.env.CTP_PROJECT_KEY,
      process.env.CTP_API_URL,
      availableActions,
      { customerId: customerId as string, cartId: cartId as string }
    );
  
    logger.info(`commercetoolsAgentToolkit initialized`);
  
    await commercetoolsAgentToolkit.authenticateCustomer();
    logger.info(`commercetoolsAgentToolkit authenticated`);
    
    // Get the model instance from the ModelProvider
    const model = ModelProvider.getInstance().getModel();
  
    const tools = injectNavigationTools(commercetoolsAgentToolkit.getTools());


    pipeDataStreamToResponse(response, {
      status: 200,
      statusText: 'OK',
      execute: async dataStreamWriter => {
        const result = streamText({
          model: model,
          system: process.env.SYSTEM_PROMPT || `You are a helpful shopping assistant that can access Commercetools data. 
              Your primary goal is to help the user shop for products.
              When interacting with carts: 
              - If the user wants to view or modify an *existing* cart, ask for the cart ID or key before using 'read_cart' or 'update_cart'. 
              - If the user wants to  add items to a cart and hasn't mentioned an existing cart ID/key, use the 'create_cart' tool first. You don't need an ID to create a cart, if is not not in the request or history just create a new one.
              When you use tools to retrieve information (like product listings), summarize the key information from the tool results in your response. 
              If a tool call results in an error: Inform the user that the action failed, state the reason if known, and ask if they want to try something else or provide more details (e.g., 'I couldn't find a cart with that ID. Would you like to try a different ID or create a new cart?'). 
              After receiving successful tool results, ALWAYS generate a final text message for the user based on those results.`,
          messages,
          tools,
          maxSteps: parseInt(process.env.MAX_STEPS || '25'),
        });
        
        result.mergeIntoDataStream(dataStreamWriter, {
          sendUsage: true,
          sendReasoning: true,
        });
      },
      onError: error => {
        logger.error('Error in streaming response:', error);
        response.status(500).json({ 
          error: 'Failed to process chat request: ' + errorHandler(error) 
        });
        return error instanceof Error ? error.message : String(error);
      },
    });
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    return response.status(500).json({ 
      error: 'Failed to process chat request: ' + errorHandler(error) 
    });
  }
};
