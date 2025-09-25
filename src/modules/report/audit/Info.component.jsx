import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const Info = ({ audit }) => {
  const type = audit.system_audit_type_id;

  const sections = audit.sections;

  const section508SectionItems = sections.filter(s => s.chapter_id === 'SECTION_508');
  const en301SectionItems = sections.filter(s => s.chapter_id === 'EN_301');

  const hasLevelA = sections.find(section => section.id === 'WCAG_A');
  const hasLevelAA = sections.find(section => section.id === 'WCAG_AA');
  const hasLevelAAA = sections.find(section => section.id === 'WCAG_AAA');

  const hasVendorInfo = audit.vendor_address || audit.vendor_contact_email || audit.vendor_contact_phone || audit.vendor_contact_name || audit.vendor_name || audit.vendor_url;

  const auditVendorContactInfo = [audit.vendor_contact_email, audit.vendor_contact_phone].filter(Boolean).join(' | ');
  const profileInfo = [audit.profile.first_name, audit.profile.last_name].filter(Boolean).join(' ');
  const profileOrgInfo = [audit.profile.organization?.email, audit.profile.organization?.phone].filter(Boolean).join(' | ');
  return (
    <>
      <div className={style.info}>
        <Typography variant='h2'>Overview</Typography>
        <table className={style.overviewTable}>
          <tbody>
            <tr>
              <td>
                <Typography>Product Information</Typography>
              </td>
              <td>
                <ul>
                  <li>
                    <Typography><strong>{audit.product_name || audit.project.name}</strong> {audit.product_version ? <span>&#8212; v {audit.product_version}</span> : ''}</Typography>
                  </li>
                  <li>
                    <Typography>
                      <a href={audit.product_url || audit.environment.url} target='_blank'>
                        {audit.product_url || audit.environment.url}
                      </a>
                    </Typography>
                  </li>
                  {audit.product_description && (
                    <li><Typography>{audit.product_description}</Typography></li>
                  )}
                </ul>
              </td>
            </tr>
            {hasVendorInfo && (
              <tr>
                <td>
                  <Typography>Vendor Information</Typography>
                </td>
                <td>
                  <ul>
                    {audit.vendor_name && (
                      <li>
                        <Typography>
                          <strong>
                            {audit.vendor_name}
                          </strong>
                        </Typography>
                      </li>
                    )}
                    {audit.vendor_url && (
                      <li>
                        <Typography>
                          {audit.vendor_url}
                        </Typography>
                      </li>
                    )}
                    {audit.vendor_address && (
                      <li>
                        <Typography>
                          {audit.vendor_address}
                        </Typography>
                      </li>
                    )}
                    {audit.vendor_contact_name && (
                      <li>
                        <Typography>
                          <strong>
                            {audit.vendor_contact_name}
                          </strong>
                        </Typography>
                      </li>
                    )}
                    {auditVendorContactInfo && (
                      <li>
                        <Typography>
                          {auditVendorContactInfo}
                        </Typography>
                      </li>
                    )}
                  </ul>
                </td>
              </tr>
            )}
            {audit.notes && (
              <tr>
                <td>
                  <Typography>Notes</Typography>
                </td>
                <td>
                  <Typography whiteSpace='pre-line'>{audit.notes.trim()}</Typography>
                </td>
              </tr>
            )}
            {audit.profile && (
              <tr>
                <td>
                  <Typography>Evaluator Information</Typography>
                </td>
                <td>
                  <ul>
                    {profileInfo && (
                      <li>
                        <Typography>
                          <strong>
                            {profileInfo}
                          </strong>
                        </Typography>
                      </li>
                    )}
                    {audit.profile.title && (
                      <li>
                        <Typography>
                          {audit.profile.title}
                        </Typography>
                      </li>
                    )}
                    {audit.profile.organization && (
                      <>
                        {audit.profile.organization.name && (
                          <li>
                            <Typography>
                              <strong>
                                {audit.profile.organization.name}
                              </strong>
                            </Typography>
                          </li>
                        )}
                        {audit.profile.organization.url && (
                          <li>
                            <Typography>
                              <a href={audit.profile.organization.url} target='_blank'>
                                {audit.profile.organization.url}
                              </a>
                            </Typography>
                          </li>
                        )}
                        {profileOrgInfo && (
                          <li>
                            <Typography>
                              {profileOrgInfo}
                            </Typography>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </td>
              </tr>
            )}
            {audit.methods && (
              <tr>
                <td>
                  <Typography>Evaluation methods used</Typography>
                </td>
                <td>
                  <Typography>{audit.methods}</Typography>
                </td>
              </tr>
            )}
            <tr></tr>
          </tbody>
        </table>
      </div>
      {audit.summary && (
        <div className={style.executiveSummary}>
          <Typography variant='h2' mt='1rem'>Executive Summary</Typography>
          <Typography whiteSpace='pre-line'>{audit.summary.trim()}</Typography>
        </div>
      )}
      {type !== 'ATAG' && (
        <div className={style.guidelineTable}>
          <Typography variant='h2' mt='1rem'>Applicable Standards/Guidelines</Typography>
          <Typography>This report covers the degree of conformance for the following accessibility standard/guidelines:</Typography>
          <table>
            <thead>
              <tr>
                <th>
                  <Typography>Standard/Guideline</Typography>
                </th>
                <th>
                  <Typography>Included In Report</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Typography>Web Content Accessibility Guidelines 2.0</Typography>
                </td>
                <td>
                  <ul>
                    <li>
                      <Typography>Level A ({hasLevelA ? 'Yes' : 'No'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AA ({hasLevelAA ? 'Yes' : 'No'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AAA ({hasLevelAAA ? 'Yes' : 'No'})</Typography>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <Typography>Web Content Accessibility Guidelines 2.1</Typography>
                </td>
                <td>
                  <ul>
                    <li>
                      <Typography>Level A ({audit.wcag_version === '2.0' || !hasLevelA ? 'No' : 'Yes'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AA ({audit.wcag_version === '2.0' || !hasLevelAA ? 'No' : 'Yes'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AAA ({audit.wcag_version === '2.0' || !hasLevelAAA ? 'No' : 'Yes'})</Typography>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <Typography>Web Content Accessibility Guidelines 2.2</Typography>
                </td>
                <td>
                  <ul>
                    <li>
                      <Typography>Level A ({audit.wcag_version === '2.2' && hasLevelA ? 'Yes' : 'No'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AA ({audit.wcag_version === '2.2' && hasLevelAA ? 'Yes' : 'No'})</Typography>
                    </li>
                    <li>
                      <Typography>Level AAA ({audit.wcag_version === '2.2' && hasLevelAAA ? 'Yes' : 'No'})</Typography>
                    </li>
                  </ul>
                </td>
              </tr>
              {type === 'VPAT' && (
                <tr>
                  <td>
                    <Typography>Revised Section 508 standards published January 18, 2017 and corrected January 22, 2018</Typography>
                  </td>
                  <td>
                    <Typography>{section508SectionItems.length > 0 ? 'Yes' : 'No'}</Typography>
                  </td>
                </tr>
              )}
              {type === 'VPAT' && (
                <tr>
                  <td>
                    <Typography>
                      EN 301 549 Accessibility requirements for ICT products and services - V3.1.1 (2019-11) <i>AND</i> EN 301 549 Accessibility requirements for ICT products and
                      services - V3.2.1 (2021-03)
                    </Typography>
                  </td>
                  <td>
                    <Typography>{en301SectionItems.length > 0 ? 'Yes' : 'No'}</Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default Info;
