import { EULA_LAST_UPDATED } from '@/constants/app';
import { formatDate } from '@/electron/lib/utils';
import { useSystemStore } from '@/stores';
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import classnames from 'classnames';
import { useState } from 'react';
import packageJson from '../../../package.json';
import style from './Eula.module.scss';

const Eula = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { imageBasePath } = useSystemStore();

  const handleCheckboxChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  const handleCancel = () => {
    window.system.exit();
  };

  const handleSubmit = () => {
    window.system.acceptEula();
  };

  return (
    <main className={style.root}>
      <section>
        <header>
          <img src={`${imageBasePath}/icon.png`} alt='Accessibility Tools' style={{ width: '60px', aspectRatio: 1 }} />
          <Typography variant='h1'>Accessibility Tools</Typography>
        </header>
        <div className={style.content}>
          <Typography>You must accept the EULA in order to use the Accessibility Tools application.</Typography>
        </div>
      </section>
      <section className={classnames(style.eulaContainer, style.content)}>
        <Typography variant='h1'>End User License Agreement (EULA)</Typography>
        <Typography variant='h2' my={2}>Clym Accessibility Tools</Typography>
        <Typography><strong>Version {packageJson.version}</strong></Typography>
        <Typography><strong>Effective Date: {formatDate(new Date(EULA_LAST_UPDATED))}</strong></Typography>
        <div className={style.termsContainer}>
          <div className={style.terms}>
            <Typography variant='h2'>
              1. ACCEPTANCE OF TERMS
            </Typography>
            <Typography>
              By downloading, installing, or using Clym Accessibility Tools ("Software"), you ("User" or "You") agree to be bound by the terms and conditions of this End User License Agreement ("Agreement"). If you do not agree to these terms, do not install or use the Software
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              2. ABOUT CLYM ACCESSIBILITY TOOLS
            </Typography>
            <Typography>
              Clym Accessibility Tools is a desktop application developed by Clym Inc. ("Clym," "we," "us," or "our") that provides comprehensive accessibility testing and evaluation capabilities for websites and web applications. The Software helps users assess compliance with Web Content Accessibility Guidelines (WCAG) and other accessibility standards.
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              3. OPEN SOURCE LICENSE
            </Typography>
            <Typography>
              This Software is distributed under the MIT License. The complete source code is available at <a href='https://github.com/clymio/accessibility-tools' target='_blank'>https://github.com/clymio/accessibility-tools</a>. You are granted the rights specified in the MIT License, including the right to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the terms and conditions outlined in this EULA and the MIT License.
            </Typography>
            <Typography variant='h3'>MIT License Text:</Typography>
            <div className={style.licenseContainer}>
              <Typography>Copyright (c) 2025 Clym Inc.</Typography>
              <Typography>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</Typography>
              <Typography>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</Typography>
              <Typography>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</Typography>
            </div>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              4. GRANT OF LICENSE
            </Typography>
            <Typography>
              Subject to the terms of this Agreement and the MIT License, Clym grants you a non-exclusive license to:
            </Typography>
            <ul>
              <li>
                <Typography>Install and use the Software on your computer(s)</Typography>
              </li>
              <li>
                <Typography>Access websites and web applications through the Software for accessibility testing purposes</Typography>
              </li>
              <li>
                <Typography>Generate accessibility reports and documentation</Typography>
              </li>
              <li>
                <Typography>Modify the Software in accordance with the MIT License terms</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              5. SYSTEM REQUIREMENTS AND INTERNET ACCESS
            </Typography>
            <Typography variant='h3'>5.1 System Requirements</Typography>
            <Typography>
              The Software requires a compatible operating system and sufficient system resources as specified in the documentation.
            </Typography>
            <Typography variant='h3'>5.2 Internet Connectivity</Typography>
            <Typography>
              The Software requires an active internet connection to:
            </Typography>
            <ul>
              <li>
                <Typography>Load and analyze web pages and applications</Typography>
              </li>
              <li>
                <Typography>Access remote websites for testing</Typography>
              </li>
              <li>
                <Typography>Download updates and documentation</Typography>
              </li>
              <li>
                <Typography>Verify accessibility testing criteria</Typography>
              </li>
            </ul>
            <Typography>You are responsible for maintaining adequate internet connectivity and any associated costs.</Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              6. DATA HANDLING AND PRIVACY
            </Typography>
            <Typography variant='h3'>
              6.1 Data Processing
            </Typography>
            <Typography>
              The Software may:
            </Typography>
            <ul>
              <li>
                <Typography>Access and analyze web pages you specify for testing</Typography>
              </li>
              <li>
                <Typography>Cache web content temporarily during analysis</Typography>
              </li>
              <li>
                <Typography>Generate reports containing accessibility findings</Typography>
              </li>
              <li>
                <Typography>Store testing configurations and preferences locally</Typography>
              </li>
            </ul>
            <Typography variant='h3'>
              6.2 No Data Collection
            </Typography>
            <Typography>Clym does not collect, store, or transmit your testing data, website content, or personal information to our servers unless explicitly stated otherwise in the Software documentation or in the Software itself.</Typography>
            <Typography variant='h3'>
              6.3 Third-Party Websites
            </Typography>
            <Typography>When testing third-party websites, you acknowledge that:
            </Typography>
            <ul>
              <li>
                <Typography>You are responsible for obtaining necessary permissions to test such websites</Typography>
              </li>
              <li>
                <Typography>The Software may access publicly available content on those websites</Typography>
              </li>
              <li>
                <Typography>Clym is not responsible for the content, availability, or accessibility of third-party websites</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              7. PERMITTED USES
            </Typography>
            <Typography>
              You may use the Software to:
            </Typography>
            <ul>
              <li>
                <Typography>Evaluate website and web application accessibility</Typography>
              </li>
              <li>
                <Typography>Generate accessibility reports and documentation</Typography>
              </li>
              <li>
                <Typography>Test compliance with accessibility standards and guidelines</Typography>
              </li>
              <li>
                <Typography>Identify accessibility barriers and issues</Typography>
              </li>
              <li>
                <Typography>Support accessibility improvement efforts</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              8. PROHIBITED USES
            </Typography>
            <Typography>
              You may not use the Software to:
            </Typography>
            <ul>
              <li>
                <Typography>Conduct unauthorized security testing or penetration testing</Typography>
              </li>
              <li>
                <Typography>Access websites or systems without proper authorization</Typography>
              </li>
              <li>
                <Typography>Violate any applicable laws, regulations, or third-party rights</Typography>
              </li>
              <li>
                <Typography>Distribute malware or engage in harmful activities</Typography>
              </li>
              <li>
                <Typography>Circumvent website security measures or access restrictions</Typography>
              </li>
              <li>
                <Typography>Interfere with the normal operation of websites or services</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              9. DISCLAIMERS AND WARRANTIES
            </Typography>
            <Typography variant='h3'>
              9.1 No Warranty
            </Typography>
            <Typography>
              THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. CLYM DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </Typography>
            <Typography variant='h3'>
              9.2 Accessibility Testing Limitations
            </Typography>
            <Typography>The Software provides automated and guided accessibility testing tools, but:</Typography>
            <ul>
              <li>
                <Typography>No automated tool can detect all accessibility issues</Typography>
              </li>
              <li>
                <Typography>Manual testing and expert review may be required for comprehensive evaluation</Typography>
              </li>
              <li>
                <Typography>Results should be validated by qualified accessibility professionals</Typography>
              </li>
              <li>
                <Typography>Clym makes no guarantee that use of the Software will ensure full compliance with any accessibility standards or regulations</Typography>
              </li>
            </ul>
            <Typography variant='h3'>
              9.3 Accuracy of Results
            </Typography>
            <Typography>
              While we strive for accuracy, Clym does not warrant that:
            </Typography>
            <ul>
              <li>
                <Typography>Testing results are error-free or complete</Typography>
              </li>
              <li>
                <Typography>The Software will detect all accessibility issues</Typography>
              </li>
              <li>
                <Typography>Reports generated are sufficient for legal compliance</Typography>
              </li>
              <li>
                <Typography>The Software will work with all websites or web technologies</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              10. LIMITATION OF LIABILITY
            </Typography>
            <Typography>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLYM SHALL NOT BE LIABLE FOR ANY:
            </Typography>
            <ul>
              <li>
                <Typography>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</Typography>
              </li>
              <li>
                <Typography>LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES</Typography>
              </li>
              <li>
                <Typography>DAMAGES ARISING FROM USE OR INABILITY TO USE THE SOFTWARE</Typography>
              </li>
              <li>
                <Typography>DAMAGES RESULTING FROM RELIANCE ON TESTING RESULTS</Typography>
              </li>
              <li>
                <Typography>CLAIMS RELATED TO ACCESSIBILITY COMPLIANCE OR NON-COMPLIANCE</Typography>
              </li>
            </ul>
            <Typography>IN NO EVENT SHALL CLYM'S TOTAL LIABILITY EXCEED $1 USD.</Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              11. INDEMNIFICATION
            </Typography>
            <Typography>
              You agree to indemnify and hold harmless Clym from any claims, damages, or expenses arising from:
            </Typography>
            <ul>
              <li>
                <Typography>Your use of the Software</Typography>
              </li>
              <li>
                <Typography>Your testing of third-party websites without authorization</Typography>
              </li>
              <li>
                <Typography>Your violation of this Agreement or applicable laws</Typography>
              </li>
              <li>
                <Typography>Any modifications you make to the Software</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              12. UPDATES AND MODIFICATIONS
            </Typography>
            <Typography variant='h3'>
              12.1 Software Updates
            </Typography>
            <Typography>
              Clym may provide updates, patches, or new versions of the Software. Such updates may modify functionality or require acceptance of revised terms.
            </Typography>
            <Typography variant='h3'>
              12.2 Agreement Updates
            </Typography>
            <Typography>
              This Agreement may be updated from time to time. Continued use of updated Software constitutes acceptance of revised terms.
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              13. TERMINATION
            </Typography>
            <Typography variant='h3'>
              13.1 Termination by User
            </Typography>
            <Typography>
              You may terminate this Agreement at any time by uninstalling the Software and destroying all copies.
            </Typography>
            <Typography variant='h3'>
              13.2 Termination by Clym
            </Typography>
            <Typography>
              This Agreement terminates automatically if you violate any terms of this EULA. Upon termination, you must cease using the Software and destroy all copies.
            </Typography>
            <Typography variant='h3'>
              13.3 Survival
            </Typography>
            <Typography>
              Sections regarding disclaimers, limitations of liability, and indemnification shall survive termination.
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              14. COMPLIANCE WITH LAWS
            </Typography>
            <Typography>
              You agree to use the Software in compliance with all applicable laws and regulations, including but not limited to:
            </Typography>
            <ul>
              <li>
                <Typography>Data protection and privacy laws</Typography>
              </li>
              <li>
                <Typography>Computer fraud and abuse laws</Typography>
              </li>
              <li>
                <Typography>Intellectual property laws</Typography>
              </li>
              <li>
                <Typography>Accessibility regulations and standards</Typography>
              </li>
            </ul>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              15. EXPORT CONTROLS
            </Typography>
            <Typography>
              The Software may be subject to export control laws. You agree to comply with all applicable export and import laws and regulations.
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              16. GENERAL PROVISIONS
            </Typography>
            <Typography variant='h3'>
              16.1 Governing Law
            </Typography>
            <Typography>
              This Agreement is governed by the laws of Delaware, United States, without regard to conflict of law principles.
            </Typography>
            <Typography variant='h3'>
              16.2 Entire Agreement
            </Typography>
            <Typography>
              This Agreement, together with the MIT License, constitutes the entire agreement between you and Clym regarding the Software.
            </Typography>
            <Typography variant='h3'>
              16.3 Severability
            </Typography>
            <Typography>
              If any provision of this Agreement is deemed invalid, the remaining provisions shall remain in full force and effect.
            </Typography>
            <Typography variant='h3'>
              16.4 No Waiver
            </Typography>
            <Typography>
              Failure to enforce any provision does not constitute a waiver of that provision.
            </Typography>
            <Typography variant='h3'>
              16.5 Assignment
            </Typography>
            <Typography>
              You may not assign your rights under this Agreement without Clym's written consent.
            </Typography>
          </div>
          <div className={style.terms}>
            <Typography variant='h2'>
              17. CONTACT INFORMATION
            </Typography>
            <Typography>
              For questions about this Agreement or the Software, please contact:
            </Typography>
            <Typography><strong>Clym Inc</strong></Typography>
            <Typography mt='0 !important'>Website: https://www.clym.io</Typography>
            <Typography mt='0 !important'>Email: support@clym.io</Typography>
            <Typography mt='0 !important'>Address: Clym Inc., 1209 Orange Street, Wilmington, Delaware 19801, United States</Typography>
          </div>
        </div>
      </section>
      <section className={style.footer}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={isConfirmed}
              onChange={handleCheckboxChange}
              className={style.checkbox}
            />
          )}
          label={<Typography>By installing or using Clym Accessibility Tools, you acknowledge that you have read, understood, and agree to be bound by this End User License Agreement.</Typography>}
          className={style.formControlLabel}
        />
        <Box className={style.actionButtonsContainer}>
          <Typography mt={2} fontSize='0.8rem !important'>Last Updated: {formatDate(new Date(EULA_LAST_UPDATED))}</Typography>
          <Box className={style.actionButtons}>
            <Button variant='outlined' onClick={handleCancel} className={style.cancelButton}><Typography>Cancel</Typography></Button>
            <Button onClick={handleSubmit} className={style.submitButton} disabled={!isConfirmed} type='submit'><Typography>OK</Typography></Button>
          </Box>
        </Box>
      </section>
    </main>
  );
};
export default Eula;
