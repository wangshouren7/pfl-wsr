"use client";
import { cn, type IComponentBaseProps, mp } from "@pfl-wsr/ui";
import { Home } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";

const variants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
  },
};

const MotionLink = motion(Link);

interface INavButtonProps extends IComponentBaseProps {
  label: string;
  link: string;
  icon: React.ReactNode;
  newTab: boolean;

  labelDirection?: "right" | "left" | "bottom";
}

const NavLink = (props: INavButtonProps) => {
  const { label, link, icon, newTab, labelDirection = "right" } = props;
  return mp(
    props,
    <MotionLink
      aria-label={label}
      className="bg-control flex items-center justify-center rounded-full text-foreground"
      href={link}
      prefetch={false}
      scroll={false}
      target={newTab ? "_blank" : "_self"}
      variants={variants}
      whileHover={{ scale: 1.1 }}
    >
      <span className="relative h-14 w-14 p-4 hover:text-accent">
        {icon}

        <span className="peer absolute top-0 left-0 h-full w-full bg-transparent" />

        <span
          className={cn(
            "absolute mx-2 hidden rounded-md bg-background px-2 py-1 text-center text-sm whitespace-nowrap text-foreground shadow-lg peer-hover:block",

            labelDirection === "left" && "top-1/2 right-full -translate-y-1/2",
            labelDirection === "right" && "top-1/2 left-full -translate-y-1/2",
          )}
        >
          {label}
        </span>
      </span>
    </MotionLink>,
  );
};

const HomeLink: React.FC<IComponentBaseProps> = (props) => {
  return (
    <NavLink {...props} icon={<Home />} label="Home" link="/" newTab={false} />
  );
};

export { NavLink, HomeLink };
