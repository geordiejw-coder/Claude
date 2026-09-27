"""Builds out/contact-sheet.jpg from the rendered MP4 (one frame per second + key beats).
Frames are extracted with Remotion's bundled ffmpeg; the grid is laid out with Pillow."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

MP4 = 'out/abu-dhabi-h1-2026.mp4'
TMP = 'out/frames'
TIMES = [0.6, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.6, 8.6, 9.5, 10.5, 11.5, 12.4, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5, 19.2, 20.0, 20.8, 21.4, 21.8, 22.6, 23.4, 24.2, 25.4, 26.4, 27.6, 28.8, 29.5, 29.95, 30.25, 30.55, 31.0, 32.3]
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
d.text((PAD, 20), 'sp_ce — Abu Dhabi City residential H1 2026 — market-motion key frames (1080x1920, 30fps, 32.4s)', fill=(210, 220, 255), font=head)
for i, (t, p) in enumerate(zip(TIMES, paths)):
    im = Image.open(p).convert('RGB').resize((TW, TH), Image.LANCZOS)
    x = PAD + (i % COLS) * (TW + PAD)
    y = 60 + PAD + (i // COLS) * (TH + PAD + 30)
    sheet.paste(im, (x, y))
    d.text((x, y + TH + 5), f'{t:5.2f}s  ·  f{round(t * 30):03d}', fill=(170, 188, 255), font=font)
sheet.save('out/contact-sheet.jpg', quality=90)
print('out/contact-sheet.jpg', sheet.size)
