"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, RefreshCw, Send, Trash2, Upload, X } from "lucide-react";
import { getCsrf } from "@/components/admin/csrf";
import { notifyCmsUpdated } from "@/components/admin/cms-updated";

type Item = Record<string, unknown> & { id: string };
type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "lines"
  | "pairs"
  | "counters"
  | "select"
  | "image"
  | "images";
type SelectOption = string | { value: string; label: string };
type Field = {
  path: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: SelectOption[];
};
type ResourceDefinition = {
  description: string;
  fields: Field[];
  sample: Record<string, unknown>;
  readOnly?: boolean;
};

const definitions: Record<string, ResourceDefinition> = {
  settings: {
    description: "Edit public website settings without touching code.",
    fields: [
      { path: "key", label: "Setting key", required: true },
      { path: "value", label: "Value", required: true },
      { path: "group", label: "Group", placeholder: "general" },
    ],
    sample: { key: "site_name", value: "IT LAB BD", group: "general" },
  },
  menus: {
    description:
      "Manage header links and dropdown items. Parent ID is optional.",
    fields: [
      { path: "label", label: "Menu label", required: true },
      { path: "href", label: "Link URL", required: true },
      {
        path: "parentId",
        label: "Parent menu ID",
        help: "Leave empty for a top-level item. Copy the ID from the parent menu card for a dropdown item.",
      },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "enabled", label: "Enabled", type: "checkbox" },
    ],
    sample: {
      label: "Menu item",
      href: "/",
      parentId: null,
      sortOrder: 10,
      enabled: true,
    },
  },
  pages: {
    description: "Create or edit public pages with readable content fields.",
    fields: [
      { path: "slug", label: "Slug", required: true, placeholder: "new-page" },
      { path: "title", label: "Page title", required: true },
      { path: "excerpt", label: "Short description" },
      { path: "content.heroTitle", label: "Hero title" },
      {
        path: "content.heroDescription",
        label: "Hero description",
        type: "textarea",
      },
      { path: "content.imageUrl", label: "Main image", type: "image" },
      { path: "content.body", label: "Page body", type: "textarea" },
      {
        path: "content.companyHistory",
        label: "Company history",
        type: "textarea",
      },
      { path: "content.mission", label: "Mission", type: "textarea" },
      {
        path: "content.introduction",
        label: "Team introduction",
        type: "textarea",
      },
      { path: "content.formHeadline", label: "Contact form headline" },
      {
        path: "content.coreValues",
        label: "Core values",
        type: "pairs",
        help: "One value per line: Title | Description",
      },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      slug: "new-page",
      title: "New Page",
      excerpt: "Page summary",
      content: {
        heroTitle: "Page title",
        heroDescription: "Page description",
        body: "Page content",
      },
      published: true,
    },
  },
  "homepage-sections": {
    description:
      "Use the dedicated Home Page menu for the easiest section-by-section editing experience.",
    fields: [
      {
        path: "type",
        label: "Section type",
        required: true,
        options: [
          "HERO",
          "ABOUT",
          "COUNTERS",
          "SERVICES",
          "PLATFORMS",
          "WHAT_WE_DO",
          "PORTFOLIO",
          "TESTIMONIALS",
          "TRUSTED_COMPANIES",
          "CONTACT",
        ],
        type: "select",
      },
      { path: "title", label: "Admin label", required: true },
      { path: "content.headline", label: "Headline" },
      {
        path: "content.counters",
        label: "Counters",
        type: "counters",
        help: "One counter per line: Label | Number",
      },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "enabled", label: "Enabled", type: "checkbox" },
    ],
    sample: {
      type: "HERO",
      title: "Hero Section",
      enabled: true,
      sortOrder: 10,
      content: { headline: "Grow Your Business More Efficiently" },
    },
  },
  services: {
    description: "Manage service cards and individual dynamic service pages.",
    fields: [
      {
        path: "slug",
        label: "Slug",
        required: true,
        placeholder: "business-website",
      },
      { path: "title", label: "Service title", required: true },
      {
        path: "excerpt",
        label: "Short description",
        type: "textarea",
        required: true,
      },
      {
        path: "icon",
        label: "Fallback icon name",
        help: "Used when no custom icon image is uploaded. Examples: Briefcase, Building2, Code2, Newspaper, Search, Server, ShoppingBag",
      },
      {
        path: "content.iconImage",
        label: "Custom icon image (PNG, JPG or WebP)",
        type: "image",
        help: "Optional. This uploaded image replaces the Lucide icon area on the frontend.",
      },
      {
        path: "content.cardImage",
        label: "Card image (optional)",
        type: "image",
        help: "Optional larger image shown above the homepage service card.",
      },
      { path: "content.buttonLabel", label: "View More button label" },
      {
        path: "content.buttonUrl",
        label: "View More button URL",
        help: "Example: /services/business-website",
      },
      { path: "content.heroImage", label: "Hero image", type: "image" },
      { path: "content.intro", label: "Introduction", type: "textarea" },
      {
        path: "content.details",
        label: "Detailed description",
        type: "textarea",
      },
      {
        path: "content.additionalImages",
        label: "Additional images",
        type: "images",
        help: "Upload one or more supporting images. Each uploaded image is stored automatically and previewed below.",
      },
      {
        path: "content.highlights",
        label: "Highlights",
        type: "lines",
        help: "One benefit per line.",
      },
      {
        path: "content.layout",
        label: "Page layout",
        type: "select",
        options: ["standard", "reverse", "spotlight"],
      },
      { path: "content.ctaLabel", label: "Detail page CTA label" },
      { path: "content.ctaUrl", label: "Detail page CTA URL" },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      slug: "new-service",
      title: "New Service",
      excerpt: "Service description",
      icon: "Code2",
      content: {
        heroImage: "/images/portfolio-1.png",
        intro: "Intro text",
        details: "More details",
        additionalImages: ["/images/about-1.png", "/images/about-2.png"],
        highlights: ["Benefit one", "Benefit two"],
        layout: "standard",
      },
      sortOrder: 10,
      published: true,
    },
  },
  "team-members": {
    description: "Manage team cards displayed on the Our Team page.",
    fields: [
      { path: "slug", label: "Slug", required: true },
      { path: "name", label: "Name", required: true },
      { path: "role", label: "Role", required: true },
      { path: "bio", label: "Short profile", type: "textarea" },
      {
        path: "imageUrl",
        label: "Profile image",
        type: "image",
        required: true,
      },
      {
        path: "skills",
        label: "Skills",
        type: "lines",
        help: "One skill per line.",
      },
      { path: "experience", label: "Experience summary", type: "textarea" },
      { path: "email", label: "Email" },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      slug: "new-member",
      name: "Team Member",
      role: "Role",
      bio: "Short profile",
      imageUrl: "/images/team-1.svg",
      skills: ["Skill one", "Skill two"],
      experience: "Experience summary",
      published: true,
      sortOrder: 10,
    },
  },
  portfolios: {
    description:
      "Manage clickable portfolio cards and their individual case-study pages.",
    fields: [
      { path: "slug", label: "Slug", required: true },
      { path: "title", label: "Project title", required: true },
      { path: "excerpt", label: "Short description", type: "textarea" },
      { path: "imageUrl", label: "Main image", type: "image", required: true },
      {
        path: "screenshots",
        label: "Project screenshots",
        type: "images",
        help: "Upload one or more screenshots. Each uploaded image is stored as a URL automatically.",
      },
      {
        path: "technologies",
        label: "Technologies",
        type: "lines",
        help: "One technology per line.",
      },
      { path: "liveUrl", label: "Live website URL" },
      { path: "buttonLabel", label: "Homepage button label" },
      {
        path: "buttonUrl",
        label: "Homepage button URL",
        help: "Leave empty to use the internal case-study page.",
      },
      { path: "caseStudy.challenge", label: "Challenge", type: "textarea" },
      { path: "caseStudy.solution", label: "Solution", type: "textarea" },
      { path: "caseStudy.result", label: "Result", type: "textarea" },
      {
        path: "categoryId",
        label: "Portfolio category",
        type: "select",
        help: "Choose the category that this portfolio project belongs to.",
      },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      slug: "new-project",
      title: "New Project",
      excerpt: "Project summary",
      imageUrl: "/images/portfolio-1.png",
      screenshots: ["/images/portfolio-1.png"],
      technologies: ["Next.js"],
      caseStudy: {
        challenge: "Challenge",
        solution: "Solution",
        result: "Result",
      },
      published: true,
      sortOrder: 10,
    },
  },
  "portfolio-categories": {
    description: "Categories used to filter projects.",
    fields: [
      { path: "name", label: "Category name", required: true },
      { path: "slug", label: "Slug", required: true },
    ],
    sample: { name: "Corporate", slug: "corporate" },
  },
  demos: {
    description: "Manage demo cards displayed on the Demo page.",
    fields: [
      { path: "slug", label: "Slug", required: true },
      { path: "title", label: "Demo title", required: true },
      { path: "imageUrl", label: "Demo image", type: "image", required: true },
      { path: "previewUrl", label: "Preview URL" },
      { path: "liveUrl", label: "Live demo URL" },
      {
        path: "categoryId",
        label: "Demo category",
        type: "select",
        help: "Choose the category that this live demo belongs to.",
      },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      slug: "new-demo",
      title: "New Demo",
      imageUrl: "/images/portfolio-1.png",
      previewUrl: "#",
      liveUrl: "#",
      published: true,
      sortOrder: 10,
    },
  },
  "demo-categories": {
    description: "Categories used to filter demos.",
    fields: [
      { path: "name", label: "Category name", required: true },
      { path: "slug", label: "Slug", required: true },
    ],
    sample: { name: "Business Websites", slug: "business-websites" },
  },
  testimonials: {
    description:
      "Manage the complete client review cards displayed on the homepage.",
    fields: [
      { path: "brand", label: "Brand or source", required: true },
      { path: "brandImageUrl", label: "Brand logo (optional)", type: "image" },
      { path: "quote", label: "Review", type: "textarea", required: true },
      { path: "author", label: "Client name", required: true },
      { path: "position", label: "Client position or title" },
      { path: "clientImageUrl", label: "Client image", type: "image" },
      { path: "rating", label: "Rating", type: "number" },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      brand: "Client Review",
      brandImageUrl: null,
      quote: "Client feedback",
      author: "Client Name",
      position: "Business Owner",
      clientImageUrl: "/placeholder-user.jpg",
      rating: 5,
      published: true,
      sortOrder: 10,
    },
  },
  logos: {
    description: "Manage logos used by the dual trusted-company marquees.",
    fields: [
      { path: "name", label: "Company name", required: true },
      { path: "imageUrl", label: "Logo image", type: "image" },
      { path: "website", label: "Website URL" },
      { path: "sortOrder", label: "Sort order", type: "number" },
      { path: "published", label: "Published", type: "checkbox" },
    ],
    sample: {
      name: "Company",
      imageUrl: null,
      website: null,
      published: true,
      sortOrder: 10,
    },
  },
  leads: {
    description: "Review contact form enquiries and update their status.",
    fields: [
      { path: "name", label: "Name" },
      { path: "company", label: "Company" },
      { path: "phone", label: "Phone" },
      { path: "email", label: "Email" },
      { path: "message", label: "Message", type: "textarea" },
      {
        path: "status",
        label: "Lead status",
        type: "select",
        options: ["NEW", "IN_PROGRESS", "CLOSED", "SPAM"],
      },
    ],
    sample: {},
    readOnly: false,
  },
  seo: {
    description:
      "Manage per-route title, meta description and indexing settings.",
    fields: [
      {
        path: "route",
        label: "Route",
        required: true,
        placeholder: "/about-us",
      },
      { path: "title", label: "SEO title", required: true },
      {
        path: "description",
        label: "Meta description",
        type: "textarea",
        required: true,
      },
      { path: "keywords", label: "Keywords" },
      { path: "ogImage", label: "Open Graph image", type: "image" },
      { path: "noIndex", label: "Prevent indexing", type: "checkbox" },
    ],
    sample: {
      route: "/",
      title: "IT Lab BD",
      description: "SEO description",
      noIndex: false,
    },
  },
  media: {
    description:
      "Upload images and reuse their optimized WebP URLs inside CMS forms.",
    fields: [],
    sample: {},
    readOnly: true,
  },
  "activity-logs": {
    description:
      "Read-only audit trail for logins, CMS changes, media uploads, cache actions and backups.",
    fields: [],
    sample: {},
    readOnly: true,
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
function getAt(value: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === "object" && !Array.isArray(current)
          ? (current as Record<string, unknown>)[key]
          : undefined,
      value,
    );
}
function setAt(value: Record<string, unknown>, path: string, next: unknown) {
  const draft = clone(value);
  const parts = path.split(".");
  let cursor: Record<string, unknown> = draft;
  parts.forEach((key, index) => {
    if (index === parts.length - 1) cursor[key] = next;
    else {
      const current = cursor[key];
      if (!current || typeof current !== "object" || Array.isArray(current))
        cursor[key] = {};
      cursor = cursor[key] as Record<string, unknown>;
    }
  });
  return draft;
}
function textValue(field: Field, value: unknown) {
  if (field.type === "lines")
    return Array.isArray(value) ? value.map(String).join("\n") : "";
  if (field.type === "pairs")
    return Array.isArray(value)
      ? value
          .map((row: any) => `${row.title || ""} | ${row.text || ""}`)
          .join("\n")
      : "";
  if (field.type === "counters")
    return Array.isArray(value)
      ? value
          .map((row: any) => `${row.label || ""} | ${row.value ?? 0}`)
          .join("\n")
      : "";
  return value === null || value === undefined ? "" : String(value);
}
function parsedValue(field: Field, raw: string | boolean) {
  if (field.type === "checkbox") return Boolean(raw);
  const value = String(raw);
  if (field.type === "number") return Number(value || 0);
  if (field.type === "lines" || field.type === "images")
    return value.split(/\r?\n/);
  if (field.type === "pairs")
    return value
      .split("\n")
      .map((line) => {
        const [title, ...rest] = line.split("|");
        return { title: title.trim(), text: rest.join("|").trim() };
      })
      .filter((item) => item.title);
  if (field.type === "counters")
    return value
      .split("\n")
      .map((line) => {
        const [label, count] = line.split("|");
        return { label: label.trim(), value: Number(count?.trim() || 0) };
      })
      .filter((item) => item.label);
  return value === "" ? null : value;
}

