import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BlogSection {
  title: string;
  text: string;
  list?: string[];
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
  content: {
    intro: string;
    sections: BlogSection[];
    conclusion: string;
  };
}

const AdminBlogPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    icon: 'FileText',
    image: '',
    date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    readTime: '5 мин',
    intro: '',
    sections: [] as BlogSection[],
    conclusion: ''
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (!isAuthenticated || !authTime) {
      navigate('/admin/login');
      return;
    }
    
    const hoursSinceAuth = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
    if (hoursSinceAuth > 24) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthTime');
      navigate('/admin/login');
      return;
    }

    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статьи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = 'https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a';
      const method = editingPost ? 'PUT' : 'POST';
      
      const body = {
        ...(editingPost && { id: editingPost.id }),
        title: formData.title,
        excerpt: formData.excerpt,
        category: formData.category,
        icon: formData.icon,
        image: formData.image,
        date: formData.date,
        readTime: formData.readTime,
        content: {
          intro: formData.intro,
          sections: formData.sections,
          conclusion: formData.conclusion
        }
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Ошибка сохранения');

      toast({
        title: 'Успешно',
        description: editingPost ? 'Статья обновлена' : 'Статья создана'
      });

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить статью',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту статью?')) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a?id=${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Ошибка удаления');

      toast({
        title: 'Успешно',
        description: 'Статья удалена'
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить статью',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      icon: post.icon,
      image: post.image,
      date: post.date,
      readTime: post.readTime,
      intro: post.content.intro,
      sections: post.content.sections,
      conclusion: post.content.conclusion
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      excerpt: '',
      category: '',
      icon: 'FileText',
      image: '',
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      readTime: '5 мин',
      intro: '',
      sections: [],
      conclusion: ''
    });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', text: '', list: [] }]
    });
  };

  const updateSection = (index: number, field: keyof BlogSection, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Управление блогом</h1>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="pl-0">
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              Назад в админ-панель
            </Button>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="mr-2" size={18} />
            Выйти
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Статьи блога</span>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить статью
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? 'Редактировать статью' : 'Новая статья'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Заголовок</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Краткое описание</Label>
                      <Textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Категория</Label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Советы, Диагностика..."
                          required
                        />
                      </div>
                      <div>
                        <Label>Иконка</Label>
                        <Input
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="FileText, Snowflake..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label>URL изображения</Label>
                      <Input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Дата</Label>
                        <Input
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          placeholder="10 декабря 2025"
                          required
                        />
                      </div>
                      <div>
                        <Label>Время чтения</Label>
                        <Input
                          value={formData.readTime}
                          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                          placeholder="5 мин"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Введение</Label>
                      <Textarea
                        value={formData.intro}
                        onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Разделы статьи</Label>
                        <Button type="button" size="sm" onClick={addSection}>
                          <Icon name="Plus" className="mr-1" size={14} />
                          Добавить раздел
                        </Button>
                      </div>
                      {formData.sections.map((section, index) => (
                        <Card key={index} className="p-4 mb-3">
                          <div className="flex justify-between items-start mb-3">
                            <Label>Раздел {index + 1}</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSection(index)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                          <Input
                            placeholder="Заголовок раздела"
                            value={section.title}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            className="mb-2"
                          />
                          <Textarea
                            placeholder="Текст раздела"
                            value={section.text}
                            onChange={(e) => updateSection(index, 'text', e.target.value)}
                            rows={2}
                            className="mb-2"
                          />
                          <Textarea
                            placeholder="Список пунктов (каждый с новой строки)"
                            value={section.list?.join('\n') || ''}
                            onChange={(e) => updateSection(
                              index,
                              'list',
                              e.target.value.split('\n').filter(item => item.trim())
                            )}
                            rows={3}
                          />
                        </Card>
                      ))}
                    </div>

                    <div>
                      <Label>Заключение</Label>
                      <Textarea
                        value={formData.conclusion}
                        onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingPost ? 'Сохранить' : 'Создать'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Статей пока нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name={post.icon as any} size={20} className="text-primary" />
                            <span className="text-sm text-muted-foreground">{post.category}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                          <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{post.date}</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBlogPage;
