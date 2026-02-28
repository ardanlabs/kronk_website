import { Navbar } from "@/components/Navbar";
import { ExternalLink } from "lucide-react";

const sponsors = [
  {
    name: "Ardan Labs",
    logo: "/images/ardan-labs-badge.svg",
    url: "https://www.ardanlabs.com/",
    logoBg: "bg-slate-800 rounded-lg p-3",
    description:
      "Ardan Labs is a software engineering firm delivering expert training, consulting, staff augmentation, and AI implementation services. With deep technical roots in Go, Rust, and Kubernetes, Ardan Labs has helped over 1,800 companies worldwide and trained more than 50,000 engineers to build performant, production-grade systems.",
  },
  {
    name: "Prediction Guard",
    logo: "/images/prediction-guard-logo.svg",
    url: "https://predictionguard.com/",
    description:
      "Prediction Guard is a security-first AI control plane that enables organizations to deploy advanced AI solutions engineered for real-world risk. By embedding standards-aligned governance directly into the operational fabric of AI systems, Prediction Guard helps enterprises unify fragmented AI assets into a single, secure, and governed environment.",
  },
  {
    name: "The Hybrid Group",
    logo: "/images/hybrid-group-logo.png",
    url: "https://hybridgroup.com/",
    logoBg: "bg-white rounded-lg p-3",
    description:
      "The Hybrid Group is the software company that makes hardware work. Specializing in Go, IoT integration, computer vision, and embedded systems, they maintain key open source projects including TinyGo, GoCV, and Gobot. Their developers and designers help teams solve complex problems at the intersection of software and hardware.",
  },
];

const Sponsors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">Sponsors</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Kronk is made possible thanks to the generous support from these organizations.
        </p>

        <div className="space-y-12">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="rounded-lg border border-border bg-card p-8 flex flex-col md:flex-row items-center gap-8"
            >
              <a
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`h-24 w-auto object-contain${sponsor.logoBg ? ` ${sponsor.logoBg}` : ""}`}
                />
              </a>
              <div className="flex flex-col gap-3 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-foreground">
                  {sponsor.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {sponsor.description}
                </p>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium mt-1 justify-center md:justify-start"
                >
                  Visit Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sponsors;
