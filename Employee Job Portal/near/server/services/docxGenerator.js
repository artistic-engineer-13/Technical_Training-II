import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const generateDocxResume = async (profile, templateId = 'classic') => {
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

  const docChildren = [];

  // Helper for adding section headers
  const addSectionHeader = (title) => {
    docChildren.push(
      new Paragraph({
        text: '',
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24,
            color: templateId === 'creative' ? '0D9488' : (templateId === 'modern' ? '1E3A8A' : '333333'),
          })
        ],
        spacing: { after: 100 }
      })
    );
  };

  // 1. Header Section
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personalInfo.name || 'Your Name',
          bold: true,
          size: 36,
          color: templateId === 'creative' ? '0D9488' : (templateId === 'modern' ? '1E3A8A' : '111111'),
        })
      ]
    })
  );

  if (personalInfo.title) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: personalInfo.title,
            italics: true,
            size: 22,
            color: '666666'
          })
        ],
        spacing: { after: 120 }
      })
    );
  }

  // Contact Info
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    socialLinks.linkedin,
    socialLinks.github,
    socialLinks.portfolio
  ].filter(Boolean);

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 18,
          color: '555555'
        })
      ],
      spacing: { after: 200 }
    })
  );

  // 2. Summary
  const profileSummary = summary || personalInfo.bio;
  if (profileSummary) {
    addSectionHeader('Professional Summary');
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profileSummary,
            size: 20,
            color: '333333'
          })
        ]
      })
    );
  }

  // 3. Work Experience
  if (experience.length > 0) {
    addSectionHeader('Work Experience');
    experience.forEach((exp) => {
      const dates = `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`;
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 20 }),
            new TextRun({ text: ` at ${exp.company}`, bold: true, size: 20, color: '555555' }),
            new TextRun({ text: ` (${dates})`, italics: true, size: 18, color: '666666' })
          ],
          spacing: { before: 100, after: 50 }
        })
      );
      if (exp.location) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: exp.location, italics: true, size: 18, color: '777777' })],
            spacing: { after: 50 }
          })
        );
      }
      if (exp.description) {
        // Split by newline to support multi-line descriptions
        exp.description.split('\n').forEach((descLine) => {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: descLine, size: 19 })],
              spacing: { after: 40 }
            })
          );
        });
      }
    });
  }

  // 4. Education
  if (education.length > 0) {
    addSectionHeader('Education');
    education.forEach((edu) => {
      const dates = `${edu.startDate || ''} - ${edu.endDate || ''}`;
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`, bold: true, size: 20 }),
            new TextRun({ text: ` - ${edu.school}`, size: 20 }),
            new TextRun({ text: ` (${dates})`, italics: true, size: 18, color: '666666' })
          ],
          spacing: { before: 100, after: 50 }
        })
      );
      if (edu.description) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: edu.description, size: 19 })],
            spacing: { after: 50 }
          })
        );
      }
    });
  }

  // 5. Projects
  if (projects.length > 0) {
    addSectionHeader('Projects');
    projects.forEach((proj) => {
      const children = [new TextRun({ text: proj.title, bold: true, size: 20 })];
      if (proj.link) {
        children.push(new TextRun({ text: ` (${proj.link})`, size: 18, color: '0000FF' }));
      }
      docChildren.push(new Paragraph({ children, spacing: { before: 100, after: 50 } }));

      if (proj.technologies && proj.technologies.length > 0) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Technologies: ', bold: true, size: 18 }),
              new TextRun({ text: proj.technologies.join(', '), size: 18 })
            ],
            spacing: { after: 50 }
          })
        );
      }

      if (proj.description) {
        proj.description.split('\n').forEach((descLine) => {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: descLine, size: 19 })],
              spacing: { after: 40 }
            })
          );
        });
      }
    });
  }

  // 6. Skills & Languages
  if (skills.length > 0 || languages.length > 0) {
    addSectionHeader('Skills & Languages');
    if (skills.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Skills: ', bold: true, size: 20 }),
            new TextRun({ text: skills.join(', '), size: 20 })
          ],
          spacing: { after: 50 }
        })
      );
    }
    if (languages.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Languages: ', bold: true, size: 20 }),
            new TextRun({ text: languages.join(', '), size: 20 })
          ],
          spacing: { after: 50 }
        })
      );
    }
  }

  // 7. Certifications
  if (certifications.length > 0) {
    addSectionHeader('Certifications');
    certifications.forEach((cert) => {
      const dates = [cert.issueDate, cert.expirationDate].filter(Boolean).join(' - ');
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20 }),
            new TextRun({ text: ` by ${cert.issuingOrganization}`, size: 20 }),
            dates ? new TextRun({ text: ` (${dates})`, italics: true, size: 18, color: '666666' }) : new TextRun({ text: '' })
          ],
          spacing: { before: 100, after: 50 }
        })
      );
    });
  }

  // 8. Achievements
  if (achievements.length > 0) {
    addSectionHeader('Achievements');
    achievements.forEach((ach) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '•  ', bold: true, size: 20 }),
            new TextRun({ text: ach, size: 20 })
          ],
          spacing: { after: 50 }
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
