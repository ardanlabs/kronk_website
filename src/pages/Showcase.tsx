import { useState } from "react";
import { ExternalLink, Github, Play, Rocket } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageMeta } from "@/components/PageMeta";

type ShowcaseProject = {
  name: string;
  creator: string;
  description: string;
  kronkUse: string;
  tags: string[];
  media:
    | { type: "image"; src: string; alt: string }
    | { type: "youtube"; videoId: string; title: string };
  links: { label: string; url: string; type: "github" | "website" | "video" }[];
};

const projects: ShowcaseProject[] = [
  {
    name: "LocalLens",
    creator: "Ramon Reichert",
    description:
      "An offline semantic image search application that lets you find images on your computer using natural-language queries—without sending your images or prompts to a cloud service.",
    kronkUse:
      "LocalLens uses Kronk for its complete local AI pipeline: describing images with a vision model, turning descriptions into focused search phrases, and generating embeddings for similarity search.",
    tags: ["Image Search", "Vision", "Embeddings", "Open Source"],
    media: {
      type: "image",
      src: "https://raw.githubusercontent.com/ramon-reichert/locallens/main/assets/search_images.gif",
      alt: "LocalLens searching a local image collection with natural language",
    },
    links: [
      {
        label: "View on GitHub",
        url: "https://github.com/ramon-reichert/locallens",
        type: "github",
      },
    ],
  },
  {
    name: "FyshOS",
    creator: "Andy Williams and the FyshOS community",
    description:
      "A lightweight, open-source Linux operating system and desktop environment built with Go and powered by the Fyne GUI toolkit.",
    kronkUse:
      "Kronk brings hardware-accelerated local AI into the desktop. In this video, Fyne founder Andy Williams demonstrates the integration and the experiences it enables inside FyshOS.",
    tags: ["Desktop", "Operating System", "Fyne", "Local AI"],
    media: {
      type: "youtube",
      videoId: "9SlrJ0iyCfA",
      title: "Integrating AI into the desktop",
    },
    links: [
      {
        label: "Visit FyshOS",
        url: "https://fyshos.com/",
        type: "website",
      },
      {
        label: "Watch on YouTube",
        url: "https://youtu.be/9SlrJ0iyCfA",
        type: "video",
      },
      {
        label: "Explore Fyne",
        url: "https://fyne.io/",
        type: "website",
      },
    ],
  },
];

function ProjectMedia({ project }: { project: ShowcaseProject }) {
  const [playing, setPlaying] = useState(false);

  if (project.media.type === "image") {
    return (
      <img
        src={project.media.src}
        alt={project.media.alt}
        className="aspect-video h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${project.media.videoId}?autoplay=1`}
        title={project.media.title}
        className="aspect-video h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video h-full w-full overflow-hidden text-left"
      aria-label={`Play ${project.media.title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${project.media.videoId}/maxresdefault.jpg`}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform group-hover:scale-110">
          <Play className="ml-1 h-7 w-7 fill-current" />
        </span>
      </span>
      <span className="absolute bottom-4 left-4 rounded-md bg-black/75 px-3 py-1.5 text-sm font-medium text-white">
        {project.media.title}
      </span>
    </button>
  );
}

const linkIcon = (type: ShowcaseProject["links"][number]["type"]) => {
  if (type === "github") return <Github className="h-4 w-4" />;
  if (type === "video") return <Play className="h-4 w-4" />;
  return <ExternalLink className="h-4 w-4" />;
};

const Showcase = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Built with Kronk — Project Showcase"
        description="Explore open-source applications, desktop integrations, and other projects powered by Kronk."
        path="/showcase"
      />
      <Navbar />

      <main className="container mx-auto px-6 pb-20 pt-28">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-sm text-primary">
            <Rocket className="h-4 w-4" />
            Community showcase
          </div>
          <h1 className="mb-5 text-4xl font-black tracking-tight sm:text-5xl">
            Built with <span className="text-gradient-primary">Kronk</span>
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            See how developers are bringing private, hardware-accelerated AI into
            applications, developer tools, and entire desktop environments.
          </p>
        </header>

        <div className="mx-auto max-w-6xl space-y-10">
          {projects.map((project, index) => (
            <article
              key={project.name}
              className="grid overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-2"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                <ProjectMedia project={project} />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="mb-2 font-mono text-sm text-primary">By {project.creator}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground">{project.name}</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <p className="mb-6 leading-relaxed text-foreground/90">{project.kronkUse}</p>

                <div className="mb-7 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {project.links.map((link, linkIndex) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        linkIndex === 0
                          ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          : "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      }
                    >
                      {linkIcon(link.type)}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-14 max-w-4xl rounded-xl border border-primary/20 bg-primary/5 px-6 py-10 text-center sm:px-10">
          <h2 className="mb-3 text-2xl font-bold">Building something with Kronk?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            We would love to see what you are creating and feature more community
            projects here.
          </p>
          <a
            href="https://github.com/ardanlabs/kronk/issues/new?title=Showcase%20project%3A%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Github className="h-4 w-4" />
            Share your project
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Showcase;
