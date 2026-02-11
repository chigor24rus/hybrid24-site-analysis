
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import CallbackWidget from "./components/CallbackWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorLogger from "./utils/errorLogger";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import PromotionsPage from "./pages/PromotionsPage";
import ReviewsPage from "./pages/ReviewsPage";

import BlogPage from "./pages/BlogPage";
import BrandPage from "./pages/BrandPage";
import BrandsPage from "./pages/BrandsPage";
import BrandModelsPage from "./pages/BrandModelsPage";
import ModelServicesPage from "./pages/ModelServicesPage";
import BlogPostPage from "./pages/BlogPostPage";
import ServiceModelPage from "./pages/ServiceModelPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BrandServicesPage from "./pages/BrandServicesPage";
import SeoIndexPage from "./pages/SeoIndexPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDataPage from "./pages/AdminDataPage";
import AdminModelsPage from "./pages/AdminModelsPage";
import AdminVehiclesPage from "./pages/AdminVehiclesPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

import AdminBlogPage from "./pages/AdminBlogPage";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import Admin1CTestPage from "./pages/Admin1CTestPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminZeonSyncPage from "./pages/AdminZeonSyncPage";
import MaintenancePage from "./pages/MaintenancePage";
import LegalPage from "./pages/LegalPage";
import BonusProgramPage from "./pages/BonusProgramPage";
import WarrantyPage from "./pages/WarrantyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

ErrorLogger.getInstance();

const MaintenanceWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPreviewMode = window.location.hostname.includes('poehali.dev');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Skip maintenance check for preview mode (poehali.dev) and admin routes
    if (isPreviewMode || isAdminRoute) {
      setMaintenanceMode(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf');
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        setMaintenanceMode(false);
      }
    };

    checkMaintenance();
  }, [location.pathname, isPreviewMode, isAdminRoute]);

  if (maintenanceMode === null) {
    return null;
  }

  if (maintenanceMode && !isAdminRoute && !isPreviewMode) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <MaintenanceWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />

            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brand/:brandId" element={<BrandPage />} />
            <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
            <Route path="/brands/:brandSlug/services" element={<BrandServicesPage />} />
            <Route path="/services-index" element={<SeoIndexPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/bonus-program" element={<BonusProgramPage />} />
            <Route path="/warranty" element={<WarrantyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/data" element={<AdminDataPage />} />
            <Route path="/admin/models" element={<AdminModelsPage />} />
            <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />

            <Route path="/admin/blog" element={<AdminBlogPage />} />
            <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
            <Route path="/admin/1c-test" element={<Admin1CTestPage />} />
            <Route path="/admin/zeon-sync" element={<AdminZeonSyncPage />} />
            {/* Dynamic SEO routes - MUST be at the end before catch-all */}
            <Route path="/:brandSlug" element={<BrandModelsPage />} />
            <Route path="/:brandSlug/:modelSlug" element={<ModelServicesPage />} />
            <Route path="/:brandSlug/:modelSlug/:serviceSlug" element={<ServiceModelPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CallbackWidget />
          </MaintenanceWrapper>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;