// app/privacy/page.tsx

export const metadata = {
    title: 'Privacy Policy',
    description: 'Privacy policy for your application.',
  };
  
  export default function PrivacyPage() {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
  
        <p className="mb-4">
          Last updated: February 6, 2024
        </p>
  
        <p className="mb-4">
          This is a placeholder for your privacy policy.  You should replace this
          text with your actual policy, which should describe:
        </p>
  
        <ul className="list-disc list-inside mb-4">
          <li>What information you collect from users.</li>
          <li>How you use that information.</li>
          <li>Whether you share information with third parties.</li>
          <li>How users can control their information.</li>
          <li>How you protect user data.</li>
          <li>Your contact information.</li>
        </ul>
  
        <p className="mb-4">
          <strong>Important:</strong> This is *not* legal advice. You should consult with
          a legal professional to create a privacy policy that complies with all
          applicable laws and regulations.
        </p>
  
        <h2 className="text-2xl font-bold mb-2 mt-8">Information We Collect</h2>
        <p className="mb-4">
          [Describe the types of information you collect.  Be specific.  Examples:]
        </p>
          <ul>
            <li>Account information (email, username, password – if applicable)</li>
            <li>Profile information (name, profile picture – if applicable)</li>
            <li>Content created by the user (notes, tasks, etc.)</li>
            <li>Usage data (how users interact with your application)</li>
            <li>Device information (IP address, browser type, etc.)</li>
            <li>Information from third-party services (e.g., Google Sign-In)</li>
          </ul>
  
  
        <h2 className="text-2xl font-bold mb-2 mt-8">How We Use Your Information</h2>
        <p className="mb-4">
          [Describe how you use the collected information. Examples:]
        </p>
          <ul>
              <li>To provide and improve our services.</li>
              <li>To personalize the user experience.</li>
              <li>To communicate with users (e.g., send email notifications).</li>
              <li>To enforce our terms of service.</li>
              <li>To comply with legal obligations.</li>
          </ul>
  
          <h2 className="text-2xl font-bold mb-2 mt-8">Data Sharing</h2>
        <p className="mb-4">
          [Describe if and how you share data with third parties. Be specific about *which* third parties and *why*.
           If you do *not* share data, state that clearly. Examples:]
        </p>
          <ul>
            <li>We do not sell your personal information to third parties.</li>
            <li>We may share your information with service providers who assist us in operating our application (e.g., hosting providers, database providers, email providers).</li>
            <li>We may share your information if required by law.</li>
            <li>We use Google Analytics/other analytics services. (Explain how this works)</li>
            <li>We use OpenAI/Perplexity API (explain data sent to them)</li>
          </ul>
  
        <h2 className="text-2xl font-bold mb-2 mt-8">Data Security</h2>
         <p className="mb-4">
          [Describe the security measures you take to protect user data.  Examples:]
        </p>
          <ul>
              <li>We use industry-standard encryption to protect your data in transit and at rest.</li>
              <li>We store your data on secure servers.</li>
              <li>We regularly review our security practices.</li>
          </ul>
  
        <h2 className="text-2xl font-bold mb-2 mt-8">User Rights</h2>
        <p className="mb-4">
          [Describe how users can access, correct, or delete their data. Examples:]
        </p>
        <ul>
          <li>You can access and update your account information by logging into your account.</li>
          <li>You can request deletion of your account by contacting us at [your email address].</li>
        </ul>
  
          <h2 className="text-2xl font-bold mb-2 mt-8">Changes to this Privacy Policy</h2>
        <p className="mb-4">
          [Explain how you will notify users of changes to the policy.]
        </p>
  
        <h2 className="text-2xl font-bold mb-2 mt-8">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          [Your Email Address]
        </p>
      </main>
    );
  }