"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { projects } from "./data";
import { Background } from "../assets";
import RenderModel from "@/libs/ui/render-model";
import { Staff } from "../models/staff";
import { groupBy } from "lodash-es";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 1.5,
    },
  },
};

const yearContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const Projects = () => {
  // Group projects by year
  const projectsByYear = groupBy(projects, (project) =>
    new Date(project.date).getFullYear(),
  );

  // Sort years in descending order
  const sortedYears = Object.keys(projectsByYear).sort(
    (a, b) => parseInt(b) - parseInt(a),
  );

  return (
    <>
      <Background
        fill
        priority
        className="!fixed top-0 left-0 -z-50 h-full w-full object-cover object-center opacity-50"
        sizes="100vw"
        variant="projects"
      />

      <div className="fixed top-16 left-1/2 -z-10 flex h-screen -translate-x-1/2 items-center justify-center lg:top-20 lg:-left-24 lg:translate-x-0">
        <RenderModel>
          <Staff />
        </RenderModel>
      </div>

      <div className="px-6 py-20 md:px-12 lg:px-32">
        <motion.div
          animate="show"
          className="mx-auto max-w-7xl"
          initial="hidden"
          variants={container}
        >
          {sortedYears.map((year) => (
            <motion.div
              key={year}
              animate="show"
              className="mb-12"
              initial="hidden"
              variants={yearContainer}
            >
              <motion.h2
                className="mb-6 border-b border-muted pb-2 text-2xl font-bold text-foreground"
                variants={item}
              >
                {year}
              </motion.h2>
              <motion.div className="grid grid-cols-1 gap-4 lg:gap-6">
                {projectsByYear[year].map((project) => (
                  <Project key={project.name} {...project} />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const ProjectLink = motion(Link);

interface IProjectLayoutProps {
  name: string;
  description: string;
  date: string;
  demoLink: string;
}

const Project = ({ name, description, demoLink }: IProjectLayoutProps) => {
  const hasLink = !!demoLink;

  const baseClasses = `
    bg-control/90 relative flex h-full transform flex-col 
    overflow-hidden rounded-lg p-5 backdrop-blur-sm transition-all duration-300
    ${hasLink ? "hover:-translate-y-1 hover:shadow-lg hover:bg-control" : "opacity-95"}
  `;

  if (!hasLink) {
    return (
      <motion.div className={baseClasses} variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-shadow text-xl font-semibold text-foreground/95">
            {name}
          </h3>
        </div>

        <p className="flex-grow text-base text-foreground/85">{description}</p>
      </motion.div>
    );
  }

  return (
    <ProjectLink
      className={baseClasses}
      href={demoLink}
      target={"_blank"}
      variants={item}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-shadow text-xl font-semibold text-foreground/95">
          {name}
        </h3>
      </div>

      <p className="flex-grow text-base text-foreground/85">{description}</p>

      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center text-sm font-medium">
          View project
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </span>
      </div>
    </ProjectLink>
  );
};

export { Projects };
