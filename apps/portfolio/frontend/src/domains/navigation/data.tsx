import {
  Home,
  Palette,
  Phone,
  User,
  Linkedin,
  NotebookText,
  Github,
  Twitter,
} from "lucide-react";

export const navigation = [
  {
    label: "Home",
    link: "/",
    newTab: false,
    icon: <Home className="size-full" />,
  },
  {
    label: "About",
    link: "/about",
    icon: <User className="size-full" />,
    newTab: false,
  },
  {
    label: "Projects",
    link: "/projects",
    icon: <Palette className="size-full" />,
    newTab: false,
  },
  {
    label: "Contact",
    link: "/contact",
    icon: <Phone className="size-full" />,
    newTab: false,
  },
  {
    label: "Github",
    link: "https://github.com/wangshouren7?tab=repositories",
    icon: <Github className="size-full" />,
    newTab: true,
  },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/wang-shouren-a3034429a/",
    newTab: true,
    icon: <Linkedin className="size-full" />,
  },
  {
    label: "X",
    link: "https://x.com/wangshouren111",
    newTab: true,
    icon: <Twitter className="size-full" />,
  },
  {
    label: "Resume",
    link: "/resume.pdf",
    icon: <NotebookText className="size-full" />,
    newTab: true,
  },
];
