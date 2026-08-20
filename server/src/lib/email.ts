import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize SES client configured for CYF's Ireland region
const sesClient = new SESClient({ region: "eu-west-1" });

// Helper function to build the verification link and deliver the magic link email
export async function sendMagicLinkEmail(
  email: string,
  token: string,
): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const magicLink = `${clientUrl}/verify?token=${token}`;
  const safeEmail = email.replace(/[\n\r]/g, "_");

  // development Log to terminal
  if (process.env.NODE_ENV !== "production") {
    console.log(`MAGIC LINK GENERATED FOR: ${safeEmail}`);
    console.log(`CLICK TO LOGIN: ${magicLink}`);
    console.log("EXPIRES IN: 5 min");
    return;
  }

  // Production Send email via AWS SES
  const command = new SendEmailCommand({
    Source: "noreply@cyf.academy",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: { Data: "Your Login Link" },
      Body: {
        Html: {
          Data: `
            <h2>Log in to Basic Online SKills Manager</h2>
            <p>Click the link below to sign in to your account. This link will expire in 5 minutes.</p>
            <p><a href="${magicLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Click Here to Log In</a></p>
          `,
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Magic link email successfully sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email via AWS SES:", error);
    throw new Error("Could not deliver magic link email.");
  }
}
