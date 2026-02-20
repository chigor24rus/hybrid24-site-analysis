import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceModelHero from '@/components/service-model/ServiceModelHero';
import ServiceDetailsCards from '@/components/service-model/ServiceDetailsCards';
import ServiceDescription from '@/components/service-model/ServiceDescription';
import { SITE_CONFIG } from '@/config/site';
import { slugify } from '@/utils/slugify';

interface Brand {
  id: number;
  name: string;
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

interface RawPrice {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
}

export default function BrandServiceDetailPage() {
  const { brandSlug, serviceSlug } = useParams<{ brandSlug: string; serviceSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, servicesRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [brandsData, servicesData, pricesData] = await Promise.all([
          brandsRes.json(),
          servicesRes.json(),
          pricesRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const services: Service[] = servicesData.services || [];
        const rawPrices: RawPrice[] = pricesData.prices || [];

        const foundBrand = brands.find(b => slugify(b.name) === brandSlug);
        const foundService = services.find(s => slugify(s.title) === serviceSlug);

        if (!foundBrand || !foundService) {
          navigate('/404');
          return;
        }

        const rawPrice = rawPrices.find(
          p => p.service_id === foundService.id && p.brand_id === foundBrand.id
        );

        const mappedPrice: Price | null = rawPrice
          ? {
              id: rawPrice.id,
              brand_id: rawPrice.brand_id,
              model_id: null,
              service_id: rawPrice.service_id,
              price: `${rawPrice.base_price} ${rawPrice.currency}`,
            }
          : null;

        setBrand(foundBrand);
        setService(foundService);
        setPrice(mappedPrice);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!brand || !service) return null;

  const finalPrice = price?.price || service.price;
  const priceValue = finalPrice.replace(/[^\d]/g, '');

  const fakeModel = {
    id: 0,
    brand_id: brand.id,
    brand_name: brand.name,
    name: '',
    year_from: null,
    year_to: null,
  };

  const pageTitle = `${service.title} ${brand.name} в Красноярске`;
  const pageDescription = `${service.title} для ${brand.name} в Красноярске. ${service.description}. Цена: ${finalPrice}. Время работы: ${service.duration}. Запись онлайн!`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pageTitle,
    "description": pageDescription,
    "brand": { "@type": "Brand", "name": brand.name },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_CONFIG.domain}/brands/${brandSlug}/services/${serviceSlug}`,
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
        <meta name="keywords" content={`${service.title} ${brand.name}, ${service.title} Красноярск, автосервис ${brand.name}, СТО ${brand.name}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/brands/${brandSlug}/services/${serviceSlug}`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/brands/${brandSlug}/services/${serviceSlug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={priceValue} />
        <meta property="og:price:currency" content="RUB" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <ServiceModelHero
        brand={brand}
        model={fakeModel}
        service={service}
        finalPrice={finalPrice}
        breadcrumbs={[
          { label: 'Бренды', path: '/brands' },
          { label: brand.name, path: `/brands/${brandSlug}/services` },
          { label: service.title },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ServiceDetailsCards
              brand={brand}
              model={fakeModel}
              service={service}
              price={price}
              finalPrice={finalPrice}
              onBookingClick={() => setIsBookingOpen(true)}
            />

            <ServiceDescription
              brand={brand}
              model={fakeModel}
              service={service}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}