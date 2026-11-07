import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";

export default function ComingSoonPage({ title }) {
  return (
    <>
      <PageIntro eyebrow="Part of the wider plan" title={title}>
        This area is planned for a later phase. Nothing is being presented as
        available before its real functionality is ready.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="side-note">
            <h2>Coming soon</h2>
            <p>
              This page will be connected to the store's confirmed content and
              services in a future phase.
            </p>
            <Link className="button button--primary" to="/">
              Return home
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
