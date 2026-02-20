interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

export const generateSchemaMarkup = (reviews: Review[], googleMapsRating?: { rating: number; reviewCount: number }) => {
  // Calculate average from our database reviews
  const dbAverageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  // Use Google Maps rating if provided, otherwise use database rating
  const averageRating = googleMapsRating ? googleMapsRating.rating.toFixed(1) : dbAverageRating;
  const totalReviews = googleMapsRating ? googleMapsRating.reviewCount : reviews.length;

  const reviewsSchema = reviews.slice(0, 10).map(review => ({
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

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "HEVSR",
    "description": "Профессиональный ремонт легковых автомобилей, диагностика и техническое обслуживание в Красноярске",
    "url": "https://hybrid24.ru",
    "logo": "https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png",
    "image": "https://cdn.poehali.dev/files/2025-12-13_14-19-48.png",
    "telephone": "+79230166750",
    "email": "info@hybrids24.ru",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Водопьянова, д. 1К",
      "addressLocality": "Красноярск",
      "addressRegion": "Красноярский край",
      "addressCountry": "RU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "56.062692",
      "longitude": "92.900855"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:15",
      "closes": "19:45"
    },
    "priceRange": "$$",
    "areaServed": {
      "@type": "City",
      "name": "Красноярск"
    },
    "serviceType": [
      "Ремонт легковых автомобилей",
      "Техническое обслуживание автомобилей",
      "Диагностика автомобилей",
      "Ремонт гибридных автомобилей",
      "Ремонт двигателя",
      "Ремонт ходовой части",
      "Замена масла и расходников"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Услуги автосервиса",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ремонт легковых автомобилей"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Диагностика автомобилей"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Техническое обслуживание"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ремонт двигателя"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ремонт ходовой части"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ремонт гибридных систем и высоковольтных батарей"
          }
        }
      ]
    }
  };

  if (reviews.length > 0 || googleMapsRating) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  if (reviews.length > 0) {
    schema["review"] = reviewsSchema;
  }

  return schema;
};

// Generate Yandex.Organizations schema markup
export const generateYandexSchema = (reviews: Review[]) => {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HEVSR",
    "description": "Профессиональный ремонт легковых автомобилей, диагностика и техническое обслуживание в Красноярске",
    "url": "https://hybrid24.ru",
    "logo": "https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png",
    "image": "https://cdn.poehali.dev/files/2025-12-13_14-19-48.png",
    "telephone": "+79230166750",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Водопьянова, д. 1К",
      "addressLocality": "Красноярск",
      "addressRegion": "Красноярский край",
      "postalCode": "660135",
      "addressCountry": "RU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "56.062692",
      "longitude": "92.900855"
    }
  };

  if (reviews.length > 0) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return schema;
};