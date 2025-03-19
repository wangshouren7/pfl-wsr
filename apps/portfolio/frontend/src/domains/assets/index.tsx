import Image, { type ImageProps } from "next/image";

const backgrounds = {
  about: {
    url: "/background/about.png",
    alt: "about",
  },
  home: {
    url: "/background/home.png",
    alt: "home",
  },
  projects: {
    url: "/background/projects.png",
    alt: "projects",
  },
  contact: {
    url: "/background/contact.png",
    alt: "contact",
  },
};

export const Background = ({
  variant,
  ...props
}: Omit<ImageProps, "src" | "alt"> & { variant: keyof typeof backgrounds }) => (
  <Image
    {...props}
    alt={backgrounds[variant].alt}
    src={backgrounds[variant].url}
  />
);
