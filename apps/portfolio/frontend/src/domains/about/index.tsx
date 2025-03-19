/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@pfl-wsr/ui";
import { about } from "./data";
import { Background } from "../assets";
import RenderModel from "@/libs/ui/render-model";
import { Hat } from "../models/hat";
import { SquareArrowOutUpRight } from "lucide-react";

const About = () => {
  return (
    <section>
      <Background
        fill
        priority
        className="!fixed top-0 left-0 -z-50 h-full w-full object-cover object-center opacity-50"
        sizes="100vw"
        variant="about"
      />

      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <div className="h-3/4 w-full md:h-screen">
          <RenderModel>
            <Hat />
          </RenderModel>
        </div>

        <div className="absolute top-1/2 left-1/2 mt-[10vh] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 px-4 text-center md:mt-[15vh]">
          <h1 className="text-7xl font-bold text-accent md:text-9xl">
            {about.name}
          </h1>
          <p className="text-lg font-light text-foreground">
            Meet the wizard behind this portfolio.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-9xl grid-cols-12 gap-4 px-4 pb-24 md:gap-8 md:px-16">
        <ItemLayout
          className={
            "col-span-full row-span-2 flex-col items-start lg:col-span-8"
          }
        >
          <h2 className="w-full text-left text-xl capitalize md:text-2xl">
            {about.title}
          </h2>
          <div className="text-base font-light lg:text-lg">
            {about.description}
          </div>
        </ItemLayout>

        <ItemLayout
          className={"col-span-full text-accent md:col-span-6 lg:col-span-4"}
        >
          <p className="w-full text-left text-2xl font-semibold sm:text-5xl">
            {about.clients}{" "}
            <sub className="text-base font-semibold">clients</sub>
          </p>
        </ItemLayout>

        <ItemLayout
          className={"col-span-full text-accent md:col-span-6 lg:col-span-4"}
        >
          <p className="w-full text-left text-2xl font-semibold sm:text-5xl">
            {about.experience}
            <sub className="text-base font-semibold">years of experience</sub>
          </p>
        </ItemLayout>

        {about.referenceImages.map(({ alt, src, sizeClassName, href }) => {
          return (
            <ItemLayout
              key={src}
              className={cn("col-span-full", sizeClassName)}
              link={href}
            >
              <img
                alt={alt}
                className="h-auto w-full"
                loading="lazy"
                src={src}
              />
            </ItemLayout>
          );
        })}
      </div>
    </section>
  );
};

interface ItemLayoutProps {
  children: React.ReactNode;
  className: string;
  link?: string;
}

const ItemLayout = ({ children, className, link }: ItemLayoutProps) => {
  const child = link ? (
    <Link className="w-full" href={link} target="_blank">
      {children}

      <SquareArrowOutUpRight className="absolute top-4 right-4 text-accent" />
    </Link>
  ) : (
    children
  );
  return (
    <motion.div
      className={cn(
        "bg-control relative flex items-center justify-center space-y-8 rounded-xl p-6 sm:p-8",
        className,
      )}
      initial={{ scale: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ scale: 1 }}
    >
      {child}
    </motion.div>
  );
};

export { About };
