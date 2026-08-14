/**
 * Clean text blocks and parse details from resume PDF text.
 */
export const parseResumeText = (text) => {
  const result = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      bio: ''
    },
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: []
  };

  if (!text) return result;

  // Normalize newlines and whitespace
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n');
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // 1. Parse simple contact items first from the top section of the resume (first 10 lines)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  const githubRegex = /(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/;

  // Scan entire text for email, phone, and links
  const emailMatch = normalizedText.match(emailRegex);
  if (emailMatch) result.personalInfo.email = emailMatch[0];

  const phoneMatch = normalizedText.match(phoneRegex);
  if (phoneMatch) result.personalInfo.phone = phoneMatch[0];

  const linkedinMatch = normalizedText.match(linkedinRegex);
  if (linkedinMatch) result.socialLinks.linkedin = linkedinMatch[0];

  const githubMatch = normalizedText.match(githubRegex);
  if (githubMatch) result.socialLinks.github = githubMatch[0];

  // Try to find Name (normally the first or second non-empty line, if it doesn't contain links/emails/phone)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      !line.includes('@') &&
      !line.match(phoneRegex) &&
      !line.match(linkedinRegex) &&
      !line.match(githubRegex) &&
      line.length > 2 &&
      line.length < 35 &&
      /\b[A-Z][a-z]+/.test(line) // Capitalized words
    ) {
      result.personalInfo.name = line;
      // The line below it could be their profession/headline
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (
          !nextLine.includes('@') &&
          !nextLine.match(phoneRegex) &&
          nextLine.length > 3 &&
          nextLine.length < 40 &&
          !/summary|experience|skills|education/i.test(nextLine)
        ) {
          result.personalInfo.title = nextLine;
        }
      }
      break;
    }
  }

  // 2. Identify sections
  const sections = {
    summary: ['summary', 'professional summary', 'profile', 'objective', 'about me'],
    skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'technologies'],
    experience: ['experience', 'work experience', 'professional experience', 'employment history', 'employment'],
    education: ['education', 'academic background', 'studies', 'academic credentials'],
    projects: ['projects', 'personal projects', 'key projects', 'academic projects'],
    certifications: ['certifications', 'licenses', 'credentials', 'certifications & courses'],
    achievements: ['achievements', 'awards', 'honors', 'accomplishments'],
    languages: ['languages', 'languages known']
  };

  const sectionIndexes = [];

  // Find occurrences of section headers
  lines.forEach((line, index) => {
    const cleanLine = line.toLowerCase().replace(/[^a-z ]/g, '').trim();
    for (const [key, aliases] of Object.entries(sections)) {
      if (aliases.includes(cleanLine)) {
        sectionIndexes.push({ key, index });
        break;
      }
    }
  });

  // Sort section header indices
  sectionIndexes.sort((a, b) => a.index - b.index);

  // Extract content between section headers
  const getSectionLines = (secKey) => {
    const targetIdx = sectionIndexes.findIndex(s => s.key === secKey);
    if (targetIdx === -1) return [];

    const start = sectionIndexes[targetIdx].index + 1;
    const end = (targetIdx + 1 < sectionIndexes.length) ? sectionIndexes[targetIdx + 1].index : lines.length;
    return lines.slice(start, end);
  };

  // Extract Summary
  const summaryLines = getSectionLines('summary');
  if (summaryLines.length > 0) {
    result.summary = summaryLines.join(' ');
    result.personalInfo.bio = result.summary;
  }

  // Extract Skills
  const skillsLines = getSectionLines('skills');
  if (skillsLines.length > 0) {
    // Skills are often separated by commas, bullets, pipes, or on separate lines
    const skillsText = skillsLines.join(', ');
    result.skills = skillsText
      .split(/[,|•·\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30 && !/skills|languages|contact/i.test(s));
  }

  // Extract Languages
  const languagesLines = getSectionLines('languages');
  if (languagesLines.length > 0) {
    const langText = languagesLines.join(', ');
    result.languages = langText
      .split(/[,|•·\n]/)
      .map(l => l.trim())
      .filter(l => l.length > 1 && l.length < 25);
  }

  // Extract Education
  const educationLines = getSectionLines('education');
  educationLines.forEach((line) => {
    // Attempt to split single line by typical delimiters
    const tokens = line.split(/[—\-\|]/).map(t => t.trim()).filter(Boolean);
    
    let degree = '';
    let school = '';
    let fieldOfStudy = '';
    let startYear = '';
    let endYear = '';

    const degreeRegex = /\b(MCA|BCA|MBA|BBA|BTech|B\.Tech|MTech|M\.Tech|PhD|Ph\.D|BSc|B\.Sc|MSc|M\.Sc|BA|B\.A|MA|M\.A|BCom|B\.Com|MCom|M\.Com|B\.E|BE|M\.E|ME|Bachelor|Master|Diploma|Associate|Doctorate)\b/i;
    const yearRegex = /\b((?:19|20)\d{2})\b/g;

    if (tokens.length >= 2) {
      // Analyze tokens
      tokens.forEach((token) => {
        const hasDegree = degreeRegex.test(token);
        const hasYear = yearRegex.test(token);
        const hasSchool = /university|college|school|institute|academy|iit|nit/i.test(token);

        if (hasDegree && !degree) {
          degree = token.match(degreeRegex)[0]; // Use matching segment only
        } else if (hasYear && !startYear) {
          const years = token.match(yearRegex);
          startYear = years[0] || '';
          endYear = years[1] || '';
        } else if (hasSchool && !school) {
          school = token;
        } else if (!school && !degree && !startYear) {
          if (token.length > 5) school = token;
        } else if (school && !fieldOfStudy) {
          fieldOfStudy = token;
        }
      });
    }

    // Fallback if token splitting didn't yield results
    if (!school && !degree) {
      const degreeMatch = line.match(degreeRegex);
      if (degreeMatch) {
        degree = degreeMatch[0];
      }
      
      const years = line.match(yearRegex);
      if (years) {
        startYear = years[0] || '';
        endYear = years[1] || '';
      }

      const schoolMatch = line.match(/([a-zA-Z\s]+(?:university|college|school|institute|academy|iit|nit)[a-zA-Z\s]*)/i);
      if (schoolMatch) {
        school = schoolMatch[0].trim();
      } else {
        let cleaned = line;
        if (degree) cleaned = cleaned.replace(degree, '');
        if (years) {
          years.forEach(y => cleaned = cleaned.replace(y, ''));
        }
        cleaned = cleaned.replace(/[\-\—\|,\(\)]/g, '').trim();
        if (cleaned.length > 4) {
          school = cleaned;
        }
      }
    }

    if (school || degree) {
      result.education.push({
        school: school || 'Institution Name',
        degree: degree || '', // empty if not found, DO NOT GUESS
        fieldOfStudy: fieldOfStudy || '',
        startDate: startYear || '',
        endDate: endYear || '',
        description: ''
      });
    }
  });

  // Extract Experience
  const experienceLines = getSectionLines('experience');
  let currentExp = null;
  experienceLines.forEach((line) => {
    // A line starting a new experience often has keys like titles or company,
    // or we start a new experience if we encounter a company indicator
    const hasCompanyIndicator = /inc\b|llc\b|corp\b|ltd\b|co\b|company|agency|group|technologies|solutions/i.test(line);
    const hasTitleIndicator = /developer|engineer|manager|lead|intern|analyst|designer|consultant|specialist/i.test(line);
    
    // Look for dates pattern (e.g., Nov 2018 - Present, or 2018-2022)
    const hasDatePattern = /\b(19|20)\d{2}\b/.test(line);

    if ((hasCompanyIndicator || hasTitleIndicator) && (currentExp === null || hasDatePattern || lines.indexOf(line) - (currentExp.startLineIdx || 0) > 4)) {
      if (currentExp) {
        delete currentExp.startLineIdx;
        result.experience.push(currentExp);
      }
      currentExp = {
        company: hasCompanyIndicator ? line : 'Company Name',
        title: hasTitleIndicator ? line : 'Professional Title',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        startLineIdx: lines.indexOf(line)
      };

      if (hasCompanyIndicator && hasTitleIndicator) {
        // e.g. "Software Engineer at Google"
        const parts = line.split(/\bat\b|\bfor\b/i);
        if (parts.length > 1) {
          currentExp.title = parts[0].trim();
          currentExp.company = parts[1].trim();
        }
      }
    } else if (currentExp) {
      if (hasDatePattern) {
        const dateMatch = line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(?:19|20)\d{2})\b/gi);
        if (dateMatch) {
          currentExp.startDate = dateMatch[0];
          currentExp.endDate = dateMatch[1] || (/present/i.test(line) ? 'Present' : '');
          if (/present/i.test(line)) currentExp.current = true;
        } else {
          // Fallback year match
          const yearMatch = line.match(/\b((?:19|20)\d{2})\b/g);
          if (yearMatch) {
            currentExp.startDate = yearMatch[0];
            currentExp.endDate = yearMatch[1] || 'Present';
            if (currentExp.endDate === 'Present') currentExp.current = true;
          }
        }
      } else {
        // Append description
        currentExp.description = (currentExp.description ? currentExp.description + '\n' : '') + line;
      }
    }
  });
  if (currentExp) {
    delete currentExp.startLineIdx;
    result.experience.push(currentExp);
  }

  // Extract Projects
  const projectsLines = getSectionLines('projects');
  let currentProj = null;
  projectsLines.forEach((line) => {
    // If line is short and has no bullet points, it could be a project title
    const isNewProject = line.length > 3 && line.length < 40 && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•');
    if (isNewProject || currentProj === null) {
      if (currentProj) result.projects.push(currentProj);
      currentProj = {
        title: line.replace(/^[^a-zA-Z0-9]+/, ''), // strip leading characters
        description: '',
        technologies: [],
        link: ''
      };
      // Check for link inside title line
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        currentProj.link = urlMatch[0];
        currentProj.title = currentProj.title.replace(urlMatch[0], '').trim();
      }
    } else {
      // Try to find technologies in brackets or listed
      if (/technologies|tech stack|built with|using/i.test(line)) {
        const techs = line.replace(/technologies|tech stack|built with|using|:|：/gi, '')
          .split(/[,|•·\n]/)
          .map(t => t.trim())
          .filter(t => t.length > 0);
        currentProj.technologies.push(...techs);
      } else {
        currentProj.description = (currentProj.description ? currentProj.description + '\n' : '') + line;
      }
    }
  });
  if (currentProj) result.projects.push(currentProj);

  // Extract Certifications
  const certLines = getSectionLines('certifications');
  certLines.forEach((line) => {
    const parts = line.split(/by|from|-|–/i);
    result.certifications.push({
      name: parts[0]?.trim() || line,
      issuingOrganization: parts[1]?.trim() || 'Issuing Authority',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: ''
    });
  });

  // Extract Achievements
  const achLines = getSectionLines('achievements');
  achLines.forEach((line) => {
    result.achievements.push(line.replace(/^[-*•·\s]+/, ''));
  });

  // Set default fallbacks if lists are empty
  if (result.skills.length === 0) {
    result.skills = ['Communication', 'Problem Solving', 'Teamwork'];
  }

  // Clean empty links
  for (const key in result.socialLinks) {
    if (result.socialLinks[key]) {
      // ensure protocol is present
      if (!result.socialLinks[key].startsWith('http')) {
        result.socialLinks[key] = 'https://' + result.socialLinks[key];
      }
    }
  }

  return result;
};
