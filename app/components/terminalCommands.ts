// Static command registry and command runner 

export const COMMANDS = ["help", "clear", "echo", "date", "whoami", "ls"] as const;

export type CommandName = typeof COMMANDS[number];

// Run a command and return array of output lines.
export async function runCommand(raw: string): Promise<string[]> {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  const cmd = parts[0]?.toLowerCase() ?? "";
  const args = parts.slice(1);

  switch (cmd) {
    case "":
      return [];
    case "help":
      return [
        "Available commands:",
        "  help             Show all available commands.",
        "  about            About me — who I am and what I do.",
        "  skills           List my technical skillset.",
        "  projects         Show my featured projects.",
        "  contact          Display all contact information.",
        "  resume           Download my resume.",
        "  timeline         Show education & work history.",
        "  social           Links to my social profiles.",
        "  source           Link to portfolio source code.",
        "  clear            Clear the terminal.",
        "  ls               List sections",
        "  whoami           Show user identity.",
        "  date             Show current date/time.",
        "  echo ...         Echo input text.",
        "  neofetch         Display system-style portfolio info.",
      ];
    case "clear":
        // special token handled by caller
        return ["__CLEAR__"];
    case "echo":
        return [args.join(" ")];
    case "date":
        return [new Date().toString()];
    case "whoami":
        return ["guest"];
    case "ls":
        return [
        ".",
        "├── about",
        "├── skills",
        "├── projects",
        "├── contact",
        "└── resume"
        ];

    case "about":
        return [
            "Hey, I'm Nived — an AI grad and developer living in the UK.",
            "I spend my time designing and building things that sparks my curiosity",
            "Recently I've been diving into quant finance, combining data, algorithms, and market dynamics.",
            "",
            "Fun facts:",
            "  • Tea > coffee (don't @ me)",
            "  • I daily-drive Linux.",
            "  • I enjoy photography & videography",
            "  • I read a lot — seriously, have you read 'Crime and Punishment' by Dostoevsky?",
            "",
            "Type 'skills' or 'projects' to explore more."
        ];

    case "skills":
        return [
        "Languages: Python (mother tongue 🐍), Dart, C++, Javascript",
        "Frontend: React, Next.js, Tailwind CSS",
        "Backend: Node.js, Flask, Django",
        "AI/ML: TensorFlow, PyTorch, Scikit-learn",
        "Tools: Git, Docker, WebGPU, Unreal Engine 5, Unity",
        ];

    case "projects":
        return [
        "Projects:",
        "  • Stealth Game (UE5)   – Third person stealth prototype",
        "  • Portfolio Terminal   – This interactive system",
        "   ......... {and more} coming soon! ..........",
        "Use: projects <name> for details (coming soon)"
        ];

    case "contact":
        return [
        "Contact Info:",
        "  Email: niveds9803@email.com",
        "  LinkedIn: https://linkedin.com/in/nived-s",
        "  GitHub: https://github.com/nived-s",
        "  Location: Edinburgh, United Kingdom",
        ];

    case "resume":
        return [
        "Downloading ...",
        "Resume.pdf (coming soon: downloadable link)"
        ];

    case "timeline":
        return [
        "Timeline:",
        "  2024–2025     | MSc Artificial Intelligence",
        "  2021–2023     | BCA Computer Applications",
        "  Experience with AI, Web Dev, and Game Dev projects"
        ];

    case "social":
        return [
        "Social Profiles:",
        "  GitHub: https://github.com/nived-s",
        "  LinkedIn: https://linkedin.com/in/nived-s",
        "  X/Twitter: https://twitter.com/nived__s",
        "  Instagram: https://instagram.com/ni_vedd",
        ];

    case "source":
        return [
        "Source code for this portfolio:",
        "  https://github.com/nived-s/portfolio-website"
        ];

    case "neofetch":
        return [
        "Debian GNU/Linux 13 (trixie) x86_64",
        "----------------------------",
        "Kernel: Next.js + TypeScript",
        "Desktop: React Draggable UI",
        "Uptime: 6+ years coding",
        ];
    default:
      return [`Command not found: ${cmd}. Type 'help' for available commands.`];
  }
}
