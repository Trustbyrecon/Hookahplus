import SignInForm from "./signin-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl || "/";
  return <SignInForm callbackUrl={callbackUrl} />;
}

