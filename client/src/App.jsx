import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FaqsPage from "./pages/FaqsPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";
import StoreInformationPage from "./pages/StoreInformationPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import PromotionsPage from "./pages/PromotionsPage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OwnerPlaceholderPage from "./pages/OwnerPlaceholderPage";
import OwnerProductsPage from "./pages/OwnerProductsPage";
import OwnerCategoriesPage from "./pages/OwnerCategoriesPage";
import OwnerPromotionsPage from "./pages/OwnerPromotionsPage";
import ServicesPage from "./pages/ServicesPage";
import OwnerStorePage from "./pages/OwnerStorePage";
import ReviewsPage from "./pages/ReviewsPage";
import FeedbackPage from "./pages/FeedbackPage";
import OwnerReviewsPage from "./pages/OwnerReviewsPage";
import OwnerLayout from "./layouts/OwnerLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { storeConfig } from "./data/storeConfig";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";

const pageTitles = {
  "/": "Home",
  "/about": "About",
  "/visit": "Visit the shop",
  "/contact": "Contact",
  "/feedback": "Suggestions & Feedback",
  "/suggestions": "Suggestions & Feedback",
  "/privacy": "Privacy",
  "/faqs": "FAQs",
  "/products": "Our groceries",
  "/offers": "Offers",
  "/reviews": "Customer Reviews",
};

function DocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const title = pageTitles[location.pathname] ?? "Coming soon";
    document.title = `${title} | ${storeConfig.name}`;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <DocumentTitle />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/visit" element={<StoreInformationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/offers" element={<PromotionsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/suggestions" element={<FeedbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<OwnerLayout />}>
              <Route path="/owner" element={<OwnerDashboardPage />} />
              <Route path="/owner/products" element={<OwnerProductsPage />} />
              <Route
                path="/owner/categories"
                element={<OwnerCategoriesPage />}
              />
              <Route
                path="/owner/promotions"
                element={<OwnerPromotionsPage />}
              />
              <Route path="/owner/store" element={<OwnerStorePage />} />
              <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
            </Route>
          </Route>
        </Routes>
      </StoreProvider>
    </AuthProvider>
  );
}
