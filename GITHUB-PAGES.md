# 元辰小人宮：GitHub Pages

GitHub Pages 版本直接使用 `app/page.tsx` 與 `app/globals.css`，保留選紙人、填寫資料、敲打音效、完成符、圖片下載與分享功能。

## 本機建置

使用 Node.js 24：

```sh
npm ci
npm run build:pages
npm run preview:pages
```

靜態檔案輸出至 `dist-pages/`，不需要伺服器或資料庫。圖片使用相對路徑，支援 GitHub Pages 儲存庫子目錄。

## 發布

在 GitHub 儲存庫的 Settings → Pages，將 Source 設為 GitHub Actions。
推送至 `main` 後，`.github/workflows/pages.yml` 會自動建置及發布。

遊戲輸入的姓名與關係只保存在目前頁面的記憶體中，不會傳送至伺服器。LINE QR Code 使用外部圖片服務；LINE 連結、原生分享與下載功能需要瀏覽器支援對應能力。
