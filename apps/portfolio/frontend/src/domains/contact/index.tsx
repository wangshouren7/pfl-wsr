"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { toast, Toaster } from "@pfl-wsr/ui";
import emailjs from "@emailjs/browser";
import { lg } from "../logger";

interface IFormValues {
  name: string;
  email: string;
  message: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { scale: 0 },
  show: { scale: 1 },
};

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>();

  const onSubmit = (params: IFormValues) => {
    const toastId = toast.loading("Sending your message, please wait...");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    emailjs
      .send(
        serviceId!,
        templateId!,
        params as unknown as Record<string, string>,
        {
          publicKey: publicKey!,
          limitRate: {
            throttle: 5000, // you can not send more then 1 email per 5 seconds
          },
        },
      )
      .then(
        () => {
          toast.success(
            "I have received your message, I will get back to you soon!",
            {
              id: toastId,
            },
          );
        },
        (error) => {
          lg.error("FAILED...", error.text);
          toast.error(
            "There was an error sending your message, please try again later!",
            {
              id: toastId,
            },
          );
        },
      );
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center px-16">
      <Toaster richColors />

      <article className="relative flex w-full flex-col items-center justify-center space-y-16 py-8 sm:py-0">
        <div className="flex w-full flex-col items-center justify-center space-y-6 sm:w-3/4">
          <h1 className="text-center text-4xl font-semibold text-accent capitalize lg:text-6xl">
            summon the wizard
          </h1>
          <p className="text-center text-sm font-light md:text-base lg:text-lg">
            Step into the circle of enchantment and weave your words into the
            fabric of the cosmos. Whether you seek to conjure collaborations,
            unlock mysteries, or simply share tales of adventure, your messages
            are treasured scrolls within this realm. Use the form below to send
            your missives through the ethereal network, and await the whisper of
            magic in response.
          </p>
        </div>

        <motion.form
          animate="show"
          className="flex w-full max-w-md flex-col items-center justify-center space-y-4"
          initial="hidden"
          variants={container}
          onSubmit={handleSubmit(onSubmit)}
        >
          <motion.input
            placeholder="name"
            type="text"
            variants={item}
            {...register("name", {
              required: "This field is required!",
              minLength: {
                value: 3,
                message: "Name should be at least 3 characters long.",
              },
            })}
            className="bg-control w-full rounded-md p-2 text-foreground shadow-lg focus:ring-2 focus:ring-accent/50 focus:outline-none"
          />
          {errors.name && (
            <span className="inline-block self-start text-accent">
              {errors.name.message}
            </span>
          )}
          <motion.input
            placeholder="email"
            type="email"
            variants={item}
            {...register("email", { required: "This field is required!" })}
            className="bg-control w-full rounded-md p-2 text-foreground shadow-lg focus:ring-2 focus:ring-accent/50 focus:outline-none"
          />
          {errors.email && (
            <span className="inline-block self-start text-accent">
              {errors.email.message}
            </span>
          )}
          <motion.textarea
            placeholder="message"
            variants={item}
            {...register("message", {
              required: "This field is required!",
              maxLength: {
                value: 500,
                message: "Message should be less than 500 characters",
              },
              minLength: {
                value: 50,
                message: "Message should be more than 50 characters",
              },
            })}
            className="bg-control w-full rounded-md p-2 text-foreground shadow-lg focus:ring-2 focus:ring-accent/50 focus:outline-none"
          />
          {errors.message && (
            <span className="inline-block self-start text-accent">
              {errors.message.message}
            </span>
          )}

          <motion.input
            className="cursor-pointer rounded-md border border-solid border-accent/30 bg-background px-10 py-4 text-foreground capitalize shadow-lg backdrop-blur-sm hover:shadow-glass-sm focus:ring-2 focus:ring-accent/50 focus:outline-none"
            type="submit"
            value="Cast your message!"
            variants={item}
          />
        </motion.form>
      </article>
    </div>
  );
}
