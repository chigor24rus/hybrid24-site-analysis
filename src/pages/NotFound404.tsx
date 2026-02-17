import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound404 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Страница не найдена | Hybrid24";

    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";

    return () => {
      if (meta) meta.content = "index, follow";
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Упс! Страница не найдена</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default NotFound404;
