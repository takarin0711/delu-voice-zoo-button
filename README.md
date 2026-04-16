# Delu Voice Zoo Button

DELUTAYA（[@delutaya](https://www.youtube.com/@delutaya)）の動物ボイスを楽しむプロジェクトページです。

**ウェブページ版**: https://takarin0711.github.io/delu-voice-zoo-button/

## 機能

### ウェブページ版
- ブラウザで直接アクセスして音声を再生できる
- 30種類の動物ボイスがグリッド表示される

<img width="700" height="600" alt="Image" src="https://github.com/user-attachments/assets/368fb5e1-ed25-426f-890c-393e8671c46c" />

### Chrome拡張機能版
- `https://www.youtube.com/@delutaya` のチャンネルページにボタンを表示
- 「🎵 Voice ▼」ボタンをクリックするとドロップダウンパネルが開く
- 30種類の動物ボイスから好きな音声を選んで再生できる
- パネルは外側クリックまたはボタン再クリックで閉じる

<img width="600" height="500" alt="Image" src="https://github.com/user-attachments/assets/2cc17229-c814-42cc-8dbc-8598ad63cf45" />

## Chrome拡張機能版インストール方法

1. このリポジトリのファイルをダウンロードする

   **方法A：ZIPでダウンロード（gitが不要）**
   - 右上の緑色の「Code」ボタンをクリック
   - 「Download ZIP」を選択してZIPファイルをダウンロード
   - ダウンロードしたZIPファイルを展開（解凍）する

   **方法B：gitコマンドでクローン**
   ```
   git clone https://github.com/takarin0711/delu-voice-zoo-button.git
   ```
2. Chromeで `chrome://extensions` を開く
3. 右上の「デベロッパーモード」をオンにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、「delu-voice-zoo-button」フォルダを選択する

## 使い方

[ウェブページ版]
1. https://takarin0711.github.io/delu-voice-zoo-button/ を開く
2. 聞きたい動物ボイスのボタンをクリックすると音声が再生される

[Chrome拡張機能版]

1. https://www.youtube.com/@delutaya を開く
2. チャンネルヘッダーのSubscribeボタン付近に「🎵 Voice ▼」ボタンが表示される
3. ボタンをクリックするとドロップダウンパネルが開く
4. 聞きたい動物ボイスを選ぶと音声が再生される

## ファイル構成

```
delu-voice-zoo-button/
├── index.html      # ウェブページ版
├── page.js         # ウェブページ版のスクリプト
├── page.css        # ウェブページ版のスタイル
├── sounds.js       # 音声データ定義（拡張機能・ウェブページ共用）
├── manifest.json   # 拡張機能の設定
├── content.js      # 拡張機能: ボタン注入・ナビゲーション管理・音声再生
├── styles.css      # 拡張機能: ボタン・ドロップダウンのスタイル
├── icon/           # アイコン画像
├── voice/          # 音声ファイル（ウェブページ・拡張機能で共用）
│   ├── 01_duck.mp3
│   ├── 02_sheep.mp3
│   └── ...（30種類）
└── README.md
```

## 音声の追加・変更

1. `voice/` フォルダにmp3ファイルを追加する
2. `sounds.js` の `SOUNDS` 配列にエントリを追加する

```js
const SOUNDS = [
  { label: "🦆 アヒル", file: "voice/01_duck.mp3" },
  // 例: ここに追加
  { label: "🐙 タコ",   file: "voice/31_octopus.mp3" },
];
```

## トラブルシューティング

### ボタンが表示されない (Chrome拡張機能版)

**YouTubeのSPA遷移後にボタンが表示されない場合**

YouTube はシングルページアプリケーション（SPA）のため、ページ内リンクで遷移するとコンテンツスクリプトが再実行されません。遷移後にボタンが表示されないことがあります。

対処法: ページをリロード（F5 / Cmd+R）してください。

## 小ネタ

ウェブページ版の画面で「↑↑↓↓←→←→BA」と入力すると...

## 元ネタ

面白いから見てね: https://www.youtube.com/watch?v=E0QUFBQphsM

## 更新履歴

### v0.5.4
- ウェブページ版のUIを少し調整
- ウェブページ版の背景をCanvas描画の動的な星空に刷新（瞬き・天の川・流れ星）

### v0.5.3
- 軽微な修正

### v0.5.2
- ウェブページ版のUIを少し調整

### v0.5.1
- ウェブページ版のUIを少し調整

### v0.5.0
- ウェブページ版のUIを変更

### v0.4.2
- 軽微な修正

### v0.4.1
- 軽微な修正

### v0.4.0
- ウェブページ版のUIを変更

### v0.3.6
- yt-navigate-finishが発火しないケースへの対応

### v0.3.5
- `waitForElement` にタイムアウト後のリトライ機能を追加（最大3回）
- 回線が遅い環境でDOMの読み込みが遅延した場合もボタンが表示されるように修正

### v0.3.4
- `removeButton()` 実行時に `onOutsideClick` リスナーを解除し、メモリリークを修正

### v0.3.3
- `manifest.json` にアイコンを追加（`chrome://extensions` でアイコンが表示されるように）

### v0.3.2
- `content.js` に `currentAudio` 管理を追加し、音声の重複再生を修正

### v0.3.1
- `sounds.js` を追加し、`SOUNDS` 配列を `content.js` / `page.js` から一元化

### v0.3.0
- GitHub Pages ウェブページ版を追加（`index.html`, `page.js`, `page.css`）

### v0.2.0
- ドロップダウンパネルUIを実装（30種類の動物ボイスを選択再生）
- 音声ファイルを `voice/` フォルダに整理

### v0.1.0
- 初回リリース（単一ボタンでアヒル音声を再生）
