import { defineQuery } from "next-sanity";

const resumeImageFields = `
  alt,
  crop,
  hotspot,
  asset->{
    _id,
    url,
    mimeType,
    extension,
    originalFilename
  }
`;

const resumeLayoutFields = `
  "layout": {
    "accentColor": select(
      layout.accentColor in ["skyblue", "red", "nephritis", "concrete", "darknight"] => layout.accentColor,
      "skyblue"
    ),
    "paperSize": select(
      layout.paperSize in ["a4", "us-letter"] => layout.paperSize,
      "a4"
    ),
    "density": select(
      layout.density in ["compact", "standard", "relaxed"] => layout.density,
      "standard"
    ),
    "showProfilePhoto": coalesce(layout.showProfilePhoto, true),
    "showEntryLogos": coalesce(layout.showEntryLogos, true)
  }
`;

const resumeEntryFields = `
  _key,
  title,
  society,
  date,
  location,
  url,
  description,
  tags,
  logo{
    ${resumeImageFields}
  }
`;

const resumeRoleFields = `
  _key,
  title,
  date,
  url,
  description,
  tags
`;

const resumeExperienceFields = `
  ${resumeEntryFields},
  roles[]{
    ${resumeRoleFields}
  }
`;

const resumeHonorFields = `
  _key,
  title,
  issuer,
  date,
  location,
  url
`;

const resumeBibliographyFields = `
  publicationBibliography{
    style,
    keys,
    showAll,
    bibFile{
      asset->{
        _id,
        url,
        mimeType,
        extension,
        originalFilename
      }
    }
  }
`;

export const RESUME_LANGUAGES_QUERY = defineQuery(`
  *[_type == "resume" && defined(firstName) && firstName != "" && defined(lastName) && lastName != ""]{language}
`);

export const RESUME_QUERY = defineQuery(`
  *[_type == "resume" && language == $locale][0]{
    _id,
    _updatedAt,
    firstName,
    lastName,
    displayName,
    headerQuote,
    contact{
      email,
      phone,
      location,
      homepage,
      github,
      linkedin,
      gitlab,
      orcid,
      researchgate,
      extraInfo
    },
    sectionOrder,
    skills[]{
      _key,
      type,
      items,
      level,
      display
    },
    atsKeywords,
    ${resumeLayoutFields},
    profilePhoto{
      ${resumeImageFields}
    },
    experiences[]{
      ${resumeExperienceFields}
    },
    projects[]{
      ${resumeEntryFields}
    },
    education[]{
      ${resumeEntryFields}
    },
    certificates[]{
      ${resumeHonorFields}
    },
    publications[]{
      ${resumeEntryFields}
    },
    ${resumeBibliographyFields}
  }
`);
