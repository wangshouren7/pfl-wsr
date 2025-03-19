"use client";

import { navigation } from "@/domains/navigation/data";
import { FerrisWheel } from "@/libs/ui/ferris-wheel";
import React from "react";
import { NavLink } from "./nav-link";
import { motion, type Variants } from "motion/react";
import { useScreenSize } from "@/libs/ui/use-screen-size";

const variants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
};

const Navigation: React.FC = () => {
  const { isMobile } = useScreenSize();

  return isMobile ? <MobileNavigation /> : <FerrisWheelNavigation />;
};

const MobileNavigation = () => {
  return (
    <div className="fixed flex h-screen w-screen items-center justify-between">
      <motion.div
        animate="show"
        className="flex flex-col items-center justify-center gap-4"
        initial="hidden"
        variants={variants}
      >
        {navigation.slice(0, Math.round(navigation.length / 2)).map((x) => (
          <NavLink key={x.link} {...x} />
        ))}
      </motion.div>
      <motion.div
        animate="show"
        className="flex flex-col items-center justify-center gap-4"
        initial="hidden"
        variants={variants}
      >
        {navigation.slice(Math.round(navigation.length / 2)).map((x) => (
          <NavLink key={x.link} {...x} labelDirection="left" />
        ))}
      </motion.div>
    </div>
  );
};

const FerrisWheelNavigation = () => {
  return (
    <motion.div animate="show" initial="hidden" variants={variants}>
      <FerrisWheel
        className="fixed flex h-screen w-screen items-center justify-center"
        radius={(x) => x * 0.8}
        speed={0.5}
      >
        {navigation.map((x) => (
          <NavLink key={x.link} {...x} />
        ))}
      </FerrisWheel>
    </motion.div>
  );
};

export { Navigation };
