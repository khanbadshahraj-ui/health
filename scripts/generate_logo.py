import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_modern_logo():
    size = 512
    # Create base RGBA image
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # 1. Background rounded shield / rounded rectangle
    margin = 32
    r = 96
    box = [margin, margin, size - margin, size - margin]

    # Draw gradient-like background using concentric rounded rectangles
    # Emerald dark to teal-green gradient
    for i in range(120):
        t = i / 120.0
        r_col = int(5 + t * (16 - 5))
        g_col = int(120 + t * (185 - 120))
        b_col = int(85 + t * (129 - 85))
        alpha = int(255)
        step_margin = margin + int(i * 0.4)
        step_r = max(10, r - int(i * 0.4))
        draw.rounded_rectangle(
            [step_margin, step_margin, size - step_margin, size - step_margin],
            radius=step_r,
            fill=(r_col, g_col, b_col, alpha)
        )

    # 2. Outer subtle glow ring
    draw.rounded_rectangle(box, radius=r, outline=(209, 250, 229, 230), width=6)

    # 3. Medical Cross + Pulse heartbeat motif in the center
    cx, cy = size // 2, size // 2
    
    # White medical cross in background of the heart line
    cross_w = 48
    cross_len = 160
    # Vertical arm
    draw.rounded_rectangle(
        [cx - cross_w // 2, cy - cross_len // 2 - 10, cx + cross_w // 2, cy + cross_len // 2 - 10],
        radius=18,
        fill=(255, 255, 255, 240)
    )
    # Horizontal arm
    draw.rounded_rectangle(
        [cx - cross_len // 2, cy - cross_w // 2 - 10, cx + cross_len // 2, cy + cross_w // 2 - 10],
        radius=18,
        fill=(255, 255, 255, 240)
    )

    # 4. Vibrant Emerald / Teal Heartbeat ECG Pulse Line across the cross
    # Points representing a classic ECG rhythm: baseline -> small dip -> high spike -> deep drop -> baseline
    ecg_y = cy - 10
    pulse_points = [
        (cx - 150, ecg_y),
        (cx - 70, ecg_y),
        (cx - 50, ecg_y + 16),
        (cx - 25, ecg_y - 68),   # High peak
        (cx + 5, ecg_y + 54),    # Low valley
        (cx + 30, ecg_y - 20),
        (cx + 55, ecg_y),
        (cx + 150, ecg_y)
    ]

    # Draw shadow of pulse line
    draw.line(pulse_points, fill=(4, 120, 87, 255), width=14, joint="curve")
    # Draw core pulse line
    draw.line(pulse_points, fill=(16, 185, 129, 255), width=8, joint="curve")

    # 5. Glowing circular pulse node at the end
    end_pt = pulse_points[-1]
    draw.ellipse([end_pt[0]-10, end_pt[1]-10, end_pt[0]+10, end_pt[1]+10], fill=(255, 255, 255, 255), outline=(5, 150, 105, 255), width=3)

    # 6. Subtle lettering banner at bottom: "AURACARE"
    try:
        # Simple high-contrast text or decorative dot accent
        pass
    except Exception:
        pass

    # Save to public
    os.makedirs("public", exist_ok=True)
    logo_512 = os.path.join("public", "logo.png")
    im.save(logo_512, "PNG")

    # Resized icons
    logo_256 = im.resize((256, 256), Image.Resampling.LANCZOS)
    logo_192 = im.resize((192, 192), Image.Resampling.LANCZOS)
    logo_128 = im.resize((128, 128), Image.Resampling.LANCZOS)
    logo_64 = im.resize((64, 64), Image.Resampling.LANCZOS)
    logo_32 = im.resize((32, 32), Image.Resampling.LANCZOS)
    logo_16 = im.resize((16, 16), Image.Resampling.LANCZOS)

    logo_192.save(os.path.join("public", "logo-192.png"), "PNG")
    logo_256.save(os.path.join("public", "apple-touch-icon.png"), "PNG")

    # Save multi-size ICO
    ico_path = os.path.join("public", "app_icon.ico")
    im.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    im.save(os.path.join("public", "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32)])

    print(f"Generated logo assets successfully: {logo_512}, {ico_path}")

if __name__ == "__main__":
    create_modern_logo()
