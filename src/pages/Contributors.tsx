import { Navbar } from "@/components/Navbar";
import { Github } from "lucide-react";

const contributors = [
  {
    name: "William Kennedy",
    github: "ardan-bkennedy",
    avatar: "https://avatars.githubusercontent.com/u/2280005?v=4",
  },
  {
    name: "Florin Pățan",
    github: "dlsniper",
    avatar: "https://avatars.githubusercontent.com/u/607868?v=4",
  },
  {
    name: "Ron Evans",
    github: "deadprogram",
    avatar: "https://avatars.githubusercontent.com/u/5520?v=4",
  },
  {
    name: "Nikola Lohinski",
    github: "NikolaLohinski",
    avatar: "https://avatars.githubusercontent.com/u/18406374?v=4",
  },
  {
    name: "Ramon Reichert",
    github: "ramon-reichert",
    avatar: "https://avatars.githubusercontent.com/u/95890275?v=4",
  },
  {
    name: "César Führ Cará",
    github: "cesarFuhr",
    avatar: "https://avatars.githubusercontent.com/u/56983005?v=4",
  },
];

const Contributors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">Contributors</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Kronk is built by these amazing people.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {contributors.map((contributor) => (
            <a
              key={contributor.github}
              href={`https://github.com/${contributor.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-border bg-card p-6 flex flex-col items-center gap-4 transition-colors hover:border-primary"
            >
              <img
                src={contributor.avatar}
                alt={contributor.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">
                  {contributor.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors mt-1">
                  <Github className="h-4 w-4" />
                  {contributor.github}
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Contributors;
