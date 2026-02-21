
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import CallbackWidget from "./components/CallbackWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorLogger from "./utils/errorLogger";

// Critical pages — eager
import Index from "./pages/Index";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound404 from "./pages/NotFound404";

// All other pages — lazy
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BrandsPage = lazy(() => import("./pages/BrandsPage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const BrandModelsPage = lazy(() => import("./pages/BrandModelsPage"));
const ModelServicesPage = lazy(() => import("./pages/ModelServicesPage"));
const ServiceModelPage = lazy(() => import("./pages/ServiceModelPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const BrandServicesPage = lazy(() => import("./pages/BrandServicesPage"));
const BrandServiceDetailPage = lazy(() => import("./pages/BrandServiceDetailPage"));
const SeoIndexPage = lazy(() => import("./pages/SeoIndexPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const BonusProgramPage = lazy(() => import("./pages/BonusProgramPage"));
const WarrantyPage = lazy(() => import("./pages/WarrantyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

// Admin pages — separate lazy chunk
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminDataPage = lazy(() => import("./pages/AdminDataPage"));
const AdminModelsPage = lazy(() => import("./pages/AdminModelsPage"));
const AdminVehiclesPage = lazy(() => import("./pages/AdminVehiclesPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
const AdminBlogPage = lazy(() => import("./pages/AdminBlogPage"));
const AdminPromotionsPage = lazy(() => import("./pages/AdminPromotionsPage"));
const AdminLogsPage = lazy(() => import("./pages/AdminLogsPage"));
const Admin1CTestPage = lazy(() => import("./pages/Admin1CTestPage"));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage"));
const AdminZeonSyncPage = lazy(() => import("./pages/AdminZeonSyncPage"));
const AdminSeoGuidePage = lazy(() => import("./pages/AdminSeoGuidePage"));
const AdminSubscribersPage = lazy(() => import("./pages/AdminSubscribersPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));

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

  const maintenanceCacheRef = useRef<{ data: boolean; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    if (isPreviewMode || isAdminRoute) {
      setMaintenanceMode(false);
      return;
    }

    const checkMaintenance = async () => {
      const now = Date.now();
      if (maintenanceCacheRef.current && (now - maintenanceCacheRef.current.timestamp < CACHE_DURATION)) {
        setMaintenanceMode(maintenanceCacheRef.current.data);
        return;
      }

      try {
        const response = await fetch('https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf');
        const data = await response.json();
        maintenanceCacheRef.current = { data: data.maintenanceMode, timestamp: now };
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
            <Suspense fallback={null}>
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
                <Route path="/brands/:brandSlug/services/:serviceSlug" element={<BrandServiceDetailPage />} />
                <Route path="/services-index" element={<SeoIndexPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/bonus-program" element={<BonusProgramPage isUnderDevelopment />} />
                <Route path="/warranty" element={<WarrantyPage isUnderDevelopment />} />
                <Route path="/about" element={<AboutPage />} />
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
                <Route path="/admin/seo-guide" element={<AdminSeoGuidePage />} />
                <Route path="/admin/subscribers" element={<AdminSubscribersPage />} />
                <Route path="/unsubscribe" element={<UnsubscribePage />} />
                {/* Dynamic SEO routes - MUST be at the end before catch-all */}
                <Route path="/:brandSlug" element={<BrandModelsPage />} />
                <Route path="/:brandSlug/:modelSlug" element={<ModelServicesPage />} />
                <Route path="/:brandSlug/:modelSlug/:serviceSlug" element={<ServiceModelPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound404 />} />
              </Routes>
            </Suspense>
            <CallbackWidget />
          </MaintenanceWrapper>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;