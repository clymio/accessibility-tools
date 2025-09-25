import { Roboto, Roboto_Condensed, Roboto_Mono } from 'next/font/google';
const FONT_NAMES = ['arial', 'helvetica', 'times_new_roman', 'georgia', 'tahoma', 'gill_sans', 'impact', 'palatino', 'futura', 'trebuchet'];

export default FONT_NAMES;

export const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-roboto'
});
export const mono = Roboto_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-roboto-mono'
});
export const condensed = Roboto_Condensed({
  weight: ['300', '400'],
  style: ['normal'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-roboto-condensed'
});
