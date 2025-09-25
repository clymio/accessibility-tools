import SitemapAutocomplete from './SitemapAutocomplete.component';
import SitemapList from './SitemapList.component';

const Sitemap = ({ type = 'list', sitemap = [], onValueUpdate = () => {}, environmentType, disabled = false, autoFocus = false, saveBtnRef = null, ...props }) => {
  if (type === 'list') {
    return <SitemapList sitemap={sitemap} onValueUpdate={onValueUpdate} autoFocus={autoFocus} {...props} />;
  }
  if (type === 'autocomplete') {
    return <SitemapAutocomplete sitemap={sitemap} onValueUpdate={onValueUpdate} environmentType={environmentType} disabled={disabled} autoFocus={autoFocus} saveBtnRef={saveBtnRef} {...props} />;
  }
  return;
};
export default Sitemap;
