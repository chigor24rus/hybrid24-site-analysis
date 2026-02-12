import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceModelHero from '@/components/service-model/ServiceModelHero';
import ServiceDetailsCards from '@/components/service-model/ServiceDetailsCards';
import ServiceDescription from '@/components/service-model/ServiceDescription';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  brand_name: string;
  name: string;
  year_from: number | null;
  year_to: number | null;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
}

const ServiceModelPage = () => {
  const { brandSlug, modelSlug, serviceSlug } = useParams<{ brandSlug: string; modelSlug: string; serviceSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, modelsRes, servicesRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [brandsData, modelsData, servicesData, pricesData] = await Promise.all([
          brandsRes.json(),
          modelsRes.json(),
          servicesRes.json(),
          pricesRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const models: Model[] = modelsData.models || [];
        const services: Service[] = servicesData.services || [];
        const prices: Price[] = pricesData.prices || [];

        const foundBrand = brands.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === brandSlug);
        const foundModel = models.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug && m.brand_id === foundBrand?.id);
        const foundService = services.find(s => s.title.toLowerCase().replace(/\s+/g, '-') === serviceSlug);

        if (!foundBrand || !foundModel || !foundService) {
          navigate('/404');
          return;
        }

        const foundPrice = prices.find(p => 
          p.brand_id === foundBrand.id && 
          p.service_id === foundService.id
        );

        setBrand(foundBrand);
        setModel(foundModel);
        setService(foundService);
        setPrice(foundPrice || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, modelSlug, serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!brand || !model || !service) {
    return null;
  }

  const pageTitle = `${service.title} ${brand.name} ${model.name} в Красноярске`;
  const pageDescription = `${service.title} для ${brand.name} ${model.name}${model.year_from ? ` (${model.year_from}${model.year_to ? `-${model.year_to}` : '+'} г.)` : ''}. ${service.description} Цена: ${price?.price || service.price}. Время работы: ${service.duration}.`;
  const finalPrice = price?.price || service.price;
  
  const priceValue = finalPrice.replace(/[^\d]/g, '');
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pageTitle,
    "description": pageDescription,
    "brand": {
      "@type": "Brand",
      "name": brand.name
    },
    "model": model.name,
    "offers": {
      "@type": "Offer",
      "url": `${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`,
      "priceCurrency": "RUB",
      "price": priceValue,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoRepair",
        "name": SITE_CONFIG.name,
        "telephone": SITE_CONFIG.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": SITE_CONFIG.address.street,
          "addressLocality": SITE_CONFIG.address.locality,
          "addressCountry": SITE_CONFIG.address.country
        }
      }
    },
    "category": service.title,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {SITE_CONFIG.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={priceValue} />
        <meta property="og:price:currency" content="RUB" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <ServiceModelHero 
        brand={brand}
        model={model}
        service={service}
        finalPrice={finalPrice}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ServiceDetailsCards
              brand={brand}
              model={model}
              service={service}
              price={price}
              finalPrice={finalPrice}
              onBookingClick={() => setIsBookingOpen(true)}
            />

            <ServiceDescription
              brand={brand}
              model={model}
              service={service}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ServiceModelPage;
