import {
  ChatCompletionAPI,
  ChatConversationAPI,
  ChatView,
  serviceManager,
} from 'chie';

import TranslatorService from './translator-service';
import TranslatorView from './translator-view';
import {getUserLanguages} from './languages';

export function activate() {
  const langs = getUserLanguages();

  serviceManager.registerView(TranslatorView);
  serviceManager.registerService({
    serviceClass: TranslatorService,
    apiClasses: [ChatConversationAPI, ChatCompletionAPI],
    viewClasses: [ChatView, TranslatorView],
    description: 'Translation with AI.',
    params: [
      {
        name: 'lang',
        type: 'string',
        displayName: 'Language',
        hasSwitcher: true,
        value: langs[0],
        choices: langs,
      },
    ],
  });
}

export function deactivate() {
  serviceManager.unregisterService(TranslatorService);
}
