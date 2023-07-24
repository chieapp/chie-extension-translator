import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ChatConversationAPI,
  ChatCompletionAPI,
  ChatMessage,
  ChatRole,
  ChatService,
  ChatServiceParams,
} from 'chie';

interface TranslatorParams extends ChatServiceParams {
  lang: string;
}

export default class TranslatorService extends ChatService<TranslatorParams> {
  promptText?: string;

  async sendHistoryAndGetResponse(options) {
    if (!this.promptText)
      this.promptText = String(await fs.readFile(path.join(__dirname, '..', 'prompt.txt')));
    const apiOptions = {
      ...options,
      onMessageDelta: this.notifyMessageDelta.bind(this),
    };
    const content = this.promptText
      .replace('{{text}}', this.getLastMessage().content)
      .replace('{{lang}}', this.params?.lang ?? 'English');
    if (this.api instanceof ChatCompletionAPI) {
      await this.api.sendConversation([{role: ChatRole.User, content}], apiOptions);
    } else if (this.api instanceof ChatConversationAPI) {
      await this.api.sendMessage(content, apiOptions);
    }
  }
}
