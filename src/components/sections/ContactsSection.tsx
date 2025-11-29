import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ContactsSection = () => {
  return (
    <section id="contacts" className="py-12 md:py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Свяжитесь с нами</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon name="Phone" size={24} className="text-white" />
                </div>
                <CardTitle>Телефон</CardTitle>
                <CardDescription className="text-lg">
                  <a href="tel:+79230166750" className="hover:text-primary transition-colors">
                    +7 (923) 016-67-50
                  </a>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon name="MapPin" size={24} className="text-white" />
                </div>
                <CardTitle>Адрес</CardTitle>
                <CardDescription className="text-lg">Красноярск, ул. Водопьянова, д. 1К</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon name="Clock" size={24} className="text-white" />
                </div>
                <CardTitle>Режим работы</CardTitle>
                <CardDescription className="text-lg">Пн-Вс: 8:15 - 19:45</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;