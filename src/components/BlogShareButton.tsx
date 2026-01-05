import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface BlogShareButtonProps {
  title: string;
  excerpt?: string;
}

const BlogShareButton = ({ title, excerpt = '' }: BlogShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const currentUrl = window.location.href;
  const shareText = `${title}\n\n${excerpt}\n\nЧитать полностью: ${currentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success('Ссылка скопирована!');
    setOpen(false);
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(currentUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`;
        break;
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${encodedUrl}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(excerpt)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="Share2" size={16} />
          Поделиться
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <p className="text-sm font-semibold mb-3">Поделиться статьей</p>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('whatsapp')}
          >
            <Icon name="MessageCircle" size={18} className="text-green-600" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('telegram')}
          >
            <Icon name="Send" size={18} className="text-blue-500" />
            Telegram
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('vk')}
          >
            <Icon name="Users" size={18} className="text-blue-600" />
            ВКонтакте
          </Button>
          
          <div className="border-t pt-2 mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <Icon name="Copy" size={18} />
              Скопировать ссылку
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BlogShareButton;
