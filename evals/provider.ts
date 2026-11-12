import type { ApiProvider, ProviderResponse } from 'promptfoo';
import { askAssistant } from '../assistant/assistant.js';

export default class AssistantProvider implements ApiProvider {
  id() {
    return 'toolshop-assistant';
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    return { output: JSON.stringify(await askAssistant(prompt)) };
  }
}
