import PDFDocument from 'pdfkit';

export const generatePdfResume = (profile, templateId = 'classic') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const {
        personalInfo = {},
        socialLinks = {},
        summary = '',
        education = [],
        experience = [],
        skills = [],
        projects = [],
        certifications = [],
        achievements = [],
        languages = []
      } = profile;

      const profileSummary = summary || personalInfo.bio || '';

      // Set up colors depending on the template style
      let primaryColor = '#111111';
      let accentColor = '#4B5563'; // gray
      let linkColor = '#2563EB'; // blue

      if (templateId === 'modern') {
        primaryColor = '#1E3A8A'; // Deep Navy
        accentColor = '#3B82F6';
      } else if (templateId === 'creative') {
        primaryColor = '#0D9488'; // Teal
        accentColor = '#14B8A6';
      }

      // ==========================================
      // TEMPLATE 1: MODERN (TWO COLUMN SIDEBAR)
      // ==========================================
      if (templateId === 'modern') {
        const sidebarWidth = 180;
        const mainX = 205;
        const mainWidth = 350;

        // Draw left sidebar colored rectangle
        doc.rect(0, 0, sidebarWidth, doc.page.height).fill('#0F172A'); // Slate 900

        // Sidebar Text - Contact
        doc.fillColor('#FFFFFF');
        doc.font('Helvetica-Bold').fontSize(16).text(personalInfo.name || 'Your Name', 20, 40, { width: sidebarWidth - 40 });
        
        doc.font('Helvetica-Oblique').fontSize(10).fillColor('#94A3B8').text(personalInfo.title || '', 20, doc.y + 5);
        
        doc.rect(20, doc.y + 10, sidebarWidth - 40, 1).fill('#334155'); // separator
        
        doc.y += 20;
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('CONTACT', 20, doc.y);
        doc.y += 8;
        doc.font('Helvetica').fontSize(9).fillColor('#CBD5E1');
        
        if (personalInfo.email) {
          doc.text('Email:', 20, doc.y).text(personalInfo.email, 20, doc.y + 2, { width: sidebarWidth - 40 }).y += 15;
        }
        if (personalInfo.phone) {
          doc.text('Phone:', 20, doc.y).text(personalInfo.phone, 20, doc.y + 2).y += 15;
        }
        if (personalInfo.location) {
          doc.text('Location:', 20, doc.y).text(personalInfo.location, 20, doc.y + 2, { width: sidebarWidth - 40 }).y += 15;
        }

        // Links
        const links = [
          { label: 'LinkedIn', val: socialLinks.linkedin },
          { label: 'GitHub', val: socialLinks.github },
          { label: 'Portfolio', val: socialLinks.portfolio }
        ].filter(l => l.val);

        if (links.length > 0) {
          doc.y += 10;
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('SOCIAL LINKS', 20, doc.y);
          doc.y += 8;
          doc.font('Helvetica').fontSize(8).fillColor('#93C5FD');
          links.forEach((l) => {
            doc.text(`${l.label}:`, 20, doc.y).text(l.val, 20, doc.y + 2, { width: sidebarWidth - 40, underline: true }).y += 15;
          });
        }

        // Skills
        if (skills.length > 0) {
          doc.y += 10;
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('SKILLS', 20, doc.y);
          doc.y += 8;
          
          skills.forEach((skill) => {
            // Draw a tiny bullet block
            doc.rect(20, doc.y + 3, 4, 4).fill('#60A5FA');
            doc.font('Helvetica').fontSize(9).fillColor('#E2E8F0').text(skill, 28, doc.y, { width: sidebarWidth - 48 });
            doc.y += 14;
          });
        }

        // Languages
        if (languages.length > 0) {
          doc.y += 10;
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('LANGUAGES', 20, doc.y);
          doc.y += 8;
          doc.font('Helvetica').fontSize(9).fillColor('#E2E8F0');
          doc.text(languages.join(', '), 20, doc.y, { width: sidebarWidth - 40 });
        }

        // --- RIGHT COLUMN ---
        let currentY = 40;
        doc.fillColor('#1E293B');

        // Summary
        if (profileSummary) {
          doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text('PROFESSIONAL SUMMARY', mainX, currentY);
          currentY = doc.y + 5;
          doc.rect(mainX, currentY, mainWidth, 1).fill('#CBD5E1');
          currentY += 8;
          doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text(profileSummary, mainX, currentY, { width: mainWidth, align: 'justify' });
          currentY = doc.y + 20;
        }

        // Experience
        if (experience.length > 0) {
          doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text('WORK EXPERIENCE', mainX, currentY);
          currentY = doc.y + 5;
          doc.rect(mainX, currentY, mainWidth, 1).fill('#CBD5E1');
          currentY += 8;

          experience.forEach((exp) => {
            // Prevent simple overflow
            if (currentY > 750) {
              doc.addPage();
              doc.rect(0, 0, sidebarWidth, doc.page.height).fill('#0F172A'); // Redraw sidebar
              currentY = 40;
            }

            const duration = `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`;
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#1E293B').text(exp.title, mainX, currentY);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748B').text(`${exp.company} | ${duration}`, mainX, doc.y + 2);
            
            if (exp.location) {
              doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#94A3B8').text(exp.location, mainX, doc.y + 2);
            }
            
            if (exp.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#475569').text(exp.description, mainX, doc.y + 4, { width: mainWidth, align: 'left' });
            }
            
            currentY = doc.y + 12;
          });
        }

        // Education
        if (education.length > 0) {
          if (currentY > 700) {
            doc.addPage();
            doc.rect(0, 0, sidebarWidth, doc.page.height).fill('#0F172A');
            currentY = 40;
          }

          doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text('EDUCATION', mainX, currentY);
          currentY = doc.y + 5;
          doc.rect(mainX, currentY, mainWidth, 1).fill('#CBD5E1');
          currentY += 8;

          education.forEach((edu) => {
            const eduYears = `${edu.startDate || ''} - ${edu.endDate || ''}`;
            doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1E293B').text(`${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`, mainX, currentY);
            doc.font('Helvetica').fontSize(9.5).fillColor('#475569').text(`${edu.school} (${eduYears})`, mainX, doc.y + 2);
            if (edu.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#64748B').text(edu.description, mainX, doc.y + 3, { width: mainWidth });
            }
            currentY = doc.y + 10;
          });
          currentY += 10;
        }

        // Projects
        if (projects.length > 0) {
          if (currentY > 700) {
            doc.addPage();
            doc.rect(0, 0, sidebarWidth, doc.page.height).fill('#0F172A');
            currentY = 40;
          }

          doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text('PROJECTS', mainX, currentY);
          currentY = doc.y + 5;
          doc.rect(mainX, currentY, mainWidth, 1).fill('#CBD5E1');
          currentY += 8;

          projects.forEach((proj) => {
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#1E293B').text(proj.title, mainX, currentY);
            if (proj.link) {
              doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(linkColor).text(proj.link, mainX, doc.y + 1, { underline: true });
            }
            if (proj.technologies && proj.technologies.length > 0) {
              doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#64748B').text(`Tech Stack: ${proj.technologies.join(', ')}`, mainX, doc.y + 2);
            }
            if (proj.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#475569').text(proj.description, mainX, doc.y + 3, { width: mainWidth });
            }
            currentY = doc.y + 10;
          });
          currentY += 10;
        }

        // Certifications
        if (certifications.length > 0) {
          if (currentY > 720) {
            doc.addPage();
            doc.rect(0, 0, sidebarWidth, doc.page.height).fill('#0F172A');
            currentY = 40;
          }

          doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text('CERTIFICATIONS', mainX, currentY);
          currentY = doc.y + 5;
          doc.rect(mainX, currentY, mainWidth, 1).fill('#CBD5E1');
          currentY += 8;

          certifications.forEach((cert) => {
            const dateStr = [cert.issueDate, cert.expirationDate].filter(Boolean).join(' - ');
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1E293B').text(cert.name, mainX, currentY);
            doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`${cert.issuingOrganization} ${dateStr ? '| ' + dateStr : ''}`, mainX, doc.y + 1);
            currentY = doc.y + 8;
          });
        }

      } else {
        // ==========================================
        // TEMPLATE 2 & 3: CLASSIC / CREATIVE (SINGLE COLUMN)
        // ==========================================
        const startX = 40;
        const pageW = 515; // 595 (A4 width) - 80 (margins)

        if (templateId === 'creative') {
          // Creative: colored top header banner
          doc.rect(0, 0, doc.page.width, 100).fill('#F0FDFA');
          doc.fillColor('#0F766E'); // Teal 700
          doc.font('Helvetica-Bold').fontSize(24).text(personalInfo.name || 'Your Name', startX, 25);
          doc.font('Helvetica-Oblique').fontSize(12).fillColor('#134E4A').text(personalInfo.title || '', startX, doc.y + 3);
          
          doc.y = 80;
        } else {
          // Classic
          doc.fillColor('#111111');
          doc.font('Helvetica-Bold').fontSize(22).text(personalInfo.name || 'Your Name', startX, 40, { align: 'center' });
          if (personalInfo.title) {
            doc.font('Helvetica-Oblique').fontSize(11).fillColor('#555555').text(personalInfo.title, startX, doc.y + 3, { align: 'center' });
          }
        }

        // Contact info string
        const contactInfoList = [
          personalInfo.email,
          personalInfo.phone,
          personalInfo.location
        ].filter(Boolean);

        const socialInfoList = [
          socialLinks.linkedin,
          socialLinks.github,
          socialLinks.portfolio
        ].filter(Boolean);

        const fullContact = [...contactInfoList, ...socialInfoList].join('  |  ');
        
        doc.font('Helvetica').fontSize(8.5).fillColor('#4B5563');
        if (templateId === 'creative') {
          doc.text(fullContact, startX, 75, { width: pageW, align: 'left' });
          doc.y = 115; // move below header block
        } else {
          doc.text(fullContact, startX, doc.y + 6, { width: pageW, align: 'center' });
          doc.y += 15;
        }

        // Helper function to draw Section headers in full width
        const drawHeader = (title) => {
          if (doc.y > 720) {
            doc.addPage();
          }
          doc.y += 10;
          doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text(title.toUpperCase(), startX, doc.y);
          doc.y += 3;
          doc.rect(startX, doc.y, pageW, 1.5).fill(accentColor);
          doc.y += 6;
        };

        // Summary
        if (profileSummary) {
          drawHeader('Professional Summary');
          doc.font('Helvetica').fontSize(9.5).fillColor('#2D3748').text(profileSummary, startX, doc.y, { width: pageW, align: 'justify', lineGap: 2 });
          doc.y += 10;
        }

        // Experience
        if (experience.length > 0) {
          drawHeader('Experience');
          experience.forEach((exp) => {
            if (doc.y > 700) doc.addPage();
            
            const duration = `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`;
            
            // Flex row logic manually via positioning
            const itemY = doc.y + 5;
            doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1A202C').text(exp.title, startX, itemY);
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#4A5568').text(`${exp.company}  [ ${duration} ]`, startX, doc.y + 2);
            if (exp.location) {
              doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#718096').text(exp.location, startX, doc.y + 2);
            }
            if (exp.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#2D3748').text(exp.description, startX, doc.y + 4, { width: pageW, align: 'left' });
            }
            doc.y += 8;
          });
        }

        // Education
        if (education.length > 0) {
          drawHeader('Education');
          education.forEach((edu) => {
            if (doc.y > 710) doc.addPage();
            const eduYears = `${edu.startDate || ''} - ${edu.endDate || ''}`;

            doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1A202C').text(`${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`, startX, doc.y + 4);
            doc.font('Helvetica').fontSize(9.5).fillColor('#4A5568').text(`${edu.school} (${eduYears})`, startX, doc.y + 1);
            if (edu.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#4A5568').text(edu.description, startX, doc.y + 2, { width: pageW });
            }
            doc.y += 8;
          });
        }

        // Projects
        if (projects.length > 0) {
          drawHeader('Projects');
          projects.forEach((proj) => {
            if (doc.y > 700) doc.addPage();

            doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1A202C').text(proj.title, startX, doc.y + 4);
            if (proj.link) {
              doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(linkColor).text(proj.link, startX, doc.y + 1, { underline: true });
            }
            if (proj.technologies && proj.technologies.length > 0) {
              doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#718096').text(`Tech Stack: ${proj.technologies.join(', ')}`, startX, doc.y + 2);
            }
            if (proj.description) {
              doc.font('Helvetica').fontSize(9).fillColor('#2D3748').text(proj.description, startX, doc.y + 2, { width: pageW });
            }
            doc.y += 8;
          });
        }

        // Skills & Languages
        if (skills.length > 0 || languages.length > 0) {
          drawHeader('Skills & Languages');
          if (skills.length > 0) {
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1A202C').text('Technical Skills: ', startX, doc.y + 4, { continued: true });
            doc.font('Helvetica').fontSize(9.5).fillColor('#2D3748').text(skills.join(', '));
            doc.y += 6;
          }
          if (languages.length > 0) {
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1A202C').text('Languages: ', startX, doc.y + 4, { continued: true });
            doc.font('Helvetica').fontSize(9.5).fillColor('#2D3748').text(languages.join(', '));
            doc.y += 6;
          }
        }

        // Certifications
        if (certifications.length > 0) {
          drawHeader('Certifications');
          certifications.forEach((cert) => {
            if (doc.y > 720) doc.addPage();
            const dateStr = [cert.issueDate, cert.expirationDate].filter(Boolean).join(' - ');

            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1A202C').text(cert.name, startX, doc.y + 4, { continued: true });
            doc.font('Helvetica').fontSize(9.5).fillColor('#4A5568').text(` by ${cert.issuingOrganization} ${dateStr ? '(' + dateStr + ')' : ''}`);
            doc.y += 4;
          });
        }

        // Achievements
        if (achievements.length > 0) {
          drawHeader('Achievements');
          achievements.forEach((ach) => {
            if (doc.y > 720) doc.addPage();
            doc.rect(startX, doc.y + 5, 3, 3).fill(primaryColor);
            doc.font('Helvetica').fontSize(9.5).fillColor('#2D3748').text(ach, startX + 10, doc.y + 2, { width: pageW - 10 });
            doc.y += 5;
          });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
