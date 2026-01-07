import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import FloatingCallButton from '@/components/FloatingCallButton';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';

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

const BlogPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'popular'>('date');
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const canonicalUrl = `https://hevsr.ru${location.pathname}`;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a');
        const data = await response.json();
        
        if (response.ok && data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const loadedCounts = localStorage.getItem('blogViewCounts');
    if (loadedCounts) {
      setViewCounts(JSON.parse(loadedCounts));
    }
  }, []);

  const incrementViewCount = (postId: number) => {
    const newCounts = { ...viewCounts, [postId]: (viewCounts[postId] || 0) + 1 };
    setViewCounts(newCounts);
    localStorage.setItem('blogViewCounts', JSON.stringify(newCounts));
  };

  const categories = ['Все', ...Array.from(new Set(posts.map(post => post.category)))];
  
  const maxViews = Math.max(...Object.values(viewCounts), 0);
  const popularThreshold = maxViews > 0 ? maxViews * 0.6 : 3;
  
  const isPopular = (postId: number) => {
    const views = viewCounts[postId] || 0;
    return views >= popularThreshold && views >= 3;
  };
  
  const filteredPosts = posts
    .filter(post => selectedCategory === 'Все' || post.category === selectedCategory)
    .filter(post => 
      searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0);
      }
      return 0;
    });

  return (
    <div className="min-h-screen">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Блог автосервиса - HEVSR" />
        <meta property="og:description" content="Полезные статьи о ремонте, обслуживании и эксплуатации автомобилей. Советы экспертов автосервиса в Красноярске." />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Блог автосервиса - HEVSR" />
        <meta name="twitter:description" content="Полезные статьи о ремонте и обслуживании автомобилей." />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Блог' }]} />
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Полезные материалы</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Блог АвтоТехЦентра</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Статьи и советы по обслуживанию и ремонту автомобилей
            </p>
          </div>

          {!loading && posts.length > 0 && (
            <>
              <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Поиск статей по названию или содержанию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-12">
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 'gradient-primary' : ''}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <div className="flex justify-center gap-2 animate-fade-in">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                    className={sortBy === 'date' ? 'gradient-primary' : ''}
                  >
                    <Icon name="Calendar" size={16} className="mr-2" />
                    По дате
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                    className={sortBy === 'popular' ? 'gradient-primary' : ''}
                  >
                    <Icon name="TrendingUp" size={16} className="mr-2" />
                    По популярности
                  </Button>
                </div>
              </div>
            </>
          )}

          {loading ? (
            <div className="text-center py-20">
              <Icon name="Loader" className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-muted-foreground">Загрузка статей...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="FileText" className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-bold mb-2">Статей пока нет</h3>
              <p className="text-muted-foreground mb-6">Скоро здесь появятся полезные материалы</p>
              <Button className="gradient-primary btn-glow" onClick={() => setIsBookingOpen(true)}>
                Записаться на обслуживание
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="Search" className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-bold mb-2">
                {searchQuery ? 'Ничего не найдено' : 'Статей в этой категории нет'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Попробуйте выбрать другую категорию'}
              </p>
              {(searchQuery || selectedCategory !== 'Все') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Все');
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {filteredPosts.map((post, index) => (
                  <Link 
                    to={`/blog/${post.id}`} 
                    key={post.id}
                    onClick={() => incrementViewCount(post.id)}
                  >
                    <Card
                      className="hover-scale cursor-pointer animate-fade-in h-full"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div 
                        className="h-48 bg-cover bg-center rounded-t-lg relative"
                        style={{ backgroundImage: `url(${post.image})` }}
                      >
                        <div className="h-full bg-gradient-to-b from-transparent to-black/60 rounded-t-lg flex items-end p-4">
                          <Badge className="gradient-accent">{post.category}</Badge>
                        </div>
                        {isPopular(post.id) && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                            <Icon name="Flame" size={14} className="mr-1" />
                            Популярное
                          </Badge>
                        )}
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

              <div className="mt-16 text-center animate-fade-in">
                <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Нужна консультация?</CardTitle>
                    <CardDescription className="text-base">
                      Запишитесь на диагностику или обслуживание — наши мастера ответят на все ваши вопросы
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="gradient-primary btn-glow" size="lg" onClick={() => setIsBookingOpen(true)}>
                      <Icon name="Calendar" className="mr-2" size={20} />
                      Записаться на обслуживание
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
      <FloatingCallButton />
      <ScrollToTopButton />
    </div>
  );
};

export default BlogPage;