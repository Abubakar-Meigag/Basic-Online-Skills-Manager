import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyMagicLink } from "../../auth/authApi";

const styles = {
  container: "min-h-screen bg-gray-50 flex items-center justify-center p-6",
  card: "w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center",
  errorTitle: "text-xl font-bold text-red-600 mb-2",
  errorMessage: "text-sm text-gray-600 mb-6",
  backButton: "text-xs text-gray-500 hover:text-gray-800 underline",
  loadingTitle: "text-xl font-bold text-gray-900 mb-2",
  loadingMessage: "text-sm text-gray-500",
} as const;

export default function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Invalid or missing verification link.");
      return;
    }

    verifyMagicLink(token)
      .then((data) => {
        // Save JWT session token & user info in localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Redirect to the route returned by backend
        navigate(data.redirectRoute || "/");
      })
      .catch((err: any) => {
        setError(
          err.response?.data?.message ||
            "Verification failed or link has expired.",
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {error ? (
          <div>
            <h2 className={styles.errorTitle}>Authentication Error</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={() => navigate("/login")}
              className={styles.backButton}
            >
              ← Back to login
            </button>
          </div>
        ) : (
          <div>
            <h2 className={styles.loadingTitle}>Verifying Magic Link...</h2>
            <p className={styles.loadingMessage}>
              Please wait while we log you in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
