import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  console.log("Reset token:", token);

  // ...
}