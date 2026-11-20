# Content ownership and page editing

Personal text, identity, media, and animated signature paths belong in Sanity.

## Where to edit

| Website content | Sanity Studio location |
| --- | --- |
| Homepage layout | Pages → Home → Page content → Page builder |
| Homepage SEO | Pages → Home → SEO |
| Central heading, tagline, static or animated name artwork | Pages → Home → Page content → Hero scene → Main heading |
| Badge name, portrait, front and back text | Pages → Home → Page content → Hero scene → Badge |
| Terminal username and output | Pages → Home → Page content → Hero scene → Terminal |
| Collage photos and caption | Pages → Home → Page content → Hero scene → Collage |
| Folder label and selected projects or posts | Pages → Home → Page content → Hero scene → Folder |
| Music tracks | Pages → Home → Page content → Hero scene → Music |
| Featured cutout and sticker | Pages → Home → Page content → Hero scene → Decorative images |
| About headline, biography, interests, and their images | Pages → Home → Page content → About card |
| Homepage project heading and number of projects | Pages → Home → Page content → Projects card |
| Homepage writing heading and number of posts | Pages → Home → Page content → Writing card |
| Blog index title, introduction, SEO | Pages → Blog |
| Projects index title, introduction, SEO | Pages → Projects |
| Site title, metadata author, copyright holder, social links, default social image | Site Settings |
| Articles | All Posts |
| Project details | All Projects |
| Résumé | Pages → Résumés |
| Legal pages | Pages → Legal Pages |

The Pages menu contains Home, Blog, Projects, Résumés, and Legal Pages. Blog and
Projects control their index pages; All Posts and All Projects contain the
individual articles and project documents.

Home has no separate Page title or Page description in its content editor.
Set its browser, search, and social metadata in **SEO**. An empty SEO title uses
the generic localized Home label; an empty SEO description uses the site default.
Previously stored Home title and description values are retained in the dataset
but are no longer read. Edit the visible heading in Hero scene → Main heading and
other copy in its own builder section. Blog and Projects retain Page title and
Page description for their visible headings and introductions; SEO can override
their metadata.

