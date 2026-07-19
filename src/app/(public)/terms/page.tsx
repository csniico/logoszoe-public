import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Card, SectionTitle, P } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service - The Noah's Project",
  description: "The terms that govern your use of The Noah's Project services.",
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service">
      <Card>
        <SectionTitle n={1}>Acceptance of Terms</SectionTitle>
        <P>
          These Terms of Service govern your access to and use of Logos Zoe (the &quot;App&quot;)
          and the related website and services (together, the &quot;Services&quot;), which are
          operated by The Noah&apos;s Project LBG. By downloading, accessing, or using the
          Services, you agree to be bound by these Terms and by our{" "}
          <Link href="/privacy" className="text-primary-600 underline hover:text-primary-800">
            Privacy Policy
          </Link>
          . If you do not agree with these Terms, please do not use the Services. The Services are
          intended for users who are at least 18 years of age.
        </P>
      </Card>

      <Card>
        <SectionTitle n={2}>App Description</SectionTitle>
        <P>
          Logos Zoe (The Logos-Zoé, meaning &quot;the Word of Life,&quot; from 1 John 1:1) is a
          Christian ministry app built and maintained by The Noah&apos;s Project LBG - a
          non-profit Christian missionary organisation founded in 2021 and registered in Ghana.
          The Services provide Bible content, daily devotionals, articles, audio prayers and
          podcasts, courses and discipleship resources, and the ability to support the ministry
          through donations.
        </P>
      </Card>

      <Card>
        <SectionTitle n={3}>In-App Purchases and Donations</SectionTitle>
        <P>
          You can support the ministry through the Donate section as a one-time gift or as an
          ongoing monthly partner. Donations are non-refundable. Purchases made through the App
          are charged to your Apple ID or Google Play account, you will receive an email receipt,
          and all proceeds support the ministry&apos;s mission.
        </P>
      </Card>

      <Card>
        <SectionTitle n={4}>Subscription Services (If Applicable)</SectionTitle>
        <P>
          Where subscription or monthly partnership services are offered, they renew automatically
          unless cancelled at least 24 hours before the end of the current period. You can manage
          or cancel them at any time in your Apple ID or Google Play store settings.
        </P>
      </Card>

      <Card>
        <SectionTitle n={5}>Refund Policy</SectionTitle>
        <P>
          All donations are final and non-refundable. Contact support@noahsproject.org for billing
          errors.
        </P>
      </Card>

      <Card>
        <SectionTitle n={6}>User Conduct</SectionTitle>
        <P>
          You agree to use the Services in a manner consistent with Christian values and
          applicable law. You may not use the Services for any unlawful purpose, or in any way that
          could damage, disable, or impair the Services or interfere with any other party&apos;s
          use of them. You are responsible for maintaining the confidentiality of your account, and
          you may review, update, or permanently delete your account at any time from your account
          settings.
        </P>
      </Card>

      <Card>
        <SectionTitle n={7}>Content and Intellectual Property</SectionTitle>
        <P>
          All content provided through the Services - including scripture resources, devotionals,
          articles, audio, video (such as Jesus Talk, produced in partnership with DELAFE), and
          course materials - is owned by The Noah&apos;s Project LBG and its partners and is
          protected by applicable intellectual property laws. You may not reproduce, distribute, or
          create derivative works from this content without our prior written permission.
        </P>
      </Card>

      <Card>
        <SectionTitle n={8}>Privacy Policy</SectionTitle>
        <P>
          Your use of our Services is also governed by our{" "}
          <Link href="/privacy" className="text-primary-600 underline hover:text-primary-800">
            Privacy Policy
          </Link>
          , which is available as a separate document and explains how we collect, use, and protect
          your information.
        </P>
      </Card>

      <Card>
        <SectionTitle n={9}>Disclaimers</SectionTitle>
        <P>
          The Services are provided on an &quot;as-is&quot; and &quot;as-available&quot; basis
          without warranties of any kind, whether express or implied. We do not warrant that the
          Services will be uninterrupted, error-free, or free of harmful components.
        </P>
      </Card>

      <Card>
        <SectionTitle n={10}>Limitation of Liability</SectionTitle>
        <P>
          To the fullest extent permitted by applicable law, The Noah&apos;s Project LBG and its
          partners will not be liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of data, arising out of or relating to your use of, or
          inability to use, the Services.
        </P>
      </Card>

      <Card>
        <SectionTitle n={11}>Changes to Terms</SectionTitle>
        <P>
          We may update these Terms from time to time. The updated version will be effective as soon
          as it is posted, and your continued use of the Services after any change constitutes your
          acceptance of the revised Terms. We encourage you to review these Terms periodically.
        </P>
      </Card>

      <Card>
        <SectionTitle n={12}>Governing Law</SectionTitle>
        <P>
          These Terms are governed by the laws of Ghana, where The Noah&apos;s Project LBG is
          registered, without regard to its conflict-of-law principles.
        </P>
      </Card>

      <Card>
        <SectionTitle n={13}>Contact Information</SectionTitle>
        <P>If you have any questions about these Terms, you can reach us at:</P>
        <address className="not-italic text-sm text-gray-600 leading-relaxed">
          The Noah&apos;s Project LBG
          <br />
          Email: support@noahsproject.org / info@noahsproject.org
          <br />
          Website: www.noahsproject.org
          <br />
          WhatsApp: +233-503-192-221
          <br />
          P. O. Box AF 898, Adenta-Accra, Ghana
        </address>
      </Card>
    </LegalLayout>
  );
}
