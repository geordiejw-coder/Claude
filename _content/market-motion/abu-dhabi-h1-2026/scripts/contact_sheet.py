"""Builds out/contact-sheet.jpg from the rendered MP4 (one frame per second + key beats).
Frames are extracted with Remotion's bundled ffmpeg; the grid is laid out with Pillow."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

MP4 = 'out/abu-dhabi-h1-2026.mp4'
TMP = 'out/frames'
TIMES = [0.6, 1.8, 3.4, 4.6, 5.8, 7.2, 8.6, 10.2, 12.0, 13.6, 15.0, 17.4, 19.0, 20.6, 22.4, 23.6, 25.2, 26.8, 28.4, 30.0, 32.0, 33.2, 34.4, 35.6, 37.2, 38.6, 40.0, 41.2, 42.6, 43.2, 43.6, 44.2, 44.8, 45.6, 47.15]
COLS, TW, TH, PAD = 6, 360, 640, 18
os.makedirs(TMP, exist_ok=True)
paths = []
for t in TIMES:
    p = f'{TMP}/t{t:05.2f}.png'
    subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t:.3f}', '-i', MP4, '-frames:v', '1', p], check=True)
    paths.append(p)
rows = (len(paths) + COLS - 1) // COLS
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
head = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
sheet = Image.new('RGB', (COLS * (TW + PAD) + PAD, rows * (TH + PAD + 30) + PAD + 60), (18, 20, 28))
d = ImageDraw.Draw(sheet)
d.text((PAD, 20), 'sp_ce — Abu Dhabi City residential H1 2026 — market-motion key frames (1080x1920, 30fps, 47.2s)', fill=(210, 220, 255), font=head)
for i, (t, p) in enumerate(zip(TIMES, paths)):
    im = Image.open(p).convert('RGB').resize((TW, TH), Image.LANCZOS)
    x = PAD + (i % COLS) * (TW + PAD)
    y = 60 + PAD + (i // COLS) * (TH + PAD + 30)
    sheet.paste(im, (x, y))
    d.text((x, y + TH + 5), f'{t:5.2f}s  ·  f{round(t * 30):03d}', fill=(170, 188, 255), font=font)
sheet.save('out/contact-sheet.jpg', quality=90)
print('out/contact-sheet.jpg', sheet.size)
