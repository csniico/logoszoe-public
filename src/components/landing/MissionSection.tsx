const paragraphs = [
  `God promised that He would never again destroy the earth with water. However, speaking of His second coming, Jesus said, "As the days of Noah were, so will the coming of the Son of Man be. For as in the days before the flood, they were eating and drinking, marrying and giving in marriage, until the day that Noah entered the ark, and did not know until the flood came and took them all away, so also will the coming of the Son of Man be" (Matt 24:37-39).`,
  `Jesus is coming again, and the stage will be set as in the days of Noah - the ark of salvation will be open to all, the message of repentance and the opportunity to enter the ark will be published to all, and men will think the 'Noahs' of our time are just creating fear and panic. On the other hand, this gospel of the kingdom will be preached throughout the entire world as a witness to all nations, and then the end will come.`,
  `The Noah's Project is an online Christian mission. It seeks to create an online Christian ecosystem for believers to grow in the knowledge of our Lord Jesus Christ because the days are evil and the time is short. An ecosystem that fosters Christian discipleship irrespective of where you are - especially in regions where the gospel is resisted or suppressed - is crucial at a time pandemics have made it difficult for missionaries to be present in the mission field.`,
  `The Project also involves a global outreach using our app and website content to bring the message of the gospel to all nations of the world. We package and make available the gospel message in multiple formats - video, audio, articles, LMS and more. We believe that wherever the internet exists, the good news of Jesus Christ can also be shared.`,
];

/**
 * The "days of Noah" mission narrative - a modern editorial two-column layout.
 *
 * Presentational + static: pure server component (no interactivity), so it ships
 * zero client JS and renders as part of the initial HTML for fast LCP.
 */
export function MissionSection() {
  return (
    <section id="about" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 bg-ivory border-y border-primary-100/60">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Image */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gold-100/40 -z-10 hidden sm:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about/mission-hero.jpg"
            alt="Sharing the gospel wherever the internet reaches"
            className="w-full rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
            loading="lazy"
          />
        </div>

        {/* Text */}
        <div>
          <blockquote className="border-l-4 border-gold-400 pl-5 mb-8">
            <p className="font-serif text-lg sm:text-xl italic text-primary-800 leading-relaxed">
              &ldquo;And the Lord said unto Noah, Come, you and all your house into the
              ark; &hellip; For yet seven days, and I will cause it to rain upon the
              earth &hellip;&rdquo;
            </p>
            <footer className="text-sm font-semibold text-gold-600 mt-3">
              - Genesis 7:1-4
            </footer>
          </blockquote>

          <div className="space-y-4">
            {paragraphs.map((text, i) => (
              <p key={i} className="text-primary-900/70 text-sm sm:text-base leading-relaxed">
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
