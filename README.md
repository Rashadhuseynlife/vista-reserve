# Vista — Rezervasiya Paneli

Cocktail bar Vista üçün sadə rezervasiya idarəetmə tətbiqi. Staff daxil olub gün üzrə rezervasiyaları görür, vizual masa planından istifadə edərək yeni rezervasiya əlavə edir, redaktə edir və ləğv edir.

**Texnologiya:** sadə HTML/CSS/JS (heç bir build addımı yoxdur) + Cloudflare Workers (API, `src/index.js`) + Cloudflare D1 (verilənlər bazası) + Workers Static Assets (frontend, `public/`). Tamamilə Cloudflare-in pulsuz planında işləyir.

> Qeyd: Cloudflare 2026-da "Pages" məhsulunu "Workers" içinə birləşdirdi. Bu layihə həmin yeni formata görə qurulub (`wrangler.toml`-da `[assets]` və `main = "src/index.js"`).

---

## 1. GitHub-a yükləmək

```bash
cd vista-reserve
git init
git add .
git commit -m "Vista reservation app"
git branch -M main
git remote add origin https://github.com/İSTİFADƏÇİ_ADINIZ/vista-reserve.git
git push -u origin main
```

(GitHub-da əvvəlcə boş "vista-reserve" adında repo yaradın, sonra yuxarıdakı `remote add` sətrindəki linki öz repo linkinizlə əvəz edin.)

## 2. Cloudflare-də D1 verilənlər bazası yaratmaq

Cloudflare dashboard → **Workers & Pages → D1** → **Create database** → adı: `vista_reserve_db`.

Yaradıldıqdan sonra, **Console** bölməsinə keçib `schema.sql` faylının içindəkiləri kopyalayıb işə salın (bu, cədvəlləri və nümunə masaları yaradacaq).

Alternativ olaraq, əgər kompüterinizdə `wrangler` CLI qurulubsa:

```bash
npm install -g wrangler
wrangler login
wrangler d1 create vista_reserve_db
# çıxan database_id-ni wrangler.toml faylına yazın
wrangler d1 execute vista_reserve_db --file=./schema.sql --remote
```

## 3. Worker layihəsini GitHub-a qoşmaq

1. Cloudflare dashboard → **Compute (Workers) → Create application → Import a repository / Connect to Git**
2. GitHub-dakı `vista-reserve` reposunu seçin
3. Cloudflare `wrangler.toml`-u tapıb özü oxuyacaq (build command lazım deyil, "Deploy command" defolt qalsın: `npx wrangler deploy`)
4. **Deploy** düyməsinə basın

`wrangler.toml`-da D1 bağlantısı artıq təyin olunub, ona görə ayrıca "D1 binding" addımına ehtiyac yoxdur — birbaşa işə düşəcək.

## 4. Şifrəni və gizli açarı təyin etmək

Deploy bitdikdən sonra: layihənizə daxil olun → **Settings → Variables and Secrets** (və ya "Environment Variables") → **Add** ilə iki **secret** əlavə edin:

| Ad | Dəyər |
|---|---|
| `STAFF_PASSWORD` | Staff-ın daxil olacağı ortaq şifrə (məs. `vista2026`) |
| `SESSION_SECRET` | İstənilən uzun, təsadüfi mətn (məs. `openssl rand -hex 32` ilə yaradın) |

Hər ikisini **"Secret" (encrypt)** tipində saxlayın ki, görünməsin. Saxladıqdan sonra layihəni yenidən deploy edin (**Retry deployment**) ki, dəyişənlər aktiv olsun.

## 5. Hazırdır

Saytınız `https://vista-reserve.<sizin-subdomain>.workers.dev` ünvanında açılacaq (dəqiq linki deploy bitəndə Cloudflare göstərəcək). Staff bu ünvana daxil olub ortaq şifrə ilə giriş edəcək.

---

## Masaların planını dəyişmək

`schema.sql` faylının aşağı hissəsindəki `INSERT INTO tables` sətirlərini öz real masa düzülüşünüzə uyğun redaktə edin:

- `name` — masanın adı
- `capacity` — neçə nəfərlikdir
- `pos_x`, `pos_y` — planın üzərində mövqe (0-100 arası faiz, sol-yuxarı guşədən)

Dəyişiklikdən sonra D1 Console-da yenidən işə salın, ya da mövcud sətirləri `UPDATE tables SET pos_x = ..., pos_y = ... WHERE id = ...;` ilə düzəldin.

## Sonradan əlavə etmək istəyəcəkləriniz

- **Telegram bildirişi:** yeni rezervasiya yaradılanda `src/index.js` faylındakı `createReservation` funksiyasının sonuna Telegram Bot API-yə bir `fetch` çağırışı əlavə etməklə bir neçə dəqiqəyə qurula bilər (bot yaradıb qrupa əlavə etmək kifayətdir).
- **Ayrı-ayrı staff girişləri:** hazırda hamı eyni şifrə ilə daxil olur, adını isə sadəcə yazır (loglama üçün). Fərdi hesablar lazım olsa, `tables` bazasına bir `staff` cədvəli əlavə etməklə genişləndirilə bilər.
