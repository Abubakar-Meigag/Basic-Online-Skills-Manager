import React, { useState } from "react";

const styles = {
  pageWrapper:
    "min-h-screen bg-gray-50 flex flex-col justify-between p-6 md:p-10",
  container: "flex-1 flex items-center justify-center py-6",
  card: "w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 text-center flex flex-col items-center",

  cyfBadge:
    "bg-gray-100 font-extrabold text-xs px-3.5 py-1.5 rounded-md mb-6 tracking-wide uppercase select-none inline-flex items-center",
  badgeRed: "text-[#EE2A24]",
  badgePurple: "text-[#2D2D68]",

  // Headings & Branding
  headerWrapper: "w-full",
  logoContainer: "inline-block select-none",
  logoImage: "h-11 w-auto object-contain",
  heading: "text-2xl font-bold text-gray-900 mb-2",
  subheading: "text-sm text-gray-500 mb-8 font-normal",
  formWrapper: "w-full",

  // Form layout
  form: "w-full flex flex-col gap-5 text-left",
  label:
    "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5",

  input: (hasError: boolean) =>
    `w-full px-4 py-3 text-sm text-gray-900 border rounded-lg focus:outline-none transition-all placeholder:text-gray-400 ${
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    }`,

  errorMessage: "mt-1.5 text-xs text-red-600 font-medium",

  // Primary Action Button
  submitButton:
    "w-full mt-2 bg-[#EE2A24] hover:bg-[#d6211b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 cursor-pointer shadow-sm active:scale-[0.99]",

  // Helper footer text inside form
  helperText: "text-xs text-gray-400 text-center mt-3 leading-relaxed",

  // Success state styles
  backButton:
    "mt-4 text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer",
  successWrapper: "text-center py-4 flex flex-col items-center gap-3 w-full",
  successTitle: "text-lg font-bold text-gray-900 mt-2",
  successText: "text-gray-600 text-sm leading-relaxed",
  emailHighlight: "font-semibold text-gray-900",
  expiryBadge:
    "text-xs text-gray-600 font-medium bg-gray-100 px-3.5 py-2 rounded-md mt-2",

  footerWrapper: "w-full py-2",
};

export default function MagicLinkLogin() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const validateEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const handleSubmit = (e: React.SubmitEvent): void => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }

    setError("");
    setIsSubmitted(true);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Left Official CYF Logo Image */}
      <header className={styles.headerWrapper}>
        <div className={styles.logoContainer}>
          <img
            src="https://codeyourfuture.io/wp-content/uploads/2019/03/cyf_brand.png"
            alt="Code Your Future"
            className={styles.logoImage}
          />
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className={styles.container}>
        <div className={styles.card}>
          {/* CYF Badge */}
          <div className={styles.cyfBadge}>
            <span className={styles.badgeRed}>C</span>
            <span className={styles.badgePurple}>YF</span>
          </div>

          <h1 className={styles.heading}>Basic Online Skills Manager</h1>

          {!isSubmitted ? (
            /* Form View */
            <div className={styles.formWrapper}>
              <p className={styles.subheading}>Sign in to your account</p>

              <form onSubmit={handleSubmit} noValidate className={styles.form}>
                <div>
                  <label htmlFor="email" className={styles.label}>
                    Work Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@organisation.gov.au"
                    className={styles.input(!!error)}
                  />
                  {error && <p className={styles.errorMessage}>{error}</p>}
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send Login Link
                </button>

                <p className={styles.helperText}>
                  We will email you a secure, one-time sign-in link. No password
                  required.
                </p>
              </form>
            </div>
          ) : (
            /* Success View */
            <div className={styles.successWrapper}>
              <h2 className={styles.successTitle}>Check your inbox</h2>
              <p className={styles.successText}>
                We emailed a link to{" "}
                <span className={styles.emailHighlight}>{email}</span>. If not
                found check your Spam.
              </p>
              <p className={styles.expiryBadge}>Link expires in 5 minutes.</p>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className={styles.backButton}
              >
                ← Back to login
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Empty footer space to keep card vertically centered */}
      <footer className={styles.footerWrapper}></footer>
    </div>
  );
}
