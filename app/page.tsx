export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "#080d14",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <img
          src="/bouncer.jpg"
          alt="Brain Armstrong whale bouncer"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 16,
            marginBottom: 28,
          }}
        />

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: "0 0 16px",
          }}
        >
          Brain Armstrong Token Gate
        </h1>

        <p
          style={{
            fontSize: 20,
            lineHeight: 1.6,
            color: "#e2e8f0",
            margin: "0 0 24px",
          }}
        >
          Hold over 10M Brain Armstrong to get past the bouncer.
        </p>

        <a
          href="https://t.me/BrainArmWhaleBot"
          style={{
            display: "inline-block",
            padding: "16px 28px",
            borderRadius: 12,
            background: "#ffffff",
            color: "#080d14",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.4,
            textDecoration: "none",
          }}
        >
          Open Telegram Bot
        </a>
      </div>
    </main>
  );
}
