import gui from 'gui';
import path from 'node:path';
import {BaseView, BaseChatService} from 'chie';

import {getUserLanguages} from './languages';

let font: gui.Font;

export default class TranslatorView extends BaseView<BaseChatService> {
  input: gui.TextEdit;
  output: gui.TextEdit;
  button: gui.Button;
  spinner: gui.GifPlayer;
  selector: gui.ComboBox;

  constructor() {
    super();

    if (!font)
      font = gui.Font.create(gui.Font.default().getName(), 15, 'normal', 'normal');

    this.setBackgroundColor('#EEE', '#333');
    this.view.setStyle({flex: 1, padding: 14, gap: 14});

    this.input = gui.TextEdit.create();
    this.input.setFont(font);
    this.input.setStyle({flex: 1});
    this.view.addChildView(this.input);

    const bar = gui.Container.create();
    bar.setStyle({height: 32, flexDirection: 'row', justifyContent: 'center', gap: 7});
    bar.addChildView(gui.Label.create('Language:'));
    this.view.addChildView(bar);

    this.selector = gui.ComboBox.create();
    this.selector.setStyle({maxWidth: 150, minWidth: 100});
    for (const lang of getUserLanguages())
      this.selector.addItem(lang);
    bar.addChildView(this.selector);

    this.button = gui.Button.create('Translate');
    this.button.setStyle({maxWidth: 100});
    this.button.onClick = this.translate.bind(this);
    bar.addChildView(this.button);

    const spinnerWrapper = gui.Container.create();
    spinnerWrapper.setStyle({width: 32, height: 32});
    this.spinner = gui.GifPlayer.create();
    this.spinner.setVisible(false);
    this.spinner.setStyle({flex: 1});
    this.spinner.setScale('down');
    this.spinner.setImage(gui.Image.createFromPath(path.join(__dirname, '..', 'spinner.gif')));
    spinnerWrapper.addChildView(this.spinner);
    bar.addChildView(spinnerWrapper);

    this.output = gui.TextEdit.create();
    this.output.setFont(font);
    this.output.setStyle({flex: 1});
    this.view.addChildView(this.output);
  }

  async loadService(service: BaseChatService) {
    if (!await super.loadService(service))
      return false;

    await service.load();
    if (service.history.length == 2) {
      this.input.setText(service.history[0].content);
      this.output.setText(service.history[1].content);
    }

    // Prevent automatic title generation.
    service.setCustomTitle('No Title');

    this.selector.setText(service.getParam('lang'));

    this.serviceConnections.add(service.onMessageBegin.connect(
      this.#onMessageBegin.bind(this)));
    this.serviceConnections.add(service.onMessageDelta.connect(
      this.#onMessageDelta.bind(this)));
    this.serviceConnections.add(service.onMessageError.connect(
      this.#onMessageError.bind(this)));
    this.serviceConnections.add(service.onMessage.connect(
      this.#onMessageEnd.bind(this)));
  }

  translate() {
    this.button.setEnabled(false);
    this.spinner.setVisible(true);
    this.service.setParam('lang', this.selector.getText());
    this.service.sendMessage({content: this.input.getText()});
  }

  end() {
    this.output.setEnabled(true);
    this.button.setEnabled(true);
    this.spinner.setVisible(false);
  }

  #onMessageBegin() {
    this.output.setText('');
  }

  #onMessageDelta(delta, response) {
    if (delta.content)
      this.output.insertTextAt(delta.content, -1);
  }

  #onMessageError(error) {
    this.output.setText(error.stack);
    this.end();
  }

  #onMessageEnd(message, response) {
    this.end();
    // Only keep last 2 messages.
    this.service.history.splice(0, this.service.history.length - 2);
  }
}
