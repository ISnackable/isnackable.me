"use client";

import type {
  ResumeData,
  ResumeEntry,
  ResumeRole,
  ResumeSkill,
} from "@repo/cms";
import { contentText } from "@repo/cms/content/text";
import {
  Avatar,
  AvatarFallback,
} from "@repo/design-system/components/ui/avatar";
import { Badge } from "@repo/design-system/components/ui/badge";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { useTranslations } from "@repo/internationalization/client";
import { stegaClean } from "@sanity/client/stega";
import {
  AwardIcon,
  BriefcaseIcon,
  Building2Icon,
  Code2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  GraduationCapIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WrenchIcon,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Image } from "next-sanity/image";
import { type ReactNode, useState } from "react";

type SectionKey =
  | "professional"
  | "projects"
  | "publications"
  | "education"
  | "certificates"
  | "skills";

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "education",
  "professional",
  "projects",
  "certificates",
  "publications",
  "skills",
];

const MAIN_SECTIONS: SectionKey[] = [
  "professional",
  "projects",
  "publications",
];
const SIDEBAR_SECTIONS: SectionKey[] = ["education", "certificates", "skills"];

const SECTION_ICONS: Record<SectionKey, typeof BriefcaseIcon> = {
  professional: BriefcaseIcon,
  projects: Code2Icon,
  publications: FileTextIcon,
  education: GraduationCapIcon,
  certificates: AwardIcon,
  skills: WrenchIcon,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function filterEntries(
  entries: ResumeEntry[] | null | undefined
): ResumeEntry[] {
  return (entries ?? []).filter((e): e is ResumeEntry => e !== null);
}

function entryKey(entry: ResumeEntry, index: number): string {
  return entry?._key ?? entry?._id ?? `entry-${index}`;
}

function socialUrl(
  key: string,
  value: string | null | undefined
): string | null {
  const cleaned = value ? stegaClean(value).trim() : "";
  if (!cleaned) {
    return null;
  }

  switch (key) {
    case "github":
      return `https://github.com/${cleaned}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleaned}`;
    case "gitlab":
      return `https://gitlab.com/${cleaned}`;
    case "orcid":
      return `https://orcid.org/${cleaned}`;
    case "researchgate":
      return `https://researchgate.net/profile/${cleaned}`;
    case "homepage":
      return cleaned;
    default:
      return null;
  }
}

function SectionHeader({
  sectionKey,
  sidebar = false,
}: {
  sectionKey: SectionKey;
  sidebar?: boolean;
}) {
  const t = useTranslations("web.resume.sections");
  const Icon = SECTION_ICONS[sectionKey];
  return (
    <div className={cn("mb-6 flex items-center gap-3", { "gap-1": sidebar })}>
      <div
        className={cn("rounded-xl text-primary shadow-sm", {
          "p-2": sidebar,
          "bg-primary/10 p-2.5": !sidebar,
        })}
      >
        <Icon
          className={cn("size-4", {
            "size-4": sidebar,
            "size-5": !sidebar,
          })}
        />
      </div>
      <h2
        className={cn("font-bold text-foreground tracking-tight", {
          "text-lg uppercase": sidebar,
          "text-2xl": !sidebar,
        })}
      >
        {t(sectionKey)}
      </h2>
    </div>
  );
}

function JobHeader({ job }: { job: ResumeEntry }) {
  return (
    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
      <h3 className="font-bold text-foreground text-lg transition-colors group-hover:text-primary">
        {job?.title}
      </h3>
      {job?.date ? (
        <Badge className="w-fit font-medium" variant="secondary">
          {job.date}
        </Badge>
      ) : null}
    </div>
  );
}

function JobSociety({
  society,
  className,
}: {
  society: string | null | undefined;
  className?: string;
}) {
  if (!society) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold text-primary text-sm",
        className
      )}
    >
      <Building2Icon className="size-3.5" />
      <span>{society}</span>
    </div>
  );
}