Home uses the page-builder pattern from
[Sanity's course](https://www.sanity.io/learn/course/page-building/create-page-builder-schema-types).
Sections are embedded objects with stable `_key` values. Add, remove, and drag
sections to change the homepage. Each section can appear once; its layout,
interactions, icons, and responsive styling stay in code. Removing a section from
a published page removes it from the website. An empty builder stays empty.
Blog and Projects index pages have structured page fields; article bodies and
résumés retain their existing structured models.

The builder shows compact cards with section-specific icons and previews. Open
one to edit it in a wide dialog. The Hero editor separates **Main heading**,
**Badge**, **Terminal**, **Collage**, **Folder**, **Music**, and **Decorative images**. The badge
has Name & portrait, Front text, and Back text tabs; technical SVG data is
collapsed under Main heading → Heading artwork. The All fields tab is
hidden so everyday editing starts with a focused form. Studio can still reveal
fields through validation links and deep links.

Collage uses its own photo collection. Folder displays up to three selected
projects or blog posts in the page's language, using references to their current
titles and summaries. Choose them under **Folder → Selected content**, and set an
optional folder label. No folder image uploads are needed. Leaving either widget's
collection empty hides that widget; neither borrows content from the other.

About separates **Introduction** from **Interests**. Add any number of topics,
reorder them, and reuse any illustration style. Styles control the icon, accent,
and fallback artwork; topic titles and descriptions are independent. The website
uses each item's stable key for selection and scrolls the tab strip when needed.
Long editor collections show the first four entries with a Show all control;
photos use thumbnails, and topic/track/entry previews identify their content.

Site Settings separates identity, accounts, and default sharing metadata. Posts
and projects separate writing from publishing and SEO. The résumé has focused
tabs for profile, experience/projects, education/credentials, skills, and PDF
settings. Tags and skill lists use compact token inputs.

Field types reflect what the renderer accepts: short labels are strings,
paragraphs are plain text, article bodies use Portable Text, images use image
assets, and website/audio links use URL fields. Résumé account fields remain
usernames and résumé dates remain display text for localized ranges and ongoing
roles. SVG paths use multiline text inputs while retaining the same stored
strings. Existing document IDs, object keys, and field names remain compatible;
these form improvements require no content re-import. The stored interest field
`area` now means illustration style and no longer limits which topics can appear.

Pages use `@sanity/document-internationalization`, just like posts, projects,
and résumés. Opening Home, Blog, or Projects under Pages opens its English
document directly. If it does not exist yet, the route offers its English creation
template. Posts, projects, and résumés also list only English source documents.
Use **Translations** in the editor to create or switch languages. The route is
copied to page translations. Frontend queries select by route and language,
accepting both imported IDs and IDs generated by the plugin. Maintain one
document per route and language.

For language documents imported separately, open **Translations → Manage
Translations** and link the existing language versions once. Do this instead of
creating another translation for a language that already exists. No ID changes or
content re-import is needed. Studio search can find unlinked or translated-only
documents that do not appear in the English content lists.

Site Settings is global: changing the title updates the header, footer, and page
metadata. Visible copy reads its own CMS field, with generic labels or an empty
state when missing. Hero Heading text controls its visible name, accessible
heading and artwork label; its Heading text field shows **Your name** when empty,
never the site or author name. The badge uses its own **Badge name** and **Badge
portrait** fields; neither borrows from the main heading or Site Settings.
Copyright holder is independent of Site title. Image
captions and alternative text do not borrow topic or project titles.

The GitHub icon and contribution graph use the shared **Site Settings → Links & accounts →
GitHub profile** directly, with no per-widget override.

Résumé Display name controls the name on the web résumé and PDF, including its
footer. When empty it shows the localized **Your name** placeholder. First name
and Last name remain available for metadata and PDF download filenames. A
certificate's Issuer field is its only issuer source. The old shared portrait
and certificate Organization fields have been removed from the schema and queries.

Search and social metadata use published content. Page SEO overrides the public
title and description, which otherwise come from the document or site defaults.
For sharing, upload an image in **SEO → Social sharing** to override the card
for that page. **Site Settings → Sharing → Homepage social image** applies to
the homepage when its SEO has no image. Each page without an override gets its
own 1200×630 card in the portfolio's light grid style, generated from published
page and site text. Article and project covers still appear on the page.
Missing social accounts are hidden; no contribution request is made without a
valid CMS GitHub profile. Missing optional personal copy and media stay absent.

SEO visibility applies to page metadata and the sitemap. Hiding Home, Blog, or
Projects affects only that language's URL; individual articles, projects, and
legal pages also emit noindex metadata when hidden. The sitemap reads published
page visibility with the same cache invalidation as other CMS content. It uses
actual CMS modification dates where available and retains static routes when the
CMS is unconfigured or unavailable.

Collage and About images honor their own crop and hotspot settings. Music playlist
edits start a new playback session so the current track, navigation order, audio,
and artwork stay consistent. Revalidation with equivalent track data preserves
playback; an empty playlist removes the player.

## Preserving the hero

The scene, lanyard physics, music controls, terminal, folder, collage, and name
animation remain reusable components. Their personal inputs come from the Hero
section. The animated name stores an SVG `viewBox` and an array of path strings;
the renderer retains its drawing animation. Without an animated graphic, the
heading uses the CMS display name as text. Optional widgets render when their required content exists. Add your own
tracks and gallery images in the Hero section.

## Studio input compatibility

Some injected autofill scripts construct CSS selectors directly from field IDs.
Sanity paths for keyed arrays contain quotes, which can make those selectors
invalid. Studio form components encode native DOM IDs and update their matching
labels and description references. Document paths, stored values, validation,
and Sanity's focus callbacks are preserved.

## Cache and preview

Pages use the strict, preview-aware Sanity cache with explicit perspective and
stega options. Metadata disables stega. Presentation maps each page to its public
route, and regular text/image overlays can open the relevant fields. Name path
data and 3D text are cleaned before rendering; edit those through the Hero block.

If you maintain a separate Sanity webhook, add `page` to its filter in addition
to the existing document types. The route comment in
`apps/web/app/api/revalidate/route.ts` contains the full filter and projection.
Use `NEXT_PUBLIC_WEB_URL` for the public site origin and Studio preview origin.

## What stays in source

- Dictionaries: navigation, buttons, accessibility labels, empty states, and
  neutral metadata fallbacks. They contain no owner biography or account data.
- `packages/config/site.ts`: neutral bootstrap branding, a generic Studio title,
  and the deliberate “Built by ISnackable” template attribution.
- Static icons, application icons, lanyard geometry/strap, and decorative collage
  props. Replace branded icons when adopting the template; these are not CMS
  managed. The social sharing image is CMS managed.
- Section components, typography, SVG placeholder artwork, colors, physics,
  animation timing, and layout. The builder offers content sections, not CSS
  controls or arbitrary executable HTML/SVG.
