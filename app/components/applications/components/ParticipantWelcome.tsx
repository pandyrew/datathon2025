type WelcomeStepProps = {
  nextStep: () => void;
  isSubmitted: boolean;
};

export default function WelcomeStep({
  nextStep,
  isSubmitted,
}: WelcomeStepProps) {
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-outfit text-gray-900">
            Application Submitted
          </h2>
          <div className="prose prose-indigo font-chillax">
            <p className="text-gray-600">
              Thank you for submitting your application! We will review all
              applications and send out decisions shortly after applications
              close.
            </p>
            <p className="mt-4 text-gray-600">
              If you have any questions in the meantime, please feel free to
              email us at{" "}
              <a
                href="mailto:dataclub@uci.edu"
                className="text-indigo-600 hover:text-indigo-700"
              >
                dataclub@uci.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-outfit text-gray-900">
          2025 Datathon [NAME OF THEME] ~ [NAME OF EVENT]
        </h2>

        <div className="prose prose-indigo font-chillax">
          <p className="text-gray-600">[INSERT SHPEAL ABOUT DATATHON]</p>

          <div className="my-6">
            <h3 className="text-lg font-medium text-gray-900">
              Datathon Information
            </h3>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>📅 Date: April 11th - 13th, 2024</li>
              <li>📍 Location: [INSERT LOCATION]</li>
              <li>[INSERT ADDY]</li>
            </ul>
          </div>

          <div className="my-6">
            <h3 className="text-lg font-medium text-gray-900">
              Event Schedule Overview
            </h3>
            <p className="mt-2 text-gray-600">
              On April 11th, participants will have time to work on their
              project, attend workshops and socials, and network amongst our
              sponsors. On April 13th, participants will present their project
              (no more than 5 minutes) in front of our judges in order to be
              eligible for prizes.
            </p>
            <p className="mt-2 text-gray-600 italic">
              More details to come later.
            </p>
          </div>

          <div className="my-6">
            <h3 className="text-lg font-medium text-gray-900">
              Requirements for Participation
            </h3>
            <ul className="mt-2 space-y-1 text-gray-600 list-disc pl-5">
              <li>Must be at least 18 years old by the dates of Datathon</li>
              <li>
                Must be an undergraduate or graduate student at a university
              </li>
              <li>Must be able to attend in person on 4/11 and 4/13</li>
              <li>Teams of up to 4 are allowed</li>
            </ul>
          </div>

          <div className="mt-6 text-gray-600">
            <p>
              Application deadline:{" "}
              <span className="font-medium">
                March 27th, 2025 (Thursday) at 11:59 PM
              </span>
            </p>
            <p className="mt-2">
              If you have any questions, comments, or concerns feel free to
              email us at{" "}
              <a
                href="mailto:[INSERT EMAIL]"
                className="text-indigo-600 hover:text-indigo-700"
              >
                [INSERT EMAIL]
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={nextStep}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax text-lg"
          >
            Awesome! Let&apos;s start →
          </button>
        </div>
      </div>
    </div>
  );
}
