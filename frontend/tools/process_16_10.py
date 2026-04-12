"""
将 `origin/` 目录下的图片统一为 16:10 比例的脚本。
策略：尽量不改变尺寸 -> 采用中心裁剪（只裁剪多余的边），保持一个维度不变；如果你希望裁剪后再缩放回原始尺寸，可使用 --resize 标志。

使用方法（在项目根或含有该脚本的目录运行）：
python process_16_10.py

可选参数：
  --src  源目录（默认：./origin）
  --dst  目标目录（默认：./processed）
  --resize 把裁剪后的图片缩放回原始尺寸（默认 False）
  --exts 扩展名列表，逗号分隔（默认 jpg,jpeg,png）

输出：在目标目录下生成后缀为 _16_10 的文件
"""
from PIL import Image
from pathlib import Path
import argparse

TARGET_RATIO = 16 / 10


def process_image(path: Path, dst_dir: Path, resize_back: bool = False):
    img = Image.open(path)
    w, h = img.size
    r = w / h

    # 计算裁剪框
    if abs(r - TARGET_RATIO) < 1e-6:
        # 已经是目标比例
        cropped = img
        reason = 'already'
    elif r > TARGET_RATIO:
        # 宽度过大 -> 裁剪左右
        new_w = int(h * TARGET_RATIO)
        left = (w - new_w) // 2
        right = left + new_w
        cropped = img.crop((left, 0, right, h))
        reason = f'crop-width {w}->{new_w}'
    else:
        # 高度过大 -> 裁剪上下
        new_h = int(w / TARGET_RATIO)
        top = (h - new_h) // 2
        bottom = top + new_h
        cropped = img.crop((0, top, w, bottom))
        reason = f'crop-height {h}->{new_h}'

    out_img = cropped
    if resize_back:
        # 如果要求缩放回原始尺寸
        out_img = cropped.resize((w, h), Image.LANCZOS)
        reason += ' + resize back'

    dst_dir.mkdir(parents=True, exist_ok=True)

    suff = path.suffix.lower()
    out_name = path.stem + '_16_10' + suff
    out_path = dst_dir / out_name

    # 保留原格式和质量（对于 JPEG 使用 quality=95）
    save_args = {}
    if suff in ('.jpg', '.jpeg'):
        save_args['quality'] = 95
        save_args['subsampling'] = 0

    out_img.save(out_path, **save_args)
    return (path.name, (w, h), out_path.name, out_img.size, reason)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--src', default='./origin', help='源目录，默认 ./origin')
    parser.add_argument('--dst', default='./processed', help='目标目录，默认 ./processed')
    parser.add_argument('--resize', action='store_true', help='裁剪后缩放回原始尺寸')
    parser.add_argument('--exts', default='jpg,jpeg,png', help='要处理的扩展名，逗号分隔')
    args = parser.parse_args()

    src = Path(args.src)
    dst = Path(args.dst)
    exts = [('.' + e.lower().lstrip('.')) for e in args.exts.split(',')]

    if not src.exists() or not src.is_dir():
        print(f"源目录不存在: {src.resolve()}")
        return

    files = [p for p in src.iterdir() if p.suffix.lower() in exts]
    if not files:
        print(f"在 {src} 中未找到匹配扩展名 {exts} 的文件")
        return

    print(f"处理 {len(files)} 个文件，目标比例 {TARGET_RATIO}，输出到 {dst}")
    for p in files:
        try:
            name, orig_size, out_name, out_size, reason = process_image(p, dst, args.resize)
            print(f"{name}: {orig_size} -> {out_name}: {out_size} ({reason})")
        except Exception as e:
            print(f"处理 {p} 时出错: {e}")


if __name__ == '__main__':
    main()
