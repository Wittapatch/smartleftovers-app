export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  // Convert technical Firebase/backend errors into messages that are safe to show users.
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const message = rawMessage.toLowerCase();

  if (message.includes("auth/invalid-credential")) {
    return "The email or password is incorrect.";
  }

  if (message.includes("auth/email-already-in-use")) {
    return "An account with this email already exists.";
  }

  if (message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("auth/weak-password")) {
    return "Please use a stronger password.";
  }

  if (message.includes("auth/requires-recent-login")) {
    return "Please log out, log back in, and try again.";
  }

  if (message.includes("network") || message.includes("failed to fetch")) {
    return "Could not connect to the server. Please check your connection and try again.";
  }

  if (
    message.includes("server returned") ||
    message.includes("traceback") ||
    message.includes("pymongo") ||
    message.includes("json") ||
    message.includes("500")
  ) {
    return "Something went wrong on the server. Please try again.";
  }

  return fallback;
}
