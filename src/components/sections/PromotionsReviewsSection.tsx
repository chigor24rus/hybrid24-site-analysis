import { useState, useEffect, startTransition } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import PromotionDetailDialog from '@/components/PromotionDetailDialog';
import PromotionsSection, { Promotion } from './home/PromotionsSection';
import BlogSection, { BlogPost } from './home/BlogSection';

import ReviewLabWidget from '@/components/ReviewLabWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PromotionsReviewsSectionProps {
  setIsBookingOpen: (open: boolean) => void;
  setBookingPromotion?: (promotion: string) => void;
}

const PromotionsReviewsSection = ({ setIsBookingOpen, setBookingPromotion }: PromotionsReviewsSectionProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isPromotionDetailOpen, setIsPromotionDetailOpen] = useState(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});



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
        const response = await fetch(`https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d?t=${timestamp}`);
        const data = await response.json();
        if (response.ok && data.promotions) {
          const now = new Date();
          const activePromotions = data.promotions.filter((promo: Promotion) => {
            if (promo.validUntil === 'Постоянно') return true;
            const validUntil = new Date(promo.validUntil);
            return validUntil > now;
          });
          setAllPromotions(activePromotions);
          const shuffled = shuffleArray(activePromotions);
          setPromotions(shuffled.slice(0, 3));
        } else {
          setAllPromotions([]);
          setPromotions([]);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setPromotions([]);
      } finally {
        setLoadingPromotions(false);
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
          setAllBlogPosts(sortedPosts);
          setBlogPosts(sortedPosts.slice(0, 3));
        } else {
          setAllBlogPosts([]);
          setBlogPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoadingBlog(false);
      }
    };

    startTransition(() => {
      fetchPromotions();
      fetchBlogPosts();
    });
  }, []);

  const refreshPromotions = () => {
    if (allPromotions.length > 0) {
      const shuffled = shuffleArray(allPromotions);
      setPromotions(shuffled.slice(0, 3));
    }
  };

  const refreshBlogPosts = () => {
    if (allBlogPosts.length > 0) {
      const shuffled = shuffleArray(allBlogPosts);
      setBlogPosts(shuffled.slice(0, 3));
    }
  };

  return (
    <>
      <Dialog open={isPromotionDetailOpen} onOpenChange={setIsPromotionDetailOpen}>
        <PromotionDetailDialog 
          promotion={selectedPromotion} 
          onBookingClick={() => {
            setIsPromotionDetailOpen(false);
            if (selectedPromotion) setBookingPromotion?.(selectedPromotion.title);
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
        onBookingClick={(promo) => {
          if (promo) setBookingPromotion?.(promo.title);
          setIsBookingOpen(true);
        }}
        onRefresh={refreshPromotions}
        hasMore={allPromotions.length > 3}
        totalCount={allPromotions.length}
      />

      <section id="reviews-live" className="py-12 md:py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-6 gradient-accent text-sm">Актуальные отзывы</Badge>
            <div className="mb-6">
              <Link 
                to="/reviews" 
                className="inline-flex items-center gap-2 text-3xl md:text-4xl lg:text-5xl font-bold hover:text-primary transition-colors group"
              >
                Что говорят о нас в интернете
                <Icon name="ArrowRight" className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Свежие отзывы из Яндекс.Карт, 2GIS и других площадок
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <ReviewLabWidget widgetId="6986979cd4927bc247d4f508" />
          </div>

          <div className="text-center mt-12">
            <Link to="/reviews">
              <Button size="lg" className="gradient-primary">
                Смотреть все отзывы
                <Icon name="ArrowRight" className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogSection
        blogPosts={blogPosts}
        loading={loadingBlog}
        viewCounts={viewCounts}
        onRefresh={refreshBlogPosts}
        hasMore={allBlogPosts.length > 3}
      />
    </>
  );
};

export default PromotionsReviewsSection;