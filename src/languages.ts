import gui from 'gui';
import {getLangNameFromCode} from 'language-name-map';

const codes = gui.Locale.getPreferredLanguages().map(l => l.split('-')[0]);
const unique = Array.from(new Set(codes));
const languages = unique.map(code => getLangNameFromCode(code).native);

// Get current user language names.
export function getUserLanguages() {
  return languages;
}
