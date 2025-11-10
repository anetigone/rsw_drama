import os
import glob
import math
from PIL import Image, ImageFilter
import argparse

def parse_ratio(s):
    if ':' in s:
        a,b = s.split(':',1)
        return float(a)/float(b)
    return float(s)

def compute_canvas(w, h, R):
    # 尝试以高度为基准计算宽度；若宽度不够，再以宽度为基准计算高度
    H = int(math.ceil(h))
    W = int(math.ceil(R * H))
    if W < w:
        W = int(math.ceil(w))
        H = int(math.ceil(W / R))
    return W, H

def process_image(path, out_dir, R, bg):
    im = Image.open(path).convert('RGB')
    w,h = im.size
    W,H = compute_canvas(w,h,R)

    if bg == 'blur':
        # 用原图放大并模糊作为背景
        bg_im = im.resize((W,H), Image.LANCZOS)
        bg_im = bg_im.filter(ImageFilter.GaussianBlur(radius=20))
    else:
        # 解析颜色字符串（例如 "#ffffff" 或 "white"）
        bg_im = Image.new('RGB', (W,H), bg)

    left = (W - w) // 2
    top = (H - h) // 2
    bg_im.paste(im, (left, top))
    base = os.path.splitext(os.path.basename(path))[0]
    out_path = os.path.join(out_dir, base + '_padded.jpg')
    bg_im.save(out_path, quality=95)
    return out_path

def main():
    parser = argparse.ArgumentParser(description='Pad images to a fixed aspect ratio (no cropping).')
    parser.add_argument('--dir', required=True, help='图片目录路径')
    parser.add_argument('--ratio', default='16:9', help='目标宽高比，例如 16:9 或 1.0')
    parser.add_argument('--bg', default='#ffffff', help='背景颜色或 "blur"（模糊原图）')
    parser.add_argument('--out', help='输出目录（默认在源目录下新建 processed）')
    args = parser.parse_args()

    src_dir = args.dir
    R = parse_ratio(args.ratio)
    out_dir = args.out or os.path.join(src_dir, 'processed')
    os.makedirs(out_dir, exist_ok=True)

    patterns = ['*.jpg','*.jpeg','*.png','*.webp','*.bmp','*.tif','*.tiff']
    files = []
    for p in patterns:
        files.extend(glob.glob(os.path.join(src_dir, p)))
    if not files:
        print('未找到图片文件。')
        return

    for f in files:
        out = process_image(f, out_dir, R, args.bg)
        print('写入:', out)

if __name__ == '__main__':
    main()