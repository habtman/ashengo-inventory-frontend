import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  console.log("Current URL:", window.location.href);
  console.log("Query string:", window.location.search);

  const token = searchParams.get("token");

  console.log("Reset token:", token);

  return (
    <div>
      <h1>Reset Password</h1>
      <p>Token: {token ? "Received" : "Missing"}</p>
    </div>
  );
}