import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import PromotionCard from "../components/PromotionCard";
import EmptyState from "../components/EmptyState";
import { useEffect, useState } from "react";
import { fetchPublicPromotions } from "../services/promotionApi";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicPromotions()
      .then(setPromotions)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageIntro eyebrow="Fictional offers" title="Example promotions">
        A small set of fictional promotion examples for the Deepak Supermarket
        catalogue. These are not live offers.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="promotion-list">
            <h2>Current examples</h2>
            {loading ? (
              <p className="owner-placeholder" role="status">
                Loading current promotions…
              </p>
            ) : error ? (
              <div className="empty-state" role="alert">
                <h2>Promotions are unavailable.</h2>
                <p>{error}</p>
              </div>
            ) : promotions.length ? (
              promotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  status="active"
                />
              ))
            ) : (
              <EmptyState title="No example promotions are active.">
                There are no date-valid fictional offers to show at the moment.
              </EmptyState>
            )}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
