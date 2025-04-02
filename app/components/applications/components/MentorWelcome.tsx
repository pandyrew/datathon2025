type WelcomeStepProps = {
  nextStep: () => void;
  isSubmitted: boolean;
};

export default function MentorWelcome({
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
              Thank you for submitting your mentor application! We will review
              all applications and send out decisions shortly after applications
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
          Data @ UCI Datathon 2025 Mentor Application
        </h2>

        <div className="prose prose-indigo font-chillax">
          <p className="text-gray-600">
            📊 Thank you for your interest in being a mentor for the third
            annual collegiate Datathon at UC Irvine! 📊
          </p>

          <p className="mt-4 text-gray-600">
            We plan to bring students from across UCI and Orange County to work
            on innovative data projects that showcase their analytical skills
            and passion for data. Attendants will be able to analyze datasets
            provided by a variety of companies and tackle exciting data
            challenges.
          </p>

          <div className="my-6">
            <h3 className="text-lg font-medium text-gray-900">
              Event Information
            </h3>
            <p className="mt-2 text-gray-600">
              The Datathon will occur April 11 - 13 at the Interdisciplinary
              Science and Engineering Building (ISEB). Mentors will only be
              needed Saturday, April 13. Detailed schedule and times will be
              available later.
            </p>
          </div>

          <div className="my-6">
            <h3 className="text-lg font-medium text-gray-900">
              Requirements for Mentors
            </h3>
            <ul className="mt-2 space-y-1 text-gray-600 list-disc pl-5">
              <li>Skills in Python, Pandas, R, or SQL</li>
              <li>Ability to offer help in-person</li>
              <li>Great attitude 😁👍</li>
              <li>Able to attend in-person on Saturday, April 13</li>
            </ul>
          </div>

          <div className="mt-6 text-gray-600">
            <p>
              Application deadline:{" "}
              <span className="font-medium">Friday, April 4th</span>
            </p>
            <p className="mt-2">
              If you have any questions, please feel free to email us at{" "}
              <a
                href="mailto:dataclub@uci.edu"
                className="text-indigo-600 hover:text-indigo-700"
              >
                dataclub@uci.edu
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
            Let&apos;s begin →
          </button>
        </div>
      </div>
    </div>
  );
}
