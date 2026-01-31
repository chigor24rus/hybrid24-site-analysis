import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import PromotionDetailDialog from '@/components/PromotionDetailDialog';
import PromotionsSection, { Promotion } from './home/PromotionsSection';
import ReviewsSection, { Review } from './home/ReviewsSection';
import BlogSection, { BlogPost } from './home/BlogSection';

interface PromotionsReviewsSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const PromotionsReviewsSection = ({ setIsBookingOpen }: PromotionsReviewsSectionProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isPromotionDetailOpen, setIsPromotionDetailOpen] = useState(false);
  
  useEffect(() => {
    if (allReviews.length > 0 && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'schema-reviews';
      
      const reviewsSchema = allReviews.slice(0, 10).map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.name
        },
        "datePublished": review.date,
        "reviewBody": review.text,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        }
      }));
      
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AutoRepair",
        "name": "HEVSeRvice",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1),
          "reviewCount": allReviews.length,
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": reviewsSchema
      });
      
      const existingScript = document.getElementById('schema-reviews');
      if (existingScript) {
        existingScript.remove();
      }
      document.head.appendChild(script);
      
      return () => {
        const scriptToRemove = document.getElementById('schema-reviews');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [allReviews]);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const [expandedReviews, setExpandedReviews] = useState<Set<number | string>>(new Set());

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d?t=${timestamp}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        if (response.ok && data.promotions) {
          const now = new Date();
          const activePromotions = data.promotions.filter((promo: Promotion) => {
            const validUntil = new Date(promo.validUntil);
            return validUntil > now;
          });
          setPromotions(activePromotions.slice(0, 3));
        } else {
          setPromotions([]);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setPromotions([]);
      } finally {
        setLoadingPromotions(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce');
        const data = await response.json();
        
        if (response.ok && data.reviews && data.reviews.length > 0) {
          setAllReviews(data.reviews);
          const shuffledReviews = shuffleArray(data.reviews);
          setReviews(shuffledReviews.slice(0, 3));
        } else {
          setAllReviews([]);
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    const fetchBlogPosts = async () => {
      try {
        const loadedCounts = localStorage.getItem('blogViewCounts');
        const counts: Record<number, number> = loadedCounts ? JSON.parse(loadedCounts) : {};
        setViewCounts(counts);

        const response = await fetch('https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a');
        const data = await response.json();
        
        if (response.ok && data.posts && data.posts.length > 0) {
          const sortedPosts = [...data.posts].sort((a, b) => {
            return (counts[b.id] || 0) - (counts[a.id] || 0);
          });
          setBlogPosts(sortedPosts.slice(0, 3));
        } else {
          setBlogPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoadingBlog(false);
      }
    };

    fetchPromotions();
    fetchReviews();
    fetchBlogPosts();
  }, []);

  const toggleReviewExpansion = (reviewId: number | string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const refreshReviews = () => {
    if (allReviews.length > 0) {
      const shuffledReviews = shuffleArray(allReviews);
      setReviews(shuffledReviews.slice(0, 3));
      setExpandedReviews(new Set());
    }
  };

  return (
    <>
      <Dialog open={isPromotionDetailOpen} onOpenChange={setIsPromotionDetailOpen}>
        <PromotionDetailDialog 
          promotion={selectedPromotion} 
          onBookingClick={() => {
            setIsPromotionDetailOpen(false);
            setIsBookingOpen(true);
          }}
        />
      </Dialog>

      <PromotionsSection
        promotions={promotions}
        loading={loadingPromotions}
        onPromotionClick={(promo) => {
          setSelectedPromotion(promo);
          setIsPromotionDetailOpen(true);
        }}
        onBookingClick={() => setIsBookingOpen(true)}
      />

      <ReviewsSection
        reviews={reviews}
        loading={loadingReviews}
        expandedReviews={expandedReviews}
        onToggleExpand={toggleReviewExpansion}
        onRefresh={refreshReviews}
        truncateText={truncateText}
      />

      <BlogSection
        blogPosts={blogPosts}
        loading={loadingBlog}
        viewCounts={viewCounts}
      />
    </>
  );
};

export default PromotionsReviewsSection;