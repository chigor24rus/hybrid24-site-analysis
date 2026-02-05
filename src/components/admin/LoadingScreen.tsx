import Icon from '@/components/ui/icon';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Icon name="Loader" className="animate-spin" size={48} />
    </div>
  );
};
