import type { DonationCategory } from "./api";

// Web Billing product identifiers - mirror the "Logos Zoe (Web)" products in
// RevenueCat (same IDs as the iOS catalog). Titles and descriptions are copied
// verbatim from the mobile app (donation_catalog.dart + donation_option_contents.dart).
export interface DonationCause {
  key: string;
  title: string;
  /** Long-form description of the cause (mirrors mobile `donationOptionContents`). */
  description: string;
  color: string;
  /** 4-stop gradient (top-left → bottom-right), mirroring the mobile cards. */
  gradient: [string, string, string, string];
  /** Illustration shown on the right of the card (under /public). */
  image: string;
  products: Record<DonationCategory, string>;
}

export const DONATION_CAUSES: DonationCause[] = [
  {
    key: "broadcast",
    title: "Broadcast Production & Distribution",
    color: "#16a34a",
    gradient: ["#34D399", "#10B981", "#059669", "#047857"],
    image: "/donation/broadcasts.png",
    products: {
      partnership: "broadcast_partnership",
      oneTime: "broadcasts_onetime_consumable",
    },
    description:
      "The Word of Faith Podcast is a 10-minute podcast where the unadulterated word of God is shared and distributed daily to the phones and tablets of subscribers at no cost. " +
      "We believe that one word from God can contain an entire life-changing formula. " +
      "Our inspirational videos and wisdom nuggets are Holy Ghost-filled messages to inspire and help believers to navigate their lives in this changing world. " +
      "The end is near and the message of the gospel must be preached in all nations of the world. " +
      "Our salvation messages are meant to help those who are at the ends of the world to encounter Christ. " +
      "This is why getting the word of God to places where Christ is not known in audio and video formats is important. " +
      "In this way, those who cannot read can still appreciate the word of God. " +
      "Further, we can get our podcast content onto online radios to enable us reach many more with the gospel of Christ. " +
      "Your partnership will enable the production to keep up the good work, as well as employ innovative ways of distributing the audio messages they produce around the world. " +
      "Your donation means a lot to The Logos Zoe and the gospel reaching the nations of the world.",
  },
  {
    key: "discipleship",
    title: "Online Discipleship",
    color: "#ca8a04",
    gradient: ["#FACC15", "#EAB308", "#CA8A04", "#A16207"],
    image: "/donation/discipleship.png",
    products: {
      partnership: "online_discipleship_partnership",
      oneTime: "online_discipleship_onetime_consumable",
    },
    description:
      "The Great Commission emphasises the importance of disciplining the nations. " +
      "Our online discipleship programme is built on a cutting-edge Learning Management System (LMS) that provides newly born-again Christians with the knowledge they need to mature in the faith. " +
      "Your partnership allows us to add a one-on-one session to the LMS, where experienced instructors can work with students individually. " +
      "Thus, experienced believers are employed to counsel, direct, correct, instruct and coach these new Christians in righteousness. " +
      "Our growing number of new believers necessitates that we scale up our discipleship program to include various translations of our discipleship resources. " +
      "This is the only way our resources can best speak to new believers whose native language is not English. " +
      "Your partnership means a lot to The Logos Zoe and the gospel reaching the nations of the world.",
  },
  {
    key: "intercession",
    title: "Intercessory Prayer for souls",
    color: "#2563eb",
    gradient: ["#60A5FA", "#3B82F6", "#2563EB", "#1E3A8A"],
    image: "/donation/praying.png",
    products: {
      partnership: "intercession_partnership",
      oneTime: "intercession_onetime_consumable",
    },
    description:
      "To win the world, we must constantly intercede for the world. " +
      "The church prayed for Peter constantly when he was arrested and imprisoned to be killed. It was only a matter of time before Peter received his deliverance. " +
      "The Logos Zoe is continually expanding its full-time prayer warriors to handle the prayer needs of those our work ministers to. " +
      "The team of prayer warriors is constantly interceding for the salvation of men and women all over the world. " +
      "Your partnership enables the project to maintain existing full-time prayer warriors, while enlarging the team to meet the ever-increasing demand for prayer by new believers, especially in difficult regions of the world. " +
      "We believe some men would be saved by a Damascus encounter when we pray. " +
      "Your partnership means a lot to The Logos Zoe and the gospel reaching the nations of the world.",
  },
];

/** Look up a cause title from a product identifier (for the history list). */
export function causeTitleForProduct(productIdentifier: string): string {
  for (const c of DONATION_CAUSES) {
    if (
      c.products.partnership === productIdentifier ||
      c.products.oneTime === productIdentifier
    ) {
      return c.title;
    }
  }
  return productIdentifier;
}
