import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Privacy Policy — Kronk"
        description="Kronk privacy policy. Learn how we collect, use, and protect your Personally Identifiable Information."
        path="/privacy"
      />
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16 max-w-3xl">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
        >
          ← Back to Kronk
        </Link>
        <article className="legal-content prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Kronk Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            This privacy policy has been compiled to better serve those who are
            concerned with how their Personally Identifiable Information (PII)
            is being used online. PII, as described in US privacy law and
            information security, is information that can be used on its own or
            with other information to identify, contact, or locate a single
            person, or to identify an individual in context. Please read our
            privacy policy carefully to get a clear understanding of how we
            collect, use, protect or otherwise handle your Personally
            Identifiable Information in accordance with our website.
          </p>

          <h2>What personal information do we collect from the people that visit our blog, website or app?</h2>
          <p>We do not collect information from visitors of our site or other details to help you with your experience.</p>

          <h2>When do we collect information?</h2>
          <p>We collect information from you when you enter information on our site or provide us with feedback on our products or services.</p>

          <h2>How do we use your information?</h2>
          <p>
            We may use the information we collect from you when you register,
            make a purchase, sign up for our newsletter, respond to a survey or
            marketing communication, surf the website, or use certain other site
            features in the following ways:
          </p>
          <ul>
            <li>To follow up with them after correspondence (live chat, email or phone inquiries)</li>
          </ul>

          <h2>How do we protect your information?</h2>
          <p>We do not use vulnerability scanning and/or scanning to PCI standards. We only provide articles and information. We never ask for credit card numbers. We do not use Malware Scanning. We do not use an SSL certificate.</p>
          <ul>
            <li>We only provide articles and information. We never ask for personal or private information like names, email addresses, or credit card numbers.</li>
          </ul>

          <h2>Do we use cookies?</h2>
          <p>We do not use cookies for tracking purposes.</p>
          <p>
            You can choose to have your computer warn you each time a cookie is
            being sent, or you can choose to turn off all cookies. You do this
            through your browser settings. Since each browser is a little
            different, look at your browser Help Menu to learn the correct way
            to modify your cookies.
          </p>
          <p>
            If you turn cookies off, some of the features that make your site
            experience more efficient may not function properly.
          </p>

          <h2>Third-party disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your
            Personally Identifiable Information.
          </p>

          <h2>Third-party links</h2>
          <p>
            We do not include or offer third-party products or services on our
            website.
          </p>

          <h2>Google</h2>
          <p>
            Google advertising requirements can be summed up by Google
            Advertising Principles. They are put in place to provide a positive
            experience for users.{" "}
            <a
              href="https://support.google.com/adwordspolicy/answer/1316548?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              support.google.com
            </a>
          </p>
          <p>We use Google AdSense Advertising on our website.</p>
          <p>
            Google, as a third-party vendor, uses cookies to serve ads on our
            site. Google&rsquo;s use of the DART cookie enables it to serve ads to our
            users based on previous visits to our site and other sites on the
            Internet. Users may opt out of the use of the DART cookie by
            visiting the Google Ad and Content Network privacy policy.
          </p>
          <h3>We have implemented the following:</h3>
          <p>
            We, along with third-party vendors such as Google use first-party
            cookies (such as the Google Analytics cookies) and third-party
            cookies (such as the DoubleClick cookie) or other third-party
            identifiers together. We use them to compile data regarding user
            interactions to sell that data to interested parties.
          </p>

          <h2>Opting out</h2>
          <p>
            Users can set preferences for how Google advertises to you using the
            Google Ad Settings page. Alternatively, you can opt out by visiting
            the Network Advertising Initiative Opt Out page or by using the
            Google Analytics Opt Out Browser add-on.
          </p>

          <h2>California Online Privacy Protection Act</h2>
          <p>
            CalOPPA is the first state law in the nation to require commercial
            websites and online services to post a privacy policy. The law&rsquo;s reach
            stretches well beyond California to require any person or company in
            the United States (and conceivably the world) that operates websites
            collecting Personally Identifiable Information from California
            consumers to post a conspicuous privacy policy on its website
            stating exactly the information being collected and those
            individuals or companies with whom it is being shared.{" "}
            <a
              href="http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf"
              target="_blank"
              rel="noopener noreferrer"
            >
              See More
            </a>
          </p>
          <h3>According to CalOPPA, we agree to the following:</h3>
          <p>Users can visit our site anonymously.</p>
          <p>
            Once this privacy policy is created, we will add a link to it on our
            home page or as a minimum, on the first significant page after
            entering our website.
          </p>
          <p>
            Our Privacy Policy link includes the word Privacy and can easily be
            found on the page specified above.
          </p>
          <h3>You will be notified of any Privacy Policy changes:</h3>
          <ul>
            <li>On our Privacy Policy Page</li>
          </ul>
          <h3>Can change your personal information:</h3>
          <ul>
            <li>By emailing us</li>
          </ul>

          <h2>How does our site handle Do Not Track signals?</h2>
          <p>
            We do not honor Do Not Track signals and Do Not Track, plant
            cookies, or use advertising when a Do Not Track (DNT) browser
            mechanism is in place. We do not honor them because:
          </p>

          <h2>Does our site allow third-party behavioral tracking?</h2>
          <p>
            It is also important to note that we do not allow third-party
            behavioral tracking.
          </p>

          <h2>COPPA (Children Online Privacy Protection Act)</h2>
          <p>
            When it comes to the collection of personal information from
            children under the age of 13 years old, the Children Online Privacy
            Protection Act (COPPA) puts parents in control. The Federal Trade
            Commission, United States&rsquo; consumer protection agency, enforces the
            COPPA Rule, which spells out what operators of websites and online
            services must do to protect children&rsquo;s privacy and safety online.
          </p>
          <p>
            We do not specifically market to children under the age of 13 years
            old.
          </p>
          <p>
            Do we let third-parties, including ad networks or plug-ins collect
            PII from children under 13?
          </p>

          <h2>Fair Information Practices</h2>
          <p>
            The Fair Information Practices Principles form the backbone of
            privacy law in the United States and the concepts they include have
            played a significant role in the development of data protection
            laws around the globe. Understanding the Fair Information Practice
            Principles and how they should be implemented is critical to comply
            with the various privacy laws that protect personal information.
          </p>
          <h3>In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:</h3>
          <p>We will notify you via email within 7 business days.</p>
          <p>
            We also agree to the Individual Redress Principle which requires
            that individuals have the right to legally pursue enforceable rights
            against data collectors and processors who fail to adhere to the
            law. This principle requires not only that individuals have
            enforceable rights against data users, but also that individuals
            have recourse to courts or government agencies to investigate and/or
            prosecute non-compliance by data processors.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
