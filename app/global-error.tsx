"use client";

/**
 * Спрацьовує, тільки якщо впав кореневий layout: глобальні стилі й шрифти
 * сюди не доїжджають, тому все оформлення — інлайновим стилем.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="uk">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#fff",
          color: "#101010",
          fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif",
        }}
      >
        <title>Помилка — WestPart</title>
        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, lineHeight: 1.3, margin: "0 0 12px" }}>
            Сайт тимчасово недоступний
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              margin: "0 0 24px",
              color: "#4e4e4e",
            }}
          >
            Ми вже знаємо про збій. Спробуйте оновити сторінку або зателефонуйте
            нам:{" "}
            <a href="tel:+380507135500" style={{ color: "#1457a9" }}>
              050-713-55-00
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              height: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 8,
              background: "#1457a9",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Спробувати ще раз
          </button>
          {error.digest && (
            <p style={{ fontSize: 13, color: "#737373", marginTop: 24 }}>
              Код помилки: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