function normalizeBeforeSave(value: Record<string, unknown>, fields: Field[]) {
  let draft = clone(value);
  for (const field of fields) {
    if (field.type === "lines" || field.type === "images") {
      const current = getAt(draft, field.path);
      if (Array.isArray(current)) {
        draft = setAt(
          draft,
          field.path,
          current.map((line) => String(line).trim()).filter(Boolean),
        );
      }
    }
  }
  return draft;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function itemTitle(item: Item) {
  return String(
    item.title ||
      item.action ||
      item.name ||
      item.key ||
      item.route ||
      item.label ||
      item.brand ||
      item.slug ||
      item.id,
  );
}
function itemDetails(item: Item) {
  return [
    item.slug,
    item.href,
    item.email,
    item.phone,
    item.status,
    isRecord(item.category) ? item.category.name : null,
    item.type,
    item.resource,
    item.username,
    item.createdAt,
  ]
    .filter(Boolean)
    .map(String)
    .join(" · ");
}
function relationOptions(items: Item[], emptyLabel: string, emptyStateLabel: string): SelectOption[] {
  if (!items.length) return [{ value: "", label: emptyStateLabel }];
  return [
    { value: "", label: emptyLabel },
    ...items.map((item) => ({
      value: item.id,
      label: `${String(item.name || item.title || item.slug || item.id)}${item.slug ? ` (${String(item.slug)})` : ""}`,
    })),
  ];
}

export function ResourceManager({
  resource,
  label,
}: {
  resource: string;
  label: string;
}) {
  const router = useRouter();
  const definition = definitions[resource] || {
    description: "Manage CMS records.",
    fields: [],
    sample: {},
  };
  const [items, setItems] = useState<Item[]>([]);
  const [portfolioCategories, setPortfolioCategories] = useState<Item[]>([]);
  const [demoCategories, setDemoCategories] = useState<Item[]>([]);
  const [relationMessage, setRelationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(
    clone(definition.sample),
  );
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Item | null>(null);
  const canAdd =
    !definition.readOnly &&
    !["leads", "media", "homepage-sections"].includes(resource);
  const editorFields = useMemo(
    () =>
      definition.fields.map((field) => {
        if (resource === "portfolios" && field.path === "categoryId") {
          return {
            ...field,
            type: "select" as FieldType,
            options: relationOptions(
              portfolioCategories,
              "Uncategorized / No category",
              "No portfolio categories loaded yet",
            ),
          };
        }
        if (resource === "demos" && field.path === "categoryId") {
          return {
            ...field,
            type: "select" as FieldType,
            options: relationOptions(
              demoCategories,
              "Uncategorized / No category",
              "No demo categories loaded yet",
            ),
          };
        }
        return field;
      }),
    [definition.fields, resource, portfolioCategories, demoCategories],
  );

  async function reload() {
    setLoading(true);
    const response = await fetch(`/api/admin/${resource}`, {
      cache: "no-store",
    });
    const json = await response.json().catch(() => ({}));
    setItems(json.items || []);
    setLoading(false);
  }
  useEffect(() => {
    reload();
  }, [resource]);
  async function fetchRelationItems(path: string) {
    const response = await fetch(path, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(json.error || `Unable to load ${path}`));
    return Array.isArray(json.items) ? (json.items as Item[]) : [];
  }
  async function loadCategoryOptions() {
    try {
      setRelationMessage("");
      if (resource === "portfolios") {
        const items = await fetchRelationItems("/api/admin/portfolio-categories");
        setPortfolioCategories(items);
        if (!items.length)
          setRelationMessage("No portfolio categories found. Create at least one category in Portfolio Categories, then refresh this page.");
      }
      if (resource === "demos") {
        const items = await fetchRelationItems("/api/admin/demo-categories");
        setDemoCategories(items);
        if (!items.length)
          setRelationMessage("No demo categories found. Create at least one category in Demo Categories, then refresh this page.");
      }
    } catch (error) {
      setRelationMessage(error instanceof Error ? error.message : "Unable to load categories.");
      if (resource === "portfolios") setPortfolioCategories([]);
      if (resource === "demos") setDemoCategories([]);
    }
  }
  useEffect(() => {
    void loadCategoryOptions();
  }, [resource]);
  useEffect(() => {
    setDraft(clone(definition.sample));
  }, [resource]);
  function begin(item?: Item) {
    void loadCategoryOptions();
    setModalOpen(true);
    setEditing(item || null);
    setDraft(
      clone(
        item
          ? Object.fromEntries(
              Object.entries(item).filter(
                ([key]) => !["id", "createdAt", "updatedAt"].includes(key),
              ),
            )
          : definition.sample,
      ),
    );
    setMessage("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      const csrf = await getCsrf();
      const url = editing
        ? `/api/admin/${resource}/${editing.id}`
        : `/api/admin/${resource}`;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify(normalizeBeforeSave(draft, editorFields)),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Unable to save");
      setModalOpen(false);
      setEditing(null);
      setDraft(clone(definition.sample));
      notifyCmsUpdated();
      router.refresh();
      setMessage(
        "Saved successfully. Database committed and frontend cache invalidated immediately.",
      );
      reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save");
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const csrf = await getCsrf();
    const response = await fetch(`/api/admin/${resource}/${id}`, {
      method: "DELETE",
      headers: { "x-csrf-token": csrf },
    });
    if (!response.ok) return setMessage("Unable to delete this item.");
    notifyCmsUpdated();
    router.refresh();
    setMessage("Deleted successfully. Frontend cache invalidated immediately.");
    reload();
  }
  async function sendReply(subject: string, messageText: string) {
    if (!replyTarget) return;
    const csrf = await getCsrf();
    const response = await fetch(`/api/admin/leads/${replyTarget.id}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ subject, message: messageText }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || "Unable to send reply");
    setReplyTarget(null);
    setMessage("Reply sent successfully.");
    reload();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
            CMS Resource
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold">{label}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {definition.description}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => reload()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          {canAdd && (
            <button
              onClick={() => begin()}
              className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            >
              <Plus className="size-4" />
              Add item
            </button>
          )}
        </div>
      </div>
      {resource === "media" && <MediaUpload onUploaded={reload} />}
      {message && (
        <p className="mt-4 text-sm font-semibold text-blue-700">{message}</p>
      )}
      {relationMessage && (resource === "portfolios" || resource === "demos") && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {relationMessage}
        </p>
      )}
      <div className="mt-7 grid gap-3">
        {loading ? (
                <p className="text-muted-foreground">Loading...</p>
        ) : items.length ? (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    {itemTitle(item)}
                  </h2>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {itemDetails(item) || `ID: ${item.id}`}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">ID: {item.id}</p>
                </div>
                <div className="flex gap-2">
                  {resource === "leads" && Boolean(item.email) && (
                    <button
                      onClick={() => setReplyTarget(item)}
                      aria-label="Reply by email"
                      className="cursor-pointer rounded-lg border border-emerald-100 p-2 text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <Send className="size-4" />
                    </button>
                  )}
                  {!definition.readOnly && resource !== "media" && (
                    <button
                      onClick={() => begin(item)}
                      aria-label="Edit"
                      className="cursor-pointer rounded-lg border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50"
                    >
                      <Pencil className="size-4" />
                    </button>
                  )}
                  {!definition.readOnly && resource !== "leads" && (
                    <button
                      onClick={() => remove(item.id)}
                      aria-label="Delete"
                      className="cursor-pointer rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-muted-foreground">
            No items yet.
          </p>
        )}
      </div>
      {modalOpen && resource !== "media" ? (
        <Editor
          fields={editorFields}
          draft={draft}
          setDraft={setDraft}
          editing={!!editing}
          save={save}
          close={() => {
            setModalOpen(false);
            setEditing(null);
            setDraft(clone(definition.sample));
          }}
        />
      ) : null}
      {replyTarget ? (
        <ReplyModal
          lead={replyTarget}
          close={() => setReplyTarget(null)}
          send={sendReply}
        />
      ) : null}
    </div>
  );
}

function Editor({
  fields,
  draft,
  setDraft,
  editing,
  save,
  close,
}: {
  fields: Field[];
  draft: Record<string, unknown>;
  setDraft: (v: Record<string, unknown>) => void;
  editing: boolean;
  save: (e: FormEvent) => void;
  close: () => void;
}) {
  const rows = useMemo(() => fields, [fields]);
  async function upload(path: string, file?: File) {
    if (!file) return;
    const csrf = await getCsrf();
    const form = new FormData();
    form.append("file", file);
    form.append("altText", path);
    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      headers: { "x-csrf-token": csrf },
      body: form,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(json.error || "Upload failed");
      return;
    }
    const url = json.item?.url || json.media?.url || json.url;
    if (typeof url === "string" && url) {
      setDraft(setAt(draft, path, url));
      return url;
    }
    alert("Upload completed, but no file URL was returned.");
  }
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4">
      <form
        onSubmit={save}
        className="cms-scroll max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold">
              {editing ? "Edit item" : "Add item"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete the fields below. No JSON editing is required.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close modal"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {rows.map((field) => (
            <FieldControl
              key={field.path}
              field={field}
              value={getAt(draft, field.path)}
              change={(next) => setDraft(setAt(draft, field.path, next))}
              upload={upload}
            />
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button className="brand-button cursor-pointer rounded-xl px-4 py-2 text-sm font-bold text-white">
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldControl({
  field,
  value,
  change,
  upload,
}: {
  field: Field;
  value: unknown;
  change: (value: unknown) => void;
  upload: (path: string, file?: File) => Promise<string | undefined>;
}) {
  const wide = ["textarea", "lines", "pairs", "counters", "image", "images"].includes(
    field.type || "text",
  );
  if (field.type === "checkbox")
    return (
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => change(event.target.checked)}
          className="size-4"
        />
        {field.label}
      </label>
    );
  const common =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-400/20 transition focus:border-blue-300 focus:ring-2";
  return (
    <label
      className={`grid gap-2 text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}
    >
      <span>{field.label}</span>
      {field.type === "textarea" ||
      field.type === "lines" ||
      field.type === "pairs" ||
      field.type === "counters" ? (
        <textarea
          rows={field.type === "textarea" ? 5 : 4}
          value={textValue(field, value)}
          onChange={(event) => change(parsedValue(field, event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.stopPropagation();
          }}
          placeholder={field.placeholder}
          className={common}
        />
      ) : field.type === "images" ? (
        <MultiImageUpload
          field={field}
          value={value}
          change={change}
          upload={upload}
          className={common}
        />
      ) : field.type === "select" ? (
        <select
          value={textValue(field, value)}
          onChange={(event) => change(parsedValue(field, event.target.value))}
          className={common}
        >
          {(field.options || []).map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;
            const optionLabel =
              typeof option === "string" ? option : option.label;
            return (
              <option key={optionValue || "empty-option"} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            required={field.required}
            type={field.type === "number" ? "number" : "text"}
            value={textValue(field, value)}
            onChange={(event) => change(parsedValue(field, event.target.value))}
            placeholder={field.placeholder}
            className={common}
          />
          {field.type === "image" && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
              <Upload className="size-4" />
              Upload
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  upload(field.path, event.target.files?.[0])
                }
              />
            </label>
          )}
        </div>
      )}
      {field.help && (
        <span className="text-xs font-normal leading-5 text-muted-foreground">
          {field.help}
        </span>
      )}
    </label>
  );
}


function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function MultiImageUpload({
  field,
  value,
  change,
  upload,
  className,
}: {
  field: Field;
  value: unknown;
  change: (value: unknown) => void;
  upload: (path: string, file?: File) => Promise<string | undefined>;
  className: string;
}) {
  const images = arrayValue(value);
  const [uploading, setUploading] = useState(false);

  async function add(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await upload(field.path, file);
      if (url) change([...images, url]);
    } finally {
      setUploading(false);
    }
  }

  function update(index: number, next: string) {
    const copy = [...images];
    copy[index] = next;
    change(copy);
  }

  function remove(index: number) {
    change(images.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="grid gap-3">
      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${field.label} ${index + 1}`}
                  className="h-36 w-full object-cover"
                />
              </div>
              <input
                value={src}
                onChange={(event) => update(index, event.target.value)}
                className={`${className} mt-3`}
                placeholder="Uploaded image URL"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 cursor-pointer rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                Remove screenshot
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-normal text-muted-foreground">
          No screenshots uploaded yet. Click Add Screenshot to upload the first image.
        </p>
      )}
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
        <Upload className="size-4" />
        {uploading ? "Uploading..." : "Add Screenshot"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            void add(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}

function MediaUpload({ onUploaded }: { onUploaded: () => void }) {
  const [message, setMessage] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const csrf = await getCsrf();
    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      headers: { "x-csrf-token": csrf },
      body: new FormData(form),
    });
    const json = await response.json().catch(() => ({}));
    setMessage(
      response.ok
        ? "Image uploaded successfully."
        : json.error || "Upload failed",
    );
    if (response.ok) {
      form.reset();
      onUploaded();
    }
  }
  return (
    <form
      onSubmit={upload}
      className="mt-7 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <label className="grid gap-2 text-sm font-semibold">
        Image
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="text-sm"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Alt text
        <input
          name="altText"
          className="rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>
      <button className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white">
        <Upload className="size-4" />
        Upload
      </button>
      {message && <p className="w-full text-sm text-blue-700">{message}</p>}
    </form>
  );
}

function ReplyModal({
  lead,
  close,
  send,
}: {
  lead: Item;
  close: () => void;
  send: (subject: string, message: string) => Promise<void>;
}) {
  const [subject, setSubject] = useState(`Reply from IT Lab BD`);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await send(subject, message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send reply");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/70 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold">
              Reply to {String(lead.name || "lead")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send an email to {String(lead.email || "")}. The action will be
              recorded in Activity Logs.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close reply modal"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>
        <label className="mt-6 grid gap-2 text-sm font-semibold">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-semibold">
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.stopPropagation();
            }}
            minLength={10}
            required
            rows={8}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            <Send className="size-4" />
            {loading ? "Sending..." : "Send reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
