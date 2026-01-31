import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  image: string;
  date: string;
  readTime: string;
}

interface BlogSectionProps {
  blogPosts: BlogPost[];
  loading: boolean;
  viewCounts: Record<number, number>;
}

const BlogSection = ({ blogPosts, loading, viewCounts }: BlogSectionProps) => {
  return (
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
        {loading ? (
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
  );
};

export default BlogSection;
