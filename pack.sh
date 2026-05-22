#!/bin/bash
# Chrome Web Store 打包脚本
# 用法: bash pack.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
ZIP_NAME="sop-skill-extension.zip"

echo "🧹 清理旧的打包文件..."
rm -rf "$DIST_DIR"
rm -f "$SCRIPT_DIR/$ZIP_NAME"

echo "📁 创建临时打包目录..."
mkdir -p "$DIST_DIR"

# 复制插件核心文件
echo "📦 复制插件文件..."
cp "$SCRIPT_DIR/manifest.json" "$DIST_DIR/"
cp "$SCRIPT_DIR/background.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/content.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/sidepanel.html" "$DIST_DIR/"
cp "$SCRIPT_DIR/sidepanel.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/sidepanel.css" "$DIST_DIR/"
cp "$SCRIPT_DIR/options.html" "$DIST_DIR/"
cp "$SCRIPT_DIR/options.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/annotate.html" "$DIST_DIR/"
cp "$SCRIPT_DIR/annotate.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/aliyun-pcm-worklet.js" "$DIST_DIR/"
cp "$SCRIPT_DIR/mic-permission.html" "$DIST_DIR/"
cp "$SCRIPT_DIR/mic-permission.js" "$DIST_DIR/"

# 复制媒体资源（logo + 首页动画视频）
cp "$SCRIPT_DIR/logo.png" "$DIST_DIR/"
cp "$SCRIPT_DIR/logo-hero.mp4" "$DIST_DIR/"
if [ -d "$SCRIPT_DIR/videos" ]; then
    mkdir -p "$DIST_DIR/videos"
    cp "$SCRIPT_DIR/videos/"*.mp4 "$DIST_DIR/videos/"
fi

# 复制图标（只复制 manifest 引用的尺寸）
mkdir -p "$DIST_DIR/icons"
cp "$SCRIPT_DIR/icons/icon16.png" "$DIST_DIR/icons/"
cp "$SCRIPT_DIR/icons/icon48.png" "$DIST_DIR/icons/"
cp "$SCRIPT_DIR/icons/icon128.png" "$DIST_DIR/icons/"

# 创建 ZIP
echo "🗜️  创建 ZIP 包..."
cd "$DIST_DIR"
zip -r "$SCRIPT_DIR/$ZIP_NAME" . -x "*.DS_Store"
cd "$SCRIPT_DIR"

# 清理临时目录
rm -rf "$DIST_DIR"

# 输出结果
SIZE=$(du -h "$SCRIPT_DIR/$ZIP_NAME" | cut -f1)
echo ""
echo "✅ 打包完成!"
echo "📦 文件: $SCRIPT_DIR/$ZIP_NAME"
echo "📏 大小: $SIZE"
echo ""
echo "下一步:"
echo "  1. 访问 https://chrome.google.com/devstore/publish"
echo "  2. 上传 $ZIP_NAME"
echo "  3. 填写商品信息并提交审核"
