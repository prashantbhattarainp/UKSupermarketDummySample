import { useState } from "react";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import StatusPanel from "../components/StatusPanel";
import { useStoreContent } from "../context/StoreContext";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const { store } = useStoreContent();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter your name.";
    if (!form.email.trim()) nextErrors.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email =
        "Enter an email address in the format name@example.com.";
    if (!form.subject.trim()) nextErrors.subject = "Enter a subject.";
    if (!form.message.trim()) nextErrors.message = "Enter a message.";
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    setErrors(validate());
  }

  return (
    <>
      <PageIntro eyebrow="Get in touch" title="Contact the shop">
        The enquiry form is ready for a future secure backend. This development
        version does not send or store messages.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="two-column">
            <div>
              <h2>Send an enquiry</h2>
              <StatusPanel title="Not available in this development version">
                Your information stays in this form. No request is sent, and
                nothing is saved in your browser.
              </StatusPanel>
              <form
                className="form"
                onSubmit={handleSubmit}
                noValidate
                style={{ marginTop: "1.5rem" }}
              >
                {attempted && Object.keys(errors).length === 0 && (
                  <p className="field__error" role="alert">
                    The form is valid, but sending is not available until the
                    backend is implemented.
                  </p>
                )}
                <p className="form__note">
                  Fields marked <span className="required">*</span> are
                  required.
                </p>
                <FormField
                  label="Name"
                  name="name"
                  value={form.name}
                  error={errors.name}
                  onChange={updateField}
                />
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  error={errors.email}
                  onChange={updateField}
                />
                <FormField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  error={errors.subject}
                  onChange={updateField}
                />
                <FormField
                  label="Message"
                  name="message"
                  value={form.message}
                  error={errors.message}
                  onChange={updateField}
                  textarea
                />
                <button className="button button--primary" type="submit">
                  Check your message
                </button>
              </form>
            </div>
            <aside className="side-note">
              <h3>Contact details</h3>
              {store.phone || store.email ? (
                <p>
                  Sample telephone and email details are shown on the
                  store-information page. They are fictional demonstration
                  values.
                </p>
              ) : (
                <p>
                  Telephone and email details will appear here when configured.
                </p>
              )}
            </aside>
          </div>
        </PageContainer>
      </section>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  textarea = false,
}) {
  const errorId = `${name}-error`;
  const props = {
    id: name,
    name,
    value,
    onChange,
    required: true,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}{" "}
        <span className="required" aria-hidden="true">
          *
        </span>
      </label>
      {textarea ? <textarea {...props} /> : <input {...props} type={type} />}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
