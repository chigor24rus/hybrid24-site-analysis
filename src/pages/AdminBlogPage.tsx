import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { seedBlogPosts } from '@/utils/seedBlogPosts';
import { BlogPost, BlogSection, BlogFormData } from '@/types/blog';
import BlogPostForm from '@/components/admin/BlogPostForm';
import BlogPostCard from '@/components/admin/BlogPostCard';
import { AdminLayout, AdminPageHeader, LoadingScreen } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { API_ENDPOINTS } from '@/utils/apiClient';

const AdminBlogPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.blog.list);
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

  const handleEdit = async (post: BlogPost) => {
    // Загружаем полные данные статьи
    try {
      const response = await fetch(`https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a?id=${post.id}`);
      const data = await response.json();
      
      if (!response.ok || !data.post) {
        throw new Error('Не удалось загрузить статью');
      }
      
      const fullPost = data.post;
      setEditingPost(fullPost);
      setFormData({
        title: fullPost.title,
        excerpt: fullPost.excerpt,
        category: fullPost.category,
        icon: fullPost.icon,
        image: fullPost.image,
        date: fullPost.date,
        readTime: fullPost.readTime,
        intro: fullPost.content.intro,
        sections: fullPost.content.sections,
        conclusion: fullPost.content.conclusion
      });
      setDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные статьи',
        variant: 'destructive'
      });
    }
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



  const handleImportDemoPosts = async () => {
    if (!confirm('Загрузить 6 демо-статей в блог? Это добавит готовые примеры статей.')) return;
    
    setImporting(true);
    try {
      const results = await seedBlogPosts();
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        toast({
          title: 'Успешно',
          description: `Загружено статей: ${successCount} из ${results.length}`
        });
        fetchPosts();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить статьи',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при импорте',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <AdminPageHeader
            title="Управление блогом"
            actions={
              <>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  <Icon name="ArrowLeft" className="mr-2" size={18} />
                  Назад
                </Button>
                <Button variant="outline" onClick={logout}>
                  <Icon name="LogOut" className="mr-2" size={18} />
                  Выйти
                </Button>
              </>
            }
          />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Статьи блога</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleImportDemoPosts}
                  disabled={importing}
                >
                  {importing ? (
                    <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                  ) : (
                    <Icon name="Download" className="mr-2" size={18} />
                  )}
                  Импорт демо-статей
                </Button>
                <BlogPostForm
                  dialogOpen={dialogOpen}
                  setDialogOpen={setDialogOpen}
                  editingPost={editingPost}
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmit={handleSubmit}
                  resetForm={resetForm}
                  addSection={addSection}
                  updateSection={updateSection}
                  removeSection={removeSection}
                />
              </div>
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
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogPage;