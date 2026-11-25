import NewsletterForm from "./NewsletterForm";

export default function Newsletter() {
  return (
    <section id="newsletter" className="site-container py-12 md:py-20" aria-label="Newsletter">
      <h2 className="section-title">Newsletter</h2>
      <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:items-center md:gap-16">
        <p className="max-w-sm text-sm leading-7 text-bone/90 md:text-base">By subscribing to our mailing list you will always be updated with the latest drops and news from Encrypted.</p>
        <NewsletterForm />
      </div>
    </section>
  );
}
