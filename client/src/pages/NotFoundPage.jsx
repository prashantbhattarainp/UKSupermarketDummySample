import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";

export default function NotFoundPage() {
  return (
    <section className="page-section page-section--white">
      <PageContainer>
        <p className="eyebrow">Page not found</p>
        <h1>That page could not be found.</h1>
        <p className="section-heading__intro">
          The link may be out of date, or the page may not be part of this
          website yet.
        </p>
        <Link className="button button--primary" to="/">
          Return home
        </Link>
      </PageContainer>
    </section>
  );
}
