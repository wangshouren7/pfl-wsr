import { Background } from "@/domains/assets";
import { Contact } from "@/domains/contact";

export default function ContactPage() {
  return (
    <>
      <Background
        fill
        priority
        className="!fixed top-0 left-0 -z-50 h-full w-full object-cover object-center opacity-50"
        sizes="100vw"
        variant="contact"
      />

      <Contact />
    </>
  );
}
