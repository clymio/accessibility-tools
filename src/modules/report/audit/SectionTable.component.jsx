import { CONFORMANCE_TYPE_LABELS } from '@/constants/audit';
import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const TABLE_NAMES = {
  WCAG_A: 'Success Criteria, Level A',
  WCAG_AA: 'Success Criteria, Level AA',
  wCAG_AAA: 'Success Criteria, Level AAA'
};

const sortConformanceTypes = (types) => {
  const priority = ['WEB', 'DOCS', 'SOFTWARE', 'AUTHORING_TOOL'];
  return types.sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id));
};

const CONFORMANCE_TYPE_LEVEL_LABELS = {
  SUPPORTS: 'Supports',
  PARTIAL_SUPPORT: 'Partially Supports',
  NOT_SUPPORTED: 'Does Not Support',
  NOT_APPLICABLE: 'Not Applicable',
  NOT_EVALUATED: 'Not Evaluated',
  PASSED: 'Passed',
  FAILED: 'Failed'
};

const SectionTable = ({ section, showTableName = false }) => {
  if (!section || section.items.length === 0) return;
  const title = (
    <Typography variant='h3'>
      {section.table_name ? `${section.table_name}: ` : ``}{TABLE_NAMES[section.id] || section.name}
    </Typography>
  );
  return (
    <div className={style.dataTable} key={section.id}>
      {(showTableName || section.table_name) && (
        <div>
          {section.url
            ? (
              <a href={section.url} target='_blank'>
                {title}
              </a>
              )
            : title}
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>
              <Typography>Criteria</Typography>
            </th>
            <th>
              <Typography>Conformance</Typography>
            </th>
            <th>
              <Typography>Remarks and Explanations</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {section.items.map(item => (
            <tr key={item.id}>
              <td>
                {item.criteria && item.criteria.help_url
                  ? (
                    <a target='_blank' href={item.criteria.help_url}>
                      <Typography>{item.name}</Typography>
                    </a>
                    )
                  : (
                    <Typography>{item.name}</Typography>
                    )}
              </td>
              <td>
                <ul>
                  {item.types.length > 1
                    ? (
                        sortConformanceTypes(item.types).map(type => (
                          <li key={type.id}>
                            <Typography whiteSpace='nowrap' className={style.type}>
                              <span>{CONFORMANCE_TYPE_LABELS[type.id] ? `${CONFORMANCE_TYPE_LABELS[type.id]}: ` : ''}</span>
                              {CONFORMANCE_TYPE_LEVEL_LABELS[type.level]}
                            </Typography>
                          </li>
                        ))
                      )
                    : (
                      <li>
                        <Typography whiteSpace='nowrap' className={style.type}>
                          {CONFORMANCE_TYPE_LEVEL_LABELS[item.types[0].level]}
                        </Typography>
                      </li>
                      )}
                  {}
                </ul>
              </td>
              <td>
                <ul>
                  {item.types.length > 1
                    ? (
                        sortConformanceTypes(item.types).map((type, k) => (
                          <li key={type.id}>
                            <Typography whiteSpace='nowrap' className={style.type}>
                              <span>{CONFORMANCE_TYPE_LABELS[type.id] ? `${CONFORMANCE_TYPE_LABELS[type.id]}: ` : ''}</span>
                              {type.remarks}
                            </Typography>
                          </li>
                        ))
                      )
                    : (
                      <li>
                        <Typography whiteSpace='nowrap' className={style.type}>
                          {item.types[0].remarks}
                        </Typography>
                      </li>
                      )}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectionTable;
