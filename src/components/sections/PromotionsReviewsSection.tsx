import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
}

interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  image: string;
  date: string;
  readTime: string;
}

interface PromotionsReviewsSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const PromotionsReviewsSection = ({ setIsBookingOpen }: PromotionsReviewsSectionProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
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
        const response = await fetch('https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        if (response.ok && data.promotions) {
          setPromotions(data.promotions.slice(0, 3));
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
      <section id="promotions" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <Link to="/promotions" className="group inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
                Акции и спецпредложения
                <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
              </h2>
            </Link>
            <p className="text-muted-foreground text-base md:text-lg">Выгодные предложения для наших клиентов</p>
          </div>
          {loadingPromotions ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="animate-spin mx-auto" size={48} />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Tag" className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Акций пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {promotions.map((promo, index) => (
              <Card
                key={promo.id}
                className="hover-scale cursor-pointer animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="gradient-accent text-lg px-3 py-1">{promo.discount}</Badge>
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={promo.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">{promo.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{promo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      {promo.oldPrice && (
                        <span className="text-muted-foreground line-through text-lg">{promo.oldPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-primary">{promo.newPrice}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} />
                      <span>Действует до: {promo.validUntil}</span>
                    </div>
                    <Button className="w-full gradient-primary btn-glow mt-4" onClick={() => setIsBookingOpen(true)}>
                      Воспользоваться
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="reviews" className="py-12 md:py-16 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
                <Icon name="Star" size={20} className="text-primary fill-primary" />
                <span className="text-sm font-semibold text-primary">ДОВЕРИЕ КЛИЕНТОВ</span>
              </div>
            </div>
            <Link to="/reviews" className="group inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
                Отзывы клиентов
                <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
              </h2>
            </Link>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Реальные истории от наших клиентов — качество, которому доверяют
            </p>
          </div>
          {loadingReviews ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="animate-spin mx-auto text-primary" size={48} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-card/50 flex items-center justify-center">
                <Icon name="MessageSquare" className="text-muted-foreground" size={48} />
              </div>
              <p className="text-muted-foreground text-lg">Отзывов пока нет</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.map((review, index) => {
                const isExpanded = expandedReviews.has(review.id);
                const shouldTruncate = review.text.length > 150;
                
                return (
                  <Card
                    key={review.id}
                    className="hover-scale animate-fade-in border-2 hover:border-primary/50 transition-all duration-300 bg-card/80 backdrop-blur"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 flex items-center gap-2">
                            {review.name}
                            <Icon name="BadgeCheck" size={16} className="text-primary" />
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex gap-0.5 bg-yellow-500/10 p-1.5 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={14}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}
                          />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Icon name="Quote" size={24} className="absolute -top-1 -left-1 text-primary/20" />
                        <p className="text-muted-foreground text-sm leading-relaxed pl-5">
                          {isExpanded || !shouldTruncate ? review.text : truncateText(review.text)}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleReviewExpansion(review.id)}
                            className="text-primary text-sm font-medium mt-2 hover:underline inline-flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                Свернуть
                                <Icon name="ChevronUp" size={14} />
                              </>
                            ) : (
                              <>
                                Ещё
                                <Icon name="ChevronDown" size={14} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Icon name="Calendar" size={12} />
                        <span>{review.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Button 
                  size="lg" 
                  variant="default" 
                  onClick={refreshReviews}
                  className="group hover:scale-105 transition-all"
                >
                  <Icon name="RefreshCw" size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Показать другие отзывы
                </Button>
                <Link to="/reviews">
                  <Button size="lg" variant="outline" className="group hover:bg-primary hover:text-primary-foreground transition-all">
                    Все отзывы
                    <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="blog" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <Link to="/blog" className="group inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
                <Icon name="Flame" size={40} className="text-orange-500" />
                Популярное
                <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
              </h2>
            </Link>
            <p className="text-muted-foreground text-base md:text-lg">Самые читаемые статьи нашего блога</p>
          </div>
          {loadingBlog ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="animate-spin mx-auto" size={48} />
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Статей пока нет</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card
                  className="hover-scale cursor-pointer animate-fade-in h-full overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div 
                    className="h-48 bg-cover bg-center rounded-t-lg relative overflow-hidden group"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${post.image})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 rounded-t-lg flex items-end p-4">
                      <Badge className="gradient-accent">{post.category}</Badge>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 z-10">
                      <Icon name="Flame" size={14} className="mr-1" />
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={post.icon as any} size={20} className="text-primary" />
                      <span className="text-sm text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {post.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          <span>{post.readTime}</span>
                        </div>
                        {viewCounts[post.id] > 0 && (
                          <div className="flex items-center gap-1">
                            <Icon name="Eye" size={14} />
                            <span>{viewCounts[post.id]}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span>Читать</span>
                        <Icon name="ArrowRight" size={14} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          )}
          {blogPosts.length > 0 && (
            <div className="text-center mt-12 animate-fade-in">
              <Link to="/blog">
                <Button variant="outline" size="lg" className="group">
                  Все статьи
                  <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PromotionsReviewsSection;