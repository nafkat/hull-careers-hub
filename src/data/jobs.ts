export type Department =
  | "Engineering"
  | "Production"
  | "Design"
  | "Operations"
  | "Quality";

export type EmploymentType = "Full-time" | "Part-time" | "Contract";

export type JobStatus = "draft" | "active" | "closed";

export type Job = {
  id: string;
  slug: string;
  title: string;
  department: Department;
  location: string;
  employmentType: EmploymentType;
  status: JobStatus;
  socialAutoPost: boolean;
  summary: string;
  description: string[];
  requirements: string[];
  createdAt: string;
};

export const departmentAccent: Record<Department, string> = {
  Engineering: "var(--primary)",
  Production: "var(--gold)",
  Design: "var(--chart-3)",
  Operations: "var(--chart-4)",
  Quality: "var(--chart-5)",
};

export const jobs: Job[] = [
  {
    id: "1",
    slug: "senior-naval-architect",
    title: "Senior Naval Architect",
    department: "Engineering",
    location: "Piraeus, Greece",
    employmentType: "Full-time",
    status: "active",
    socialAutoPost: true,
    summary:
      "Lead hull form development and structural design for our next generation of hybrid-electric coastal vessels.",
    description: [
      "As Senior Naval Architect at EUROHULL you own the hydrodynamic and structural concept of vessels from first sketch to class approval.",
      "You will work alongside production engineers on the slipway, translating CFD studies into steel that actually gets cut, welded and launched.",
    ],
    requirements: [
      "MSc in Naval Architecture or Marine Engineering",
      "7+ years designing commercial or naval steel hulls",
      "Fluency with NAPA, Rhino and CFD toolchains",
      "Experience with class societies (DNV, LR, BV)",
    ],
    createdAt: "2026-07-02",
  },
  {
    id: "2",
    slug: "certified-hull-welder",
    title: "Certified Hull Welder",
    department: "Production",
    location: "Elefsina Yard, Greece",
    employmentType: "Full-time",
    status: "active",
    socialAutoPost: true,
    summary:
      "Join the plate shop crew building sections for 90m offshore support vessels.",
    description: [
      "You will perform MIG/MAG and FCAW welding on heavy structural sections, working from isometric drawings and welding procedure specifications.",
      "Our yard runs two shifts with full PPE provision, on-site canteen and transport from Piraeus.",
    ],
    requirements: [
      "Valid EN ISO 9606-1 certification",
      "3+ years shipyard or heavy fabrication experience",
      "Comfortable working at height and in confined spaces",
      "Basic English or Greek for safety briefings",
    ],
    createdAt: "2026-07-18",
  },
  {
    id: "3",
    slug: "marine-interior-designer",
    title: "Marine Interior Designer",
    department: "Design",
    location: "Athens, Greece (Hybrid)",
    employmentType: "Contract",
    status: "active",
    socialAutoPost: false,
    summary:
      "Shape crew and guest spaces for explorer yachts where every millimetre and every kilogram counts.",
    description: [
      "You will develop interior concepts, material palettes and joinery detailing that survive salt, vibration and SOLAS fire regulations.",
      "This is a 12-month contract with a strong likelihood of extension into our refit programme.",
    ],
    requirements: [
      "Portfolio of marine, aviation or high-end residential interiors",
      "Working knowledge of IMO FTP Code materials",
      "Advanced Rhino / SolidWorks and rendering skills",
    ],
    createdAt: "2026-08-01",
  },
  {
    id: "4",
    slug: "yard-operations-coordinator",
    title: "Yard Operations Coordinator",
    department: "Operations",
    location: "Elefsina Yard, Greece",
    employmentType: "Part-time",
    status: "active",
    socialAutoPost: false,
    summary:
      "Keep dry-dock scheduling, subcontractors and material flow moving in sync across three build bays.",
    description: [
      "You are the connective tissue between project managers, the plate shop and external subcontractors.",
      "Expect daily walk-downs of the yard, live schedule updates and close work with the HSE team.",
    ],
    requirements: [
      "3+ years in industrial planning or logistics",
      "Confident with MS Project or Primavera",
      "Greek and English fluency",
    ],
    createdAt: "2026-08-11",
  },
];

export function getJobBySlug(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export const activeJobs = jobs.filter((job) => job.status === "active");
