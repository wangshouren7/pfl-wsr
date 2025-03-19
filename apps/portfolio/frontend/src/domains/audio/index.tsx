"use client";
import {
  type IComponentBaseProps,
  mp,
  useLocalStorageState,
  useMemoizedFn,
} from "@pfl-wsr/ui";
import { Volume2, VolumeX } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const variants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
  },
};

const iconVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: -10 },
  animate: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, rotate: 10, transition: { duration: 0.2 } },
};

const playingPulseVariants: Variants = {
  playing: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    boxShadow: [
      "0 0 0 0 rgba(254, 254, 91, 0)",
      "0 0 0 4px rgba(254, 254, 91, 0.1)",
      "0 0 0 8px rgba(254, 254, 91, 0.05)",
      "0 0 0 12px rgba(254, 254, 91, 0.01)",
      "0 0 0 16px rgba(254, 254, 91, 0)",
    ],
    transition: {
      repeat: Infinity,
      duration: 2.5,
      ease: "easeInOut",
      boxShadow: {
        duration: 2.5,
        repeat: Infinity,
      },
    },
  },
  stopped: {
    scale: 1,
    opacity: 1,
    boxShadow: "0 0 0 0 rgba(254, 254, 91, 0)",
  },
};

export const Audio: React.FC<IComponentBaseProps> = (props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [allowAudio, setAllowAudio] = useLocalStorageState("allow-audio", {
    defaultValue: false,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const toggle = useMemoizedFn(() => {
    setAllowAudio(!isPlaying);
  });

  const changeAudio = useMemoizedFn(() => {
    if (!audioRef.current) {
      return;
    }

    if (!userInteracted) {
      return;
    }

    if (allowAudio) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  });

  useEffect(changeAudio, [allowAudio, userInteracted, changeAudio]);

  useEffect(() => {
    setIsMounted(true);

    const handler = () => {
      setUserInteracted(true);
    };

    ["click", "keydown", "touchstart"].forEach((event) =>
      document.addEventListener(event, handler),
    );

    return () => {
      ["click", "keydown", "touchstart"].forEach((event) =>
        document.removeEventListener(event, handler),
      );
    };
  }, []);

  return mp(
    props,
    <motion.div
      animate={isPlaying ? "playing" : "stopped"}
      className={`bg-control flex cursor-pointer items-center justify-center rounded-full text-foreground ${isPlaying ? "shadow-md shadow-accent/30" : ""}`}
      variants={isPlaying ? playingPulseVariants : variants}
      whileHover={{ scale: 1.1 }}
      onClick={toggle}
    >
      <audio ref={audioRef} loop>
        <source src={"/audio/birds.mp3"} type="audio/mpeg" />
        your browser does not support the audio element.
      </audio>

      <span
        className={`relative h-14 w-14 p-4 ${isPlaying ? "text-accent" : "hover:text-accent"}`}
      >
        <AnimatePresence mode="wait">
          {isPlaying && isMounted ? (
            <motion.div
              key="playing"
              animate="animate"
              className="size-full"
              exit="exit"
              initial="initial"
              variants={iconVariants}
            >
              <Volume2 className="size-full" />
            </motion.div>
          ) : (
            <motion.div
              key="muted"
              animate="animate"
              className="size-full"
              exit="exit"
              initial="initial"
              variants={iconVariants}
            >
              <VolumeX className="size-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </motion.div>,
  );
};