function TagList({ tags }: { tags: string[] | null | undefined }) {
  if (!tags?.length) {
    return null;
  }
  const filtered = tags.filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1.5">
      {filtered.map((tag) => (
        <Badge className="text-[10px]" key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function BulletList({
  items,
  className,
}: {
  items: string[] | null | undefined;
  className?: string;
}) {
  if (!items?.length) {
    return null;
  }
  const filtered = items.filter(Boolean);
  return (
    <ul
      className={cn(
        "ml-4 list-outside list-disc text-muted-foreground text-sm leading-relaxed",
        className
      )}
    >
      {filtered.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ExperienceRole({
  role,
  roleIndex,
}: {
  role: NonNullable<ResumeRole>;
  roleIndex: number;
}) {
  return (
    <div
      className="space-y-2 border-primary/20 border-l-2 pl-4"
      key={role._key ?? `role-${roleIndex}`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h4 className="font-semibold text-foreground">{role.title}</h4>
        {role.date ? (
          <span className="text-muted-foreground text-xs">{role.date}</span>
        ) : null}
      </div>
      <BulletList className="space-y-1.5" items={role.description} />
      <TagList tags={role.tags} />
    </div>
  );
}

function ExperienceSection({ experiences }: { experiences: ResumeEntry[] }) {
  return (
    <motion.section
      aria-labelledby="professional-heading"
      variants={itemVariants}
    >
      <SectionHeader sectionKey="professional" />
      <div className="relative space-y-8 pl-2">
        {experiences.map((job, index) => {
          const roles = (job?.roles ?? []).filter(
            (r): r is NonNullable<typeof r> => r !== null
          );
          return (
            <div className="group relative pl-8" key={entryKey(job, index)}>
              <div className="absolute top-1.5 left-0 size-5 rounded-full border-4 border-background bg-primary shadow-md transition-transform duration-300 group-hover:scale-125" />
              {roles.length > 0 ? (
                <div className="space-y-4">
                  <JobHeader job={job} />
                  <JobSociety society={job?.society} />
                  {roles.map((role, roleIndex) => (
                    <ExperienceRole
                      key={role._key ?? `role-${roleIndex}`}
                      role={role}
                      roleIndex={roleIndex}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <JobHeader job={job} />
                  <JobSociety className="mb-3" society={job?.society} />
                  <BulletList className="space-y-2" items={job?.description} />
                  {job?.tags?.length ? (
                    <div className="mt-3">
                      <TagList tags={job.tags} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function EntryCardsSection({
  entries,
  sectionKey,
}: {
  entries: ResumeEntry[];
  sectionKey: SectionKey;
}) {
  const t = useTranslations("web.resume");
  const reduceMotion = useReducedMotion();
  return (
    <motion.section variants={itemVariants}>
      <SectionHeader sectionKey={sectionKey} />
      <div className="grid gap-5">
        {entries.map((entry, index) => {
          const url = entry?.url ? stegaClean(entry.url) : null;
          return (
            <motion.div
              key={entryKey(entry, index)}
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{entry?.title}</h3>
                      {url ? (
                        <a
                          aria-label={t("visitWebsite", {
                            name: contentText(entry?.title) || url,
                          })}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-xs",
                          })}
                          href={url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <ExternalLinkIcon aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                    {entry?.date ? (
                      <Badge
                        className="font-bold text-[10px] uppercase tracking-wider"
                        variant="outline"
                      >
                        {entry.date}
                      </Badge>
                    ) : null}
                  </div>
                  {entry?.society ? (
                    <div className="mb-2 flex items-center gap-2 font-semibold text-primary text-sm">
                      <Building2Icon className="size-3.5" />
                      <span>{entry.society}</span>
                    </div>
                  ) : null}
                  {entry?.description?.length ? (
                    <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
                      {entry.description.filter(Boolean).join(" ")}
                    </p>
                  ) : null}
                  {entry?.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.filter(Boolean).map((tag) => (
                        <Badge
                          className="border-primary/10 bg-primary/5 text-[10px] text-primary"
                          key={tag}
                          variant="secondary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function SidebarListSection({
  entries,
  sectionKey,
}: {
  entries: ResumeEntry[];
  sectionKey: SectionKey;
}) {
  return (
    <motion.section variants={itemVariants}>
      <SectionHeader sectionKey={sectionKey} sidebar />
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            className="relative border-primary/20 border-l-2 pl-4"
            key={entryKey(entry, index)}
          >
            <h3 className="font-bold text-base">{entry?.title}</h3>
            {contentText(entry?.issuer) ? (
              <div className="mb-1 font-medium text-primary text-sm">
                {entry?.issuer}
              </div>
            ) : null}
            {entry?.date ? (
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                {entry.date}
              </div>
            ) : null}
            {entry?.location ? (
              <div className="mt-1 text-muted-foreground text-xs">
                {entry.location}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function SkillsSection({ skills }: { skills: ResumeSkill[] }) {
  const groups = skills.filter((s): s is ResumeSkill => s !== null);
  return (
    <motion.section variants={itemVariants}>
      <SectionHeader sectionKey="skills" sidebar />
      <div className="space-y-6">
        {groups.map((group, index) => (
          <div key={group._key ?? `skill-${index}`}>
            {group.type ? (
              <h3 className="mb-3 flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-primary" />
                {group.type}
              </h3>
            ) : null}
            {group.items?.length ? (
              <div className="flex flex-wrap gap-2">
                {group.items.filter(Boolean).map((skill) => (
                  <Badge
                    className="border-border bg-background text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
                    key={skill}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function renderSection(
  sectionKey: SectionKey,
  profile: NonNullable<ResumeData>
): ReactNode | null {
  switch (sectionKey) {
    case "professional": {
      const entries = filterEntries(profile.experiences);
      return entries.length ? (
        <ExperienceSection experiences={entries} />
      ) : null;
    }
    case "projects": {
      const entries = filterEntries(profile.projects);
      return entries.length ? (
        <EntryCardsSection entries={entries} sectionKey="projects" />
      ) : null;
    }
    case "publications": {
      const entries = filterEntries(profile.publications);
      return entries.length ? (
        <EntryCardsSection entries={entries} sectionKey="publications" />
      ) : null;
    }
    case "education": {
      const entries = filterEntries(profile.education);
      return entries.length ? (
        <SidebarListSection entries={entries} sectionKey="education" />
      ) : null;
    }
    case "certificates": {
      const entries = filterEntries(profile.certificates);
      return entries.length ? (
        <SidebarListSection entries={entries} sectionKey="certificates" />
      ) : null;
    }
    case "skills": {
      const skills = (profile.skills ?? []).filter(
        (s): s is ResumeSkill => s !== null
      );
      return skills.length ? <SkillsSection skills={skills} /> : null;
    }
    default:
      return null;
  }
}

interface StandardResumeProps {
  readonly locale: string;
  readonly photoUrl?: string | null;
  readonly profile: NonNullable<ResumeData>;
}

export function StandardResume({
  profile,
  locale,
  photoUrl,
}: StandardResumeProps) {
  const t = useTranslations("web.resume");
  const authoredName = contentText(profile.displayName);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const showPortrait = photoUrl && photoUrl !== failedPhotoUrl;
  const displayName = authoredName || t("placeholderName");
  const initials =
    stegaClean(authoredName)
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  const tagline = profile.headerQuote?.trim() || null;
  const contact = profile.contact;
  const showPhoto = profile.layout?.showProfilePhoto !== false;
  const email = contact?.email ? stegaClean(contact.email) : null;
  const phone = contact?.phone ? stegaClean(contact.phone) : null;
  const location = contact?.location ? stegaClean(contact.location) : null;

  const socialLinks = [
    {
      key: "homepage",
      icon: GlobeIcon,
      url: socialUrl("homepage", contact?.homepage),
    },
    {
      key: "github",
      icon: Code2Icon,
      url: socialUrl("github", contact?.github),
    },
    {
      key: "linkedin",
      icon: LinkIcon,
      url: socialUrl("linkedin", contact?.linkedin),
    },
  ].filter((s) => s.url !== null);

  const sectionOrder = (
    profile.sectionOrder?.filter(Boolean) as SectionKey[] | undefined
  )?.filter((s) => DEFAULT_SECTION_ORDER.includes(s));
  const orderedSections = sectionOrder?.length
    ? sectionOrder
    : DEFAULT_SECTION_ORDER;

  const mainSections = orderedSections.filter((s) => MAIN_SECTIONS.includes(s));
  const sidebarSections = orderedSections.filter((s) =>
    SIDEBAR_SECTIONS.includes(s)
  );

  const pdfHref = `/${locale}/resume/pdf`;

  return (
    <main className="portfolio-content site-shell content-page">
      <motion.div
        animate="visible"
        className="flex flex-col gap-10"
        initial={false}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="relative border-b pb-10" variants={itemVariants}>
          <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:text-left">
            {showPhoto ? (
              <motion.div
                className="relative shrink-0"
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="relative size-24 md:size-28">
                  <AvatarFallback
                    aria-hidden={showPortrait ? true : undefined}
                    className="bg-primary/10 font-bold text-4xl text-primary"
                  >
                    {initials}
                  </AvatarFallback>
                  {showPortrait ? (
                    <Image
                      alt={displayName}
                      className="rounded-full object-cover"
                      fetchPriority="high"
                      fill
                      loading="eager"
                      onError={() => setFailedPhotoUrl(photoUrl)}
                      sizes="(min-width: 768px) 112px, 96px"
                      src={photoUrl}
                    />
                  ) : null}
                </Avatar>
              </motion.div>
            ) : null}

            <div className="flex flex-1 flex-col gap-4">
              <div>
                <h1 className="mb-2 font-semibold text-4xl text-foreground tracking-tight md:text-5xl">
                  {displayName}
                </h1>
                {tagline ? (
                  <p className="text-muted-foreground text-xl md:text-2xl">
                    {tagline}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
                {email ? (
                  <a
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2 rounded-full bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                    )}
                    href={`mailto:${email}`}
                  >
                    <MailIcon className="size-3.5" />
                    <span>{email}</span>
                  </a>
                ) : null}
                {phone ? (
                  <a
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2 rounded-full bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                    )}
                    href={`tel:${phone}`}
                  >
                    <PhoneIcon className="size-3.5" />
                    <span>{phone}</span>
                  </a>
                ) : null}
                {location ? (
                  <span
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2 rounded-full bg-background/50 backdrop-blur-sm"
                    )}
                  >
                    <MapPinIcon className="size-3.5" />
                    <span>{location}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-[160px] flex-col gap-3">
              <a
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "w-full gap-2"
                )}
                download
                href={pdfHref}
              >
                <DownloadIcon className="size-4" />
                {t("downloadPdf")}
              </a>
              {socialLinks.length > 0 ? (
                <div className="flex justify-center gap-2">
                  {socialLinks.map(({ key, icon: Icon, url }) => (
                    <a
                      aria-label={key}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "rounded-full text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                      )}
                      href={url ?? undefined}
                      key={key}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon className="size-5" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-10 lg:col-span-2">
            {mainSections.map((sectionKey) => (
              <div key={sectionKey}>
                {renderSection(sectionKey, profile)}
                {sectionKey === mainSections.at(-1) ? null : (
                  <Separator className="mt-10 bg-border/60" />
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex h-full flex-col gap-10 lg:border-l lg:pl-10">
            {sidebarSections.map((sectionKey) => (
              <div key={sectionKey}>
                {renderSection(sectionKey, profile)}
                {sectionKey === sidebarSections.at(-1) ? null : (
                  <Separator className="mt-10 bg-border/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
