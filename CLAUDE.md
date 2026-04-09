# CLAUDE.md

## プロジェクト概要

DELUTAYA（[@delutaya](https://www.youtube.com/@delutaya)）の動物ボイスを楽しむプロジェクト。Chrome拡張機能版とGitHub Pagesウェブページ版の2形態がある。

## 技術スタック

- Chrome Extension Manifest V3
- Vanilla JS（フレームワークなし）
- CSS（外部ライブラリなし）
- GitHub Pages（ウェブページ版の配信）

## 重要な注意点

### YouTube SPA対応
YouTubeはSPAのため、コンテンツスクリプトはページ遷移後も生き続ける。
`yt-navigate-finish` イベントを使ってナビゲーションを検知し、`@delutaya` ページ以外ではボタンを削除する。

### セレクタの不安定性
YouTubeのDOM構造は予告なく変更されることがある。ボタンが表示されなくなった場合はまず `SELECTORS` 配列（`content.js` 冒頭）を確認する。

### web_accessible_resources のマッチパターン
`@` を含むURLパターン（例: `https://www.youtube.com/@delutaya*`）は `web_accessible_resources` の `matches` に使用できない。そのため `<all_urls>` を使用している。実際の動作制限は `content_scripts` の `matches` で行っている。

### 音声の重複再生防止
`content.js` と `page.js` はどちらも `currentAudio` 変数で再生中の音声を管理している。新しい音声を再生する前に `currentAudio.pause()` + `currentTime = 0` で前の音声を停止する。両ファイルで同じ方式を維持すること。

### Extension context invalidated エラー
拡張機能リロード後に古いコンテンツスクリプトが残った状態でボタンを押すと発生する。
`playSound` をtry-catchで囲み、エラー時はボタンを除去してページリロードを促す。

### 音声ファイルの管理
音声ファイルは `voice/` フォルダにまとめて配置。`manifest.json` の `web_accessible_resources` は `voice/*.mp3` で一括指定しているため、ファイルを追加しても `manifest.json` の変更は不要。`SOUNDS` 配列は `sounds.js` に一元管理されており、拡張機能版・ウェブページ版の両方で共有している。音声を追加する際は **`sounds.js` のみ**を更新すればよい。

### GitHub Pages
ウェブページ版は `index.html` / `page.js` / `page.css` で構成。`page.js` は `chrome.runtime.getURL()` を使わず `voice/01_duck.mp3` のような相対パスで音声を参照している。GitHub Pages のルート配信（`/ (root)`）で `https://takarin0711.github.io/delu-voice-zoo-button/` として公開。
