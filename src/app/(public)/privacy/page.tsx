import type { Metadata } from "next";
import {
  LegalLayout,
  Card,
  Label,
  SectionTitle,
  P,
  Medium,
  InShort,
  Bullets,
  Bullet,
  Divider,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy - The Noah's Project",
  description: "How The Noah's Project collects, uses, and protects your information.",
};

// CCPA category table - [category, examples, collected]
const ccpaRows: [string, string, "YES" | "NO"][] = [
  [
    "A. Identifiers",
    "Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name",
    "YES",
  ],
  [
    "B. Personal information categories listed in the California Customer Records statute",
    "Name, contact information, education, employment, employment history, and financial information",
    "NO",
  ],
  [
    "C. Protected classification characteristics under California or federal law",
    "Gender and date of birth",
    "NO",
  ],
  [
    "D. Commercial information",
    "Transaction information, purchase history, financial details, and payment information",
    "YES",
  ],
  ["E. Biometric information", "Fingerprints and voiceprints", "NO"],
  [
    "F. Internet or other similar network activity",
    "Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements",
    "YES",
  ],
  ["G. Geolocation data", "Device location", "NO"],
  [
    "H. Audio, electronic, visual, thermal, olfactory, or similar information",
    "Images and audio, video or call recordings created in connection with our business activities",
    "NO",
  ],
  [
    "I. Professional or employment-related information",
    "Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us",
    "NO",
  ],
  ["J. Education information", "Student records and directory information", "NO"],
  [
    "K. Inferences drawn from other personal information",
    "Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual's preferences and characteristics",
    "NO",
  ],
  [
    "L. Sensitive personal information",
    "Account login information, drivers' licenses, health data, precise geolocation, racial or ethnic origin, religious or philosophical beliefs, and sex life or sexual orientation",
    "NO",
  ],
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Notice" updated="Last updated July 1st, 2023">
      {/* Intro */}
      <Card>
        <p className="text-base font-bold text-gray-900">PRIVACY NOTICE</p>
        <P>
          This privacy notice for THE NOAH&apos;S PROJECT LBG (doing business as THE
          NOAH&apos;S PROJECT) (&apos;Company,&apos; &apos;we,&apos; &apos;us,&apos; or
          &apos;our&apos;), describes how and why we might collect, store, use, and/or
          share (&apos;process&apos;) your information when you use our services
          (&apos;Services&apos;), such as when you:
        </P>
        <Bullets>
          <Bullet>
            Visit our website at www.noahsproject.org or any website of ours that links to
            this privacy notice
          </Bullet>
          <Bullet>
            Download and use our mobile application - The Noah&apos;s Project, or any other
            application of ours that links to this privacy notice
          </Bullet>
          <Bullet>
            Engage with us in other related ways - including any sales, marketing, or events
          </Bullet>
        </Bullets>
        <P>
          <strong className="font-medium text-gray-800">Questions or concerns? </strong>
          Reading this privacy notice will help you understand your privacy rights and
          choices. If you do not agree with our policies and practices, please do not use
          our Services. If you still have any questions or concerns, please contact us at
          info@noahsproject.org.
        </P>
      </Card>

      {/* Summary */}
      <Card>
        <Label>Summary of Key Points</Label>
        <P>
          This summary provides key points from our privacy notice. You can find out more
          details about any of these topics in the full notice below.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            What personal information do we process?{" "}
          </strong>
          When you visit, use, or navigate our Services, we may process personal information
          depending on how you interact with THE NOAH&apos;S PROJECT and the Services, the
          choices you make, and the products and features you use.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Do we process any sensitive personal information?{" "}
          </strong>
          We do not process sensitive personal information, unless necessary with your
          consent or as otherwise permitted by applicable law.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Do we receive any information from third parties?{" "}
          </strong>
          We may receive information from public databases, marketing partners, social media
          platforms, and other outside sources.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            How do we process your information?{" "}
          </strong>
          We process your information to provide, improve, and administer our Services,
          communicate with you, for security and fraud prevention, and to comply with law.
          We may also process your information for other purposes with your consent.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            In what situations and with which types of parties do we share personal
            information?{" "}
          </strong>
          We may share information in specific situations and with specific categories of
          third parties.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            How do we keep your information safe?{" "}
          </strong>
          We have organizational and technical processes and procedures in place to protect
          your personal information. However, no electronic transmission over the internet or
          information storage technology can be guaranteed to be 100% secure.
        </P>
        <P>
          <strong className="font-medium text-gray-800">What are your rights? </strong>
          Depending on where you are located geographically, the applicable privacy law may
          mean you have certain rights regarding your personal information.
        </P>
        <P>
          <strong className="font-medium text-gray-800">How do I exercise my rights? </strong>
          The easiest way to exercise your rights is by contacting us. We will consider and
          act upon any request in accordance with applicable data protection laws.
        </P>
      </Card>

      {/* Section 1 */}
      <Card>
        <SectionTitle n={1}>WHAT INFORMATION DO WE COLLECT?</SectionTitle>
        <Medium>Personal information you disclose to us</Medium>
        <InShort>We collect personal information that you provide to us.</InShort>
        <P>
          We collect personal information that you voluntarily provide to us when you register
          on the app or Services, express an interest in obtaining information about us or our
          products and Services, when you participate in activities on the Services, or
          otherwise when you contact us.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Personal Information Provided by You.{" "}
          </strong>
          The personal information we collect may include:
        </P>
        <Bullets>
          <Bullet>Your Name</Bullet>
          <Bullet>Email Address</Bullet>
          <Bullet>Your Country</Bullet>
        </Bullets>
        <P>
          <strong className="font-medium text-gray-800">Sensitive Information. </strong>
          We do not process sensitive information, unless necessary with your consent or as
          otherwise permitted by applicable law.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Payment Data. </strong>
          We may collect data necessary to process your payment if you make purchases, such as
          your payment instrument number and the security code associated with your payment
          instrument. All payment data is stored by Paystack or Hubtel.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Social Media Login Data. </strong>
          We may provide you with the option to register with us using your existing social
          media account details, like your Facebook, Twitter, or other social media account.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Application Data. </strong>
          If you use our application(s), we also may collect the following information if you
          choose to provide us with access or permission:
        </P>
        <Bullets>
          <Bullet>
            <strong className="font-medium text-gray-800">Mobile Device Access. </strong>
            We may request access or permission to certain features from your mobile device,
            including bluetooth, calendar, camera, and other features. You may change our
            access in your device&apos;s settings.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Mobile Device Data. </strong>
            We automatically collect device information such as your mobile device ID, model,
            manufacturer, operating system, version information, browser type, and Internet
            Protocol (IP) address.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Push Notifications. </strong>
            We may request to send you push notifications regarding your account or certain
            features. You may turn them off in your device&apos;s settings.
          </Bullet>
        </Bullets>
        <Divider />
        <Medium>Information automatically collected</Medium>
        <InShort>
          Some information - such as your Internet Protocol (IP) address and/or browser and
          device characteristics - is collected automatically when you visit our Services.
        </InShort>
        <P>
          We automatically collect certain information when you visit, use, or navigate the
          Services. This information does not reveal your specific identity but may include
          device and usage information, such as your IP address, browser and device
          characteristics, operating system, language preferences, device name, country,
          location, and information about how and when you use our Services.
        </P>
        <P>The information we collect includes:</P>
        <Bullets>
          <Bullet>
            <strong className="font-medium text-gray-800">Log and Usage Data. </strong>
            Service-related, diagnostic, usage, and performance information our servers
            automatically collect when you access or use our Services, including your IP
            address, device information, browser type, and activity information.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Device Data. </strong>
            Information about your computer, phone, tablet, or other device you use to access
            the Services, including IP address, device and application identification numbers,
            location, browser type, hardware model, and Internet service provider and/or
            mobile carrier.
          </Bullet>
        </Bullets>
        <Divider />
        <Medium>Information collected from other sources</Medium>
        <InShort>
          We may collect limited data from public databases, marketing partners, social media
          platforms, and other outside sources.
        </InShort>
        <P>
          In order to enhance our ability to provide relevant marketing, offers, and other
          services to you, we may obtain information about you from other sources, such as
          public databases, joint marketing partners, affiliate programs, data providers, and
          social media platforms. This information includes mailing addresses, job titles,
          email addresses, phone numbers, intent data, IP addresses, social media profiles,
          and custom profiles.
        </P>
      </Card>

      {/* Section 2 */}
      <Card>
        <SectionTitle n={2}>HOW DO WE PROCESS YOUR INFORMATION?</SectionTitle>
        <InShort>
          We process your information to provide, improve, and administer our Services,
          communicate with you, for security and fraud prevention, and to comply with law. We
          may also process your information for other purposes with your consent.
        </InShort>
        <P>We process your personal information for a variety of reasons, including:</P>
        <Bullets>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To facilitate account creation and authentication{" "}
            </strong>
            and otherwise manage user accounts.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To deliver and facilitate delivery of services{" "}
            </strong>
            to the user.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To respond to user inquiries/offer support to users.
            </strong>
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To send administrative information to you,{" "}
            </strong>
            including details about our products and services, changes to our terms and
            policies.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To fulfill and manage your orders,{" "}
            </strong>
            payments, returns, and exchanges.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To enable user-to-user communications.
            </strong>
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">To request feedback </strong>
            and to contact you about your use of our Services.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To send you marketing and promotional communications,{" "}
            </strong>
            if this is in accordance with your marketing preferences. You can opt out of our
            marketing emails at any time.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To deliver targeted advertising to you.
            </strong>
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">To protect our Services </strong>
            as part of our efforts to keep our Services safe and secure, including fraud
            monitoring and prevention.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">To identify usage trends.</strong>
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To determine the effectiveness of our marketing and promotional campaigns.
            </strong>
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              To save or protect an individual&apos;s vital interest,{" "}
            </strong>
            such as to prevent harm.
          </Bullet>
        </Bullets>
      </Card>

      {/* Section 3 */}
      <Card>
        <SectionTitle n={3}>
          WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?
        </SectionTitle>
        <InShort>
          We only process your personal information when we believe it is necessary and we
          have a valid legal reason to do so under applicable law, like with your consent, to
          comply with laws, to provide you with services, to protect your rights, or to
          fulfill our legitimate business interests.
        </InShort>
        <Medium italic>If you are located in the EU or UK, this section applies to you.</Medium>
        <P>
          The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the
          valid legal bases we rely on in order to process your personal information. We may
          rely on the following legal bases:
        </P>
        <Bullets>
          <Bullet>
            <strong className="font-medium text-gray-800">Consent. </strong>
            We may process your information if you have given us permission to use your
            personal information for a specific purpose. You can withdraw your consent at any
            time.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Performance of a Contract. </strong>
            We may process your personal information when we believe it is necessary to fulfill
            our contractual obligations to you.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Legitimate Interests. </strong>
            We may process your information when we believe it is reasonably necessary to
            achieve our legitimate business interests, for example to send special offers,
            develop personalized advertising, analyze Services usage, support marketing
            activities, or prevent fraudulent activities.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Legal Obligations. </strong>
            We may process your information where we believe it is necessary for compliance
            with our legal obligations.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Vital Interests. </strong>
            We may process your information where we believe it is necessary to protect your
            vital interests or the vital interests of a third party.
          </Bullet>
        </Bullets>
        <P>
          In legal terms, we are generally the &apos;data controller&apos; under European data
          protection laws of the personal information described in this privacy notice, since
          we determine the means and/or purposes of the data processing we perform.
        </P>
        <Medium italic>If you are located in Canada, this section applies to you.</Medium>
        <P>
          We may process your information if you have given us specific or implied permission
          to use your personal information for a specific purpose. You can withdraw your
          consent at any time. In some exceptional cases, we may be legally permitted to
          process your information without your consent, including:
        </P>
        <Bullets>
          <Bullet>
            If collection is clearly in the interests of an individual and consent cannot be
            obtained in a timely way
          </Bullet>
          <Bullet>For investigations and fraud detection and prevention</Bullet>
          <Bullet>For business transactions provided certain conditions are met</Bullet>
          <Bullet>
            If it is contained in a witness statement and the collection is necessary to
            assess, process, or settle an insurance claim
          </Bullet>
          <Bullet>
            For identifying injured, ill, or deceased persons and communicating with next of
            kin
          </Bullet>
          <Bullet>
            If we have reasonable grounds to believe an individual has been, is, or may be
            victim of financial abuse
          </Bullet>
          <Bullet>
            If disclosure is required to comply with a subpoena, warrant, court order, or rules
            of the court relating to the production of records
          </Bullet>
          <Bullet>
            If it was produced by an individual in the course of their employment, business, or
            profession and the collection is consistent with the purposes for which the
            information was produced
          </Bullet>
          <Bullet>
            If the collection is solely for journalistic, artistic, or literary purposes
          </Bullet>
          <Bullet>
            If the information is publicly available and is specified by the regulations
          </Bullet>
        </Bullets>
      </Card>

      {/* Section 4 */}
      <Card>
        <SectionTitle n={4}>
          WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </SectionTitle>
        <InShort>
          We may share information in specific situations described in this section and/or with
          the following categories of third parties.
        </InShort>
        <P>
          <strong className="font-medium text-gray-800">
            Vendors, Consultants, and Other Third-Party Service Providers.{" "}
          </strong>
          We may share your data with third-party vendors, service providers, contractors, or
          agents who perform services for us or on our behalf and require access to such
          information to do that work. The categories of third parties we may share personal
          information with include:
        </P>
        <Bullets>
          <Bullet>Ad Networks</Bullet>
          <Bullet>Affiliate Marketing Programs</Bullet>
          <Bullet>Cloud Computing Services</Bullet>
          <Bullet>Communication &amp; Collaboration Tools</Bullet>
          <Bullet>Data Analytics Services</Bullet>
          <Bullet>Data Storage Service Providers</Bullet>
          <Bullet>Finance &amp; Accounting Tools</Bullet>
          <Bullet>Government Entities</Bullet>
          <Bullet>Order Fulfillment Service Providers</Bullet>
          <Bullet>Payment Processors</Bullet>
          <Bullet>Performance Monitoring Tools</Bullet>
          <Bullet>Product Engineering &amp; Design Tools</Bullet>
          <Bullet>Retargeting Platforms</Bullet>
          <Bullet>Sales &amp; Marketing Tools</Bullet>
          <Bullet>Social Networks</Bullet>
          <Bullet>Testing Tools</Bullet>
          <Bullet>User Account Registration &amp; Authentication Services</Bullet>
          <Bullet>Website Hosting Service Providers</Bullet>
        </Bullets>
        <P>We also may need to share your personal information in the following situations:</P>
        <Bullets>
          <Bullet>
            <strong className="font-medium text-gray-800">Business Transfers. </strong>
            We may share or transfer your information in connection with, or during
            negotiations of, any merger, sale of company assets, financing, or acquisition of
            all or a portion of our business to another company.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">
              When we use Google Maps Platform APIs.{" "}
            </strong>
            We may share your information with certain Google Maps Platform APIs. We obtain and
            store on your device your location for 3 months. You may revoke your consent anytime
            by contacting us.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Affiliates. </strong>
            We may share your information with our affiliates, in which case we will require
            those affiliates to honor this privacy notice.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Business Partners. </strong>
            We may share your information with our business partners to offer you certain
            products, services, or promotions.
          </Bullet>
          <Bullet>
            <strong className="font-medium text-gray-800">Other Users. </strong>
            When you share personal information or otherwise interact with public areas of the
            Services, such personal information may be viewed by all users and may be publicly
            available outside the Services.
          </Bullet>
        </Bullets>
      </Card>

      {/* Section 5 */}
      <Card>
        <SectionTitle n={5}>WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</SectionTitle>
        <InShort>
          We are not responsible for the safety of any information that you share with third
          parties that we may link to or who advertise on our Services, but are not affiliated
          with, our Services.
        </InShort>
        <P>
          The Services may link to third-party websites, online services, or mobile
          applications and/or contain advertisements from third parties that are not affiliated
          with us. Accordingly, we do not make any guarantee regarding any such third parties,
          and we will not be liable for any loss or damage caused by the use of such
          third-party websites, services, or applications. The inclusion of a link does not
          imply an endorsement by us. We cannot guarantee the safety and privacy of data you
          provide to any third parties. Any data collected by third parties is not covered by
          this privacy notice.
        </P>
      </Card>

      {/* Section 6 */}
      <Card>
        <SectionTitle n={6}>DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</SectionTitle>
        <InShort>
          We do not at the moment, but may use cookies and other tracking technologies to
          collect and store your information in the future. This will be made known to you when
          the need arises.
        </InShort>
        <P>
          We may use cookies and similar tracking technologies (like web beacons and pixels) to
          access or store information in the foreseeable future, even though at the moment we do
          not. Specific information about how we use such technologies and how you can refuse
          certain cookies will be set out in our Cookie Notice.
        </P>
      </Card>

      {/* Section 7 */}
      <Card>
        <SectionTitle n={7}>HOW DO WE HANDLE YOUR SOCIAL LOGINS?</SectionTitle>
        <InShort>
          If you choose to register or log in to our Services using a social media account, we
          may have access to certain information about you.
        </InShort>
        <P>
          Our Services offer you the ability to register and log in using your third-party
          social media account details (like your Facebook or Twitter logins). Where you choose
          to do this, we will receive certain profile information about you from your social
          media provider. The profile information we receive may vary depending on the social
          media provider concerned, but will often include your name, email address, friends
          list, and profile picture, as well as other information you choose to make public on
          such a social media platform.
        </P>
        <P>
          We will use the information we receive only for the purposes that are described in
          this privacy notice. Please note that we do not control, and are not responsible for,
          other uses of your personal information by your third-party social media provider. We
          recommend that you review their privacy notice to understand how they collect, use,
          and share your personal information.
        </P>
      </Card>

      {/* Section 8 */}
      <Card>
        <SectionTitle n={8}>IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</SectionTitle>
        <InShort>
          We may transfer, store, and process your information in countries other than your own.
        </InShort>
        <P>
          Our servers are located in Europe. If you are accessing our Services from outside
          Europe, please be aware that your information may be transferred to, stored, and
          processed by us in our facilities and by those third parties with whom we may share
          your personal information, in Europe, Ghana, and other countries.
        </P>
        <P>
          Please be sure to review the relevant sections of this Privacy Notice for additional
          details relevant to The Noah&apos;s Project LBG&apos;s participation in the EU-US and
          Swiss-US Privacy Shield.
        </P>
      </Card>

      {/* Section 9 */}
      <Card>
        <SectionTitle n={9}>HOW LONG DO WE KEEP YOUR INFORMATION?</SectionTitle>
        <InShort>
          We keep your information for as long as necessary to fulfill the purposes outlined in
          this privacy notice unless otherwise required by law.
        </InShort>
        <P>
          We will only keep your personal information for as long as it is necessary for the
          purposes set out in this privacy notice, unless a longer retention period is required
          or permitted by law (such as tax, accounting, or other legal requirements). No purpose
          in this notice will require us keeping your personal information for longer than the
          period of time in which users have an account with us, or 3 months past the
          termination of the user&apos;s account, or 12 months past the start of the idle period
          of the user&apos;s account.
        </P>
        <P>
          When we have no ongoing legitimate business need to process your personal information,
          we will either delete or anonymize such information, or, if this is not possible, then
          we will securely store your personal information and isolate it from any further
          processing until deletion is possible.
        </P>
      </Card>

      {/* Section 10 */}
      <Card>
        <SectionTitle n={10}>HOW DO WE KEEP YOUR INFORMATION SAFE?</SectionTitle>
        <InShort>
          We aim to protect your personal information through a system of organizational and
          technical security measures.
        </InShort>
        <P>
          We have implemented appropriate and reasonable technical and organizational security
          measures designed to protect the security of any personal information we process.
          However, despite our safeguards and efforts to secure your information, no electronic
          transmission over the Internet or information storage technology can be guaranteed to
          be 100% secure. Although we will do our best to protect your personal information,
          transmission of personal information to and from our Services is at your own risk. You
          should only access the Services within a secure environment.
        </P>
      </Card>

      {/* Section 11 */}
      <Card>
        <SectionTitle n={11}>DO WE COLLECT INFORMATION FROM MINORS?</SectionTitle>
        <InShort>
          We do not knowingly collect data from or market to children under 18 years of age.
        </InShort>
        <P>
          We do not knowingly solicit data from or market to children under 18 years of age. By
          using the Services, you represent that you are at least 18 or that you are the parent
          or guardian of such a minor and consent to such minor dependent&apos;s use of the
          Services. If we learn that personal information from users less than 18 years of age
          has been collected, we will deactivate the account and take reasonable measures to
          promptly delete such data from our records. If you become aware of any data we may
          have collected from children under age 18, please contact us at info@noahsproject.org.
        </P>
      </Card>

      {/* Section 12 */}
      <Card>
        <SectionTitle n={12}>WHAT ARE YOUR PRIVACY RIGHTS?</SectionTitle>
        <InShort>
          In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and
          Canada, you have rights that allow you greater access to and control over your personal
          information. You may review, change, or terminate your account at any time.
        </InShort>
        <P>
          In some regions (like the EEA, UK, and Canada), you have certain rights under
          applicable data protection laws. These may include the right (i) to request access and
          obtain a copy of your personal information, (ii) to request rectification or erasure;
          (iii) to restrict the processing of your personal information; and (iv) if applicable,
          to data portability. In certain circumstances, you may also have the right to object to
          the processing of your personal information. You can make such a request by contacting
          us using the contact details provided in Section 17.
        </P>
        <P>
          We will consider and act upon any request in accordance with applicable data protection
          laws.
        </P>
        <P>
          If you are located in the EEA or UK and you believe we are unlawfully processing your
          personal information, you also have the right to complain to your Member State data
          protection authority or UK data protection authority.
        </P>
        <P>
          If you are located in Switzerland, you may contact the Federal Data Protection and
          Information Commissioner.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Withdrawing your consent: </strong>
          If we are relying on your consent to process your personal information, you have the
          right to withdraw your consent at any time by contacting us using the contact details
          provided in Section 17 or updating your preferences. Please note that this will not
          affect the lawfulness of the processing before its withdrawal.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Opting out of marketing and promotional communications:{" "}
          </strong>
          You can unsubscribe from our marketing and promotional communications at any time by
          clicking on the unsubscribe link in the emails that we send, replying &apos;STOP&apos;
          or &apos;UNSUBSCRIBE&apos; to the SMS messages that we send, or by contacting us using
          the details provided in Section 17.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Account Information: </strong>
          If you would at any time like to review or change the information in your account or
          terminate your account, you can log in to your account settings and update your user
          account, or contact us using the contact information provided. Upon your request to
          terminate your account, we will deactivate or delete your account and information from
          our active databases. However, we may retain some information in our files to prevent
          fraud, troubleshoot problems, assist with any investigations, enforce our legal terms
          and/or comply with applicable legal requirements.
        </P>
        <P>
          If you have questions or comments about your privacy rights, you may email us at
          info@noahsproject.org.
        </P>
      </Card>

      {/* Section 13 */}
      <Card>
        <SectionTitle n={13}>CONTROLS FOR DO-NOT-TRACK FEATURES</SectionTitle>
        <P>
          Most web browsers and some mobile operating systems and mobile applications include a
          Do-Not-Track (&apos;DNT&apos;) feature or setting you can activate to signal your
          privacy preference not to have data about your online browsing activities monitored and
          collected. At this stage no uniform technology standard for recognizing and
          implementing DNT signals has been finalized. As such, we do not currently respond to
          DNT browser signals or any other mechanism that automatically communicates your choice
          not to be tracked online. If a standard for online tracking is adopted that we must
          follow in the future, we will inform you about that practice in a revised version of
          this privacy notice.
        </P>
      </Card>

      {/* Section 14 */}
      <Card>
        <SectionTitle n={14}>DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</SectionTitle>
        <InShort>
          Yes, if you are a resident of California, you are granted specific rights regarding
          access to your personal information.
        </InShort>
        <P>
          California Civil Code Section 1798.83, also known as the &apos;Shine The Light&apos;
          law, permits our users who are California residents to request and obtain from us, once
          a year and free of charge, information about categories of personal information (if any)
          we disclosed to third parties for direct marketing purposes and the names and addresses
          of all third parties with which we shared personal information in the immediately
          preceding calendar year. If you are a California resident and would like to make such a
          request, please submit your request in writing to us using the contact information
          provided below.
        </P>
        <P>
          If you are under 18 years of age, reside in California, and have a registered account
          with Services, you have the right to request removal of unwanted data that you publicly
          post on the Services. To request removal of such data, please contact us using the
          contact information provided below and include the email address associated with your
          account and a statement that you reside in California.
        </P>
        <Medium>CCPA Privacy Notice</Medium>
        <P>
          We have collected the following categories of personal information in the past twelve
          (12) months:
        </P>
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 font-medium border-r border-gray-200 w-1/4">Category</th>
                <th className="p-2 font-medium border-r border-gray-200">Examples</th>
                <th className="p-2 font-medium w-16 text-center">Collected</th>
              </tr>
            </thead>
            <tbody>
              {ccpaRows.map(([category, examples, collected], i) => (
                <tr key={category} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="p-2 border-t border-r border-gray-200 text-gray-700 align-top">
                    {category}
                  </td>
                  <td className="p-2 border-t border-r border-gray-200 text-gray-600 align-top">
                    {examples}
                  </td>
                  <td
                    className={`p-2 border-t border-gray-200 text-center font-medium align-top ${
                      collected === "YES" ? "text-primary-600" : "text-gray-400"
                    }`}
                  >
                    {collected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          We will use and retain the collected personal information as needed to provide the
          Services or for:
        </P>
        <Bullets>
          <Bullet>Category A – Log In purposes</Bullet>
          <Bullet>Category B – Not Applicable</Bullet>
          <Bullet>Category C – Not Applicable</Bullet>
          <Bullet>Category D – Processing Purchases on our platform</Bullet>
          <Bullet>Category E – Not Applicable</Bullet>
          <Bullet>Category F – Security checks</Bullet>
          <Bullet>Categories G through L – Not Applicable</Bullet>
        </Bullets>
        <P>
          We may also collect other personal information outside of these categories through
          instances where you interact with us in the context of:
        </P>
        <Bullets>
          <Bullet>Receiving help through our customer support channels</Bullet>
          <Bullet>Participation in customer surveys or contests</Bullet>
          <Bullet>
            Facilitation in the delivery of our Services and to respond to your inquiries
          </Bullet>
        </Bullets>
        <Medium>How do we use and share your personal information?</Medium>
        <P>
          The Noah&apos;s Project LBG collects and shares your personal information through:
        </P>
        <Bullets>
          <Bullet>Targeting cookies/Marketing cookies</Bullet>
          <Bullet>Social media cookies</Bullet>
          <Bullet>Beacons/Pixels/Tags</Bullet>
          <Bullet>
            Social media plugins such as &quot;Like&quot; buttons and &quot;Share&quot; widgets
          </Bullet>
        </Bullets>
        <P>
          More information about our data collection and sharing practices can be found in this
          privacy notice. You may contact us by email at info@noahsproject.org, by calling at
          233-50-319-2221, or by referring to the contact details at the bottom of this document.
        </P>
        <Medium>Will your information be shared with anyone else?</Medium>
        <P>
          We may disclose your personal information with our service providers pursuant to a
          written contract between us and each service provider. Each service provider is a
          for-profit entity that processes the information on our behalf, following the same
          strict privacy protection obligations mandated by the CCPA.
        </P>
        <P>
          The Noah&apos;s Project has never disclosed or sold any personal information categories
          to third parties for a business or commercial purpose in the preceding twelve (12)
          months.
        </P>
        <Medium>Your rights with respect to your personal data</Medium>
        <P>
          <strong className="font-medium text-gray-800">
            Right to request deletion of the data - Request to delete
          </strong>
          <br />
          You can ask for the deletion of your personal information. If you ask us to delete your
          personal information, we will respect your request and delete your personal
          information, subject to certain exceptions provided by law.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Right to be informed - Request to know
          </strong>
          <br />
          Depending on the circumstances, you have a right to know:
        </P>
        <Bullets>
          <Bullet>Whether we collect and use your personal information</Bullet>
          <Bullet>The categories of personal information that we collect</Bullet>
          <Bullet>The purposes for which the collected personal information is used</Bullet>
          <Bullet>Whether we sell or share your personal information to third parties</Bullet>
          <Bullet>
            The categories of personal information that we sold, shared, or disclosed for a
            business purpose
          </Bullet>
          <Bullet>
            The categories of third parties to whom the personal information was sold, shared, or
            disclosed for a business purpose
          </Bullet>
          <Bullet>
            The business or commercial purpose for collecting, sharing, or selling personal
            information
          </Bullet>
          <Bullet>The specific pieces of personal information we collected about you</Bullet>
        </Bullets>
        <P>
          <strong className="font-medium text-gray-800">Right to Non-Discrimination</strong>
          <br />
          We will not discriminate against you if you exercise your privacy rights.
        </P>
        <P>
          <strong className="font-medium text-gray-800">
            Right to Limit Use and Disclosure of Sensitive Personal Information
          </strong>
          <br />
          We do not process consumer&apos;s sensitive personal information, including:
        </P>
        <Bullets>
          <Bullet>
            Social security information, drivers&apos; licenses, state ID cards, passport numbers
          </Bullet>
          <Bullet>Account login information</Bullet>
          <Bullet>
            Credit card numbers, financial account information, or credentials allowing access to
            such accounts
          </Bullet>
          <Bullet>Precise geolocation</Bullet>
          <Bullet>
            Racial or ethnic origin, religious or philosophical beliefs, union membership
          </Bullet>
          <Bullet>
            The contents of email and text, unless the business is the intended recipient of the
            communication
          </Bullet>
          <Bullet>Genetic data, biometric data, and health data</Bullet>
          <Bullet>Data concerning sexual orientation and sex life</Bullet>
        </Bullets>
        <P>
          To exercise your right to limit use and disclosure of sensitive personal information,
          please email info@noahsproject.org.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Verification process</strong>
          <br />
          Upon receiving your request, we will need to verify your identity to determine you are
          the same person about whom we have the information in our system. We will only use
          personal information provided in your request to verify your identity or authority to
          make the request.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Other privacy rights</strong>
        </P>
        <Bullets>
          <Bullet>You may object to the processing of your personal information.</Bullet>
          <Bullet>
            You may request correction of your personal data if it is incorrect or no longer
            relevant, or ask to restrict the processing of the information.
          </Bullet>
          <Bullet>
            You can designate an authorized agent to make a request under the CCPA on your behalf.
          </Bullet>
          <Bullet>
            You may request to opt out from future selling or sharing of your personal
            information to third parties.
          </Bullet>
        </Bullets>
        <P>
          <strong className="font-medium text-gray-800">Financial Incentives. </strong>
          We do not sell users&apos; data and are not in a position to offer a financial
          incentive in exchange for the retention, or sale or sharing of a consumer&apos;s
          personal information.
        </P>
        <P>
          To exercise these rights, you can contact us by email at info@noahsproject.org, or by
          referring to the contact details at the bottom of this document.
        </P>
      </Card>

      {/* Section 15 */}
      <Card>
        <SectionTitle n={15}>DO VIRGINIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</SectionTitle>
        <InShort>
          Yes, if you are a resident of Virginia, you may be granted specific rights regarding
          access to and use of your personal information.
        </InShort>
        <Medium>Virginia CDPA Privacy Notice</Medium>
        <P>Under the Virginia Consumer Data Protection Act (CDPA):</P>
        <P>
          &apos;Consumer&apos; means a natural person who is a resident of the Commonwealth
          acting only in an individual or household context. It does not include a natural person
          acting in a commercial or employment context.
        </P>
        <P>
          &apos;Personal data&apos; means any information that is linked or reasonably linkable to
          an identified or identifiable natural person. &apos;Personal data&apos; does not include
          de-identified data or publicly available information.
        </P>
        <P>
          &quot;Sale of personal data&quot; means the exchange of personal data for monetary
          consideration.
        </P>
        <P>Your rights with respect to your personal data include:</P>
        <Bullets>
          <Bullet>Right to be informed whether or not we are processing your personal data</Bullet>
          <Bullet>Right to access your personal data</Bullet>
          <Bullet>Right to correct inaccuracies in your personal data</Bullet>
          <Bullet>Right to request deletion of your personal data</Bullet>
          <Bullet>
            Right to obtain a copy of the personal data you previously shared with us
          </Bullet>
          <Bullet>
            Right to opt out of the processing of your personal data if it is used for targeted
            advertising, the sale of personal data, or profiling
          </Bullet>
        </Bullets>
        <P>
          The Noah&apos;s Project has not sold any personal data to third parties for business or
          commercial purposes. The Noah&apos;s Project will not sell personal data in the future
          belonging to website visitors, users, and other consumers.
        </P>
        <P>
          You may contact us by email at info@noahsproject.org or by referring to the contact
          details at the bottom of this document.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Verification process</strong>
          <br />
          We may request that you provide additional information reasonably necessary to verify
          you and your consumer&apos;s request. Upon receiving your request, we will respond
          without undue delay, but in all cases, within forty-five (45) days of receipt. The
          response period may be extended once by forty-five (45) additional days when reasonably
          necessary.
        </P>
        <P>
          <strong className="font-medium text-gray-800">Right to appeal</strong>
          <br />
          If we decline to take action regarding your request, we will inform you of our decision
          and reasoning behind it. If you wish to appeal our decision, please email us at
          info@noahsproject.org. Within sixty (60) days of receipt of an appeal, we will inform
          you in writing of any action taken or not taken in response to the appeal, including a
          written explanation of the reasons for the decisions.
        </P>
      </Card>

      {/* Section 16 */}
      <Card>
        <SectionTitle n={16}>DO WE MAKE UPDATES TO THIS NOTICE?</SectionTitle>
        <InShort>
          Yes, we will update this notice as necessary to stay compliant with relevant laws.
        </InShort>
        <P>
          We may update this privacy notice from time to time. The updated version will be
          indicated by an updated &apos;Revised&apos; date and the updated version will be
          effective as soon as it is accessible. If we make material changes to this privacy
          notice, we may notify you either by prominently posting a notice of such changes or by
          directly sending you a notification. We encourage you to review this privacy notice
          frequently to be informed of how we are protecting your information.
        </P>
      </Card>

      {/* Section 17 */}
      <Card>
        <SectionTitle n={17}>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</SectionTitle>
        <P>
          If you have questions or comments about this notice, you may contact our Data Protection
          Officer (DPO), Dennis Owusu Afriyie, by email at owusuafriyie@gmail.com, or by post to:
        </P>
        <address className="not-italic text-sm text-gray-600 leading-relaxed">
          THE NOAH&apos;S PROJECT LBG
          <br />
          Dennis Owusu Afriyie
          <br />
          P. O. Box AF 898
          <br />
          Adenta-Accra, Ghana
        </address>
        <P>
          If you have any further questions or comments, you may also contact us by post at the
          following corporate address:
        </P>
        <address className="not-italic text-sm text-gray-600 leading-relaxed">
          THE NOAH&apos;S PROJECT LBG
          <br />
          P. O. Box AF 898
          <br />
          Adenta-Accra, Ghana
          <br />
          Phone: 00233-50-319-2221
        </address>
      </Card>
    </LegalLayout>
  );
}
