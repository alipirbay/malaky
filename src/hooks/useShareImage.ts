interface ShareImageData {
  bravest: string;
  cardsPlayed: number;
  refusals: number;
  mode: string;
  vibe: string;
}

export async function generateShareImage(data: ShareImageData): Promise<Blob | null> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#0A0F1E");
    grad.addColorStop(0.5, "#111827");
    grad.addColorStop(1, "#0A0F1E");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative circles
    ctx.beginPath();
    ctx.arc(900, 150, 280, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 900, 220, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(236, 72, 153, 0.06)";
    ctx.fill();

    // MALAKY title
    ctx.font = "bold 110px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    const titleGrad = ctx.createLinearGradient(300, 200, 780, 320);
    titleGrad.addColorStop(0, "#6366F1");
    titleGrad.addColorStop(1, "#EC4899");
    ctx.fillStyle = titleGrad;
    ctx.fillText("MALAKY", 540, 300);

    // Tagline
    ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("Ose tout. Assume rien.", 540, 360);

    // Mode + Vibe pill
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
    const pillW = 320;
    const pillX = 540 - pillW / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, 400, pillW, 52, 26);
    ctx.fill();
    ctx.fillStyle = "#A5B4FC";
    ctx.fillText(`${data.mode} · ${data.vibe}`, 540, 433);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 500);
    ctx.lineTo(960, 500);
    ctx.stroke();

    // Stats cards
    const drawStatCard = (x: number, y: number, w: number, h: number, emoji: string, value: string, label: string, color: string) => {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 24);
      ctx.fill();

      ctx.font = "54px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(emoji, x + w / 2, y + 72);

      ctx.font = "bold 68px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(value, x + w / 2, y + 158);

      ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText(label, x + w / 2, y + 200);
    };

    drawStatCard(80, 540, 280, 220, "🃏", String(data.cardsPlayed), "cartes jouées", "#818CF8");
    drawStatCard(400, 540, 280, 220, "🏆", data.bravest.slice(0, 8), "le plus brave", "#F472B6");
    drawStatCard(720, 540, 280, 220, "🙈", String(data.refusals), "refus", "#FB923C");

    // Bottom CTA
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("Joue sur malaky.app 🇲🇬", 540, 870);

    ctx.font = "22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("Le jeu de soirée des Malgaches", 540, 920);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  } catch {
    return null;
  }
}
