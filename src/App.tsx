
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PromotionsPage from "./pages/PromotionsPage";
import ReviewsPage from "./pages/ReviewsPage";
import BlogPage from "./pages/BlogPage";
import BrandPage from "./pages/BrandPage";
import BrandsPage from "./pages/BrandsPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDataPage from "./pages/AdminDataPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminBlogPage from "./pages/AdminBlogPage";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brand/:brandId" element={<BrandPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/data" element={<AdminDataPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;