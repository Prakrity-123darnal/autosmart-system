import FormInput from "../components/FormInput";

function LoginPage() {
  return (
    <section className="auth-wrapper">
      <form className="auth-form">
        <h2>Login</h2>
        <p className="subtle-text">Welcome back. Enter your credentials.</p>
        <FormInput label="Email" type="email" placeholder="you@example.com" />
        <FormInput label="Password" type="password" placeholder="********" />
        <button className="btn-primary" type="button">Login</button>
      </form>
    </section>
  );
}

export default LoginPage;
