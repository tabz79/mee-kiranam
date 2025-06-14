
# 📦 Mee-KiranaM – A Grocery Store Restock & Sales Tracker

A full-stack TypeScript app built for a **local grocery store owner** to track daily sales, expenses, and restocking in one place.

This marks my **first real-world freelance gig**, designed and developed solo from scratch, tailored to the unique needs of the shop owner 

---

## 🚀 Features

- 📊 Daily sales, expenses, and restock entry
- 📅 Date-wise report generation
- 🔍 Real-time insights through APIs
- 🌐 Frontend served by Vite + backend with Express
- 🗃️ Data persistence via local JSON (to be upgraded to DB)

---

## 💼 Project Background

My client (a local business owner) was struggling with:

- Manual tracking of expenses & sales
- Forgetting restock items and wholesale prices
- Lack of visibility into daily profitability

So I pitched a simple digital solution — and built this custom app.

📝 **Note**: I treated this project like a paid gig — full requirement gathering, feedback loops, and iteration cycles. It taught me how to build *for* someone, not just for myself.

---

## 📚 How It Started (A Dev Journey)

> “Started from Replit, now we’re here.”

1. **Idea Sparked**  
   I wanted a simple way to track daily sales and expenses for my store. Pen and paper wasn’t cutting it.

2. **Replit Days**  
   - Built the prototype entirely on Replit.  
   - It worked, but things got messy with too many files and limited control.

3. **Migrated to Local Dev**  
   - Shifted to local with Vite + Express setup for better performance and flexibility.  
   - Learned `tsx`, `nanoid`, and how to handle API routing and file serving.

---

## 🧩 Folder Structure

```
mee-kiranam/
├── client/               # Frontend files (HTML, TS, assets)
├── server/               # Express backend
│   ├── index.ts          # API routes + main server
│   └── vite.ts           # Custom Vite middleman for SSR-ish setup
├── public/               # Static assets
├── vite.config.ts        # Vite config
├── package.json          
├── package-lock.json     
└── README.md             # This file
```

---

## 🐛 Problems I Faced & Fixed using chatgpt

| Problem | Fix |
|--------|-----|
| Replit was laggy with complex file structures | Migrated to local dev with Vite & Express |
| Didn't understand folder structures | Learned by doing — now every piece has its place |
| JSON storage not persisting correctly | Switched to writing/reading with `fs` correctly |
| API not returning correct data | Debugged with `console.log` + used Postman |
| CORS errors during Vite-Express integration | Created a custom Vite middleware |
| Server logs cluttering terminal | Segregated logic with `log()` utility function |

---

## 📦 To-Do (WIP)

- [ ] Add persistent database (e.g., MongoDB or SQLite)
- [ ] Deploy on Render/Netlify combo
- [ ] Add auth for multi-user tracking
- [ ] Mobile-friendly UI
- [ ] Export reports as PDF

---

## 🧠 Lessons Learned

- Learned practical DevOps stuff like running servers, port handling, and local debugging.
- Understood the flow of a full-stack app — frontend sends → backend serves → frontend updates.
- Git matters — broke the app twice, Git saved me.
- Building for a real client (even family) forces you to think about usability, not just code.
- Got a taste of client communication: gathering requirements, managing feature creep, and explaining trade-offs.

---

## 🏁 How to Run Locally

```bash
git clone https://github.com/yourusername/mee-kiranam.git
cd mee-kiranam
npm install
cd client # Or set up a proper build step
npx tsx ../server/index.ts
```

> Server runs at `localhost:5000`. Frontend served via Vite proxy or static.

---

## 🙏 Special Thanks

To ChatGPT for being the coding rubber duck and my own persistence.

---

## 📜 License

MIT — use it, tweak it, improve it.
