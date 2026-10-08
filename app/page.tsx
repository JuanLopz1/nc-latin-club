import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-50 focus:bg-background focus:px-4 focus:py-3"
      >
        Skip to content
      </a>

      <header className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-xl font-semibold tracking-wide"
        >
          NC LATIN CLUB
          <span aria-hidden="true" className="ml-2 text-gold">
            ✳︎
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-6 text-sm font-medium"
        >
          <Link
            href="/"
            aria-current="page"
            className="inline-flex min-h-11 items-center hover:text-terracotta"
          >
            Home
          </Link>

          <a
            href="#familia"
            className="inline-flex min-h-11 items-center hover:text-terracotta"
          >
            Our Familia
          </a>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        {/* Hero text */}
        <section className="mx-auto max-w-7xl px-6 pb-8 pt-12 text-center md:pt-16">
          <p className="text-xs tracking-[0.3em] text-muted">
            WELCOME TO NC LATIN CLUB
          </p>

          <h1 className="mt-5 font-serif text-5xl md:text-7xl">
            Where Cultures Bloom.
          </h1>

          <p className="mt-6 text-muted">
            More than a club. A place to belong.
          </p>
        </section>

        {/* Hero landscape */}
        <section className="mx-auto max-w-[1200px] px-4 pb-12 md:px-8">
          <div className="overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem]">
            <Image
              src="/images/hero-courtyard.jpg"
              alt="Sunlit Latin American courtyard with arches, flowers and mountains"
              width={2048}
              height={1143}
              priority
              sizes="(min-width: 1200px) 1136px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 32px)"
              className="h-auto w-full"
            />
          </div>
        </section>

        <section
          id="familia"
          aria-labelledby="familia-heading"
          className="mx-auto max-w-3xl scroll-mt-8 px-6 py-16 text-center md:py-24"
        >
          <p className="text-xs tracking-[0.3em] text-muted">OUR FAMILIA</p>
          <h2 id="familia-heading" className="mt-5 font-serif text-4xl md:text-5xl">
            Different roots. One familia.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
            NC Latin Club is an independent cultural community in Niagara,
            Ontario. We celebrate Latin American cultures and connect students
            and community members through shared experiences.
          </p>
        </section>
      </main>
    </div>
  );
}
