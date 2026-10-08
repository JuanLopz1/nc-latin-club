
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F3E7]">

      
{/* Navbar */}
<header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
  <a
    href="/"
    className="text-xl font-semibold tracking-wide text-[#173D32]"
  >
    NC LATIN CLUB
    <span className="ml-2 text-[#C28B42]">✳</span>
  </a>

  <nav
    aria-label="Main navigation"
    className="flex items-center gap-6 text-sm font-medium text-[#173D32]"
  >
    <a
      href="/"
      className="transition-colors hover:text-[#C28B42]"
    >
      Home
    </a>

    <a
      href="#familia"
      className="transition-colors hover:text-[#C28B42]"
    >
      Our Familia
    </a>
  </nav>
</header>

      <main>
        {/* Hero text */}
        <section className="mx-auto max-w-7xl px-6 pb-8 pt-12 text-center md:pt-16">          <p className="text-xs tracking-[0.3em] text-[#59745D]">
            WELCOME TO NC LATIN CLUB
          </p>

          <h1 className="mt-5 font-serif text-5xl text-[#173D32] md:text-7xl">
            Where Cultures Bloom.
          </h1>

          <p className="mt-6 text-[#59745D]">
            More than a club. A place to belong.
          </p>
        </section>

        {/* Hero landscape */}
        <section className="mx-auto max-w-[1200px] px-4 pb-12 md:px-8">          <div className="overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem]">
            <Image
              src="/images/hero-courtyard.jpg"
              alt="Sunlit Latin American courtyard with arches, flowers and mountains"
              width={2048}
              height={1143}
              priority
              sizes="(max-width: 768px) 100vw, 1600px"
              className="h-auto w-full"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
