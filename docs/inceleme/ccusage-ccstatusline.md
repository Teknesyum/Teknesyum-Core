# ccusage ve ccstatusline

> Kanıt seviyesi: kod

Her iki deponun kaynak dosyaları raw olarak okundu. Bu makinede çalıştırılmadı.

## Kimlik

**ccusage** (`ryoppippi/ccusage`) — Claude Code oturumlarının token/maliyet dökümünü
`~/.claude/projects/**/*.jsonl` transcript'lerinden çıkaran CLI. **Ana kod artık Rust**;
`apps/ccusage/src/cli.js` sadece platform native binary'sini çağıran launcher.
`package.json` (v20.0.20) runtime `dependencies` **sıfır**, altı platform binary'si
`optionalDependencies`. `npx ccusage@latest` ya da `bunx ccusage`. Ayrıca
`ccusage statusline` alt komutuyla statusline'a takılır.

**ccstatusline** (`sirmalloc/ccstatusline`) — TypeScript, bun ile tek dosyaya bundle
edilip `dist/` olarak yayınlanır; yayınlanan pakette `dependencies` bloğu **yok**,
32 paketin hepsi devDependency. Çalışma runtime'ı node ≥14. Kurulum:
`"statusLine": { "type": "command", "command": "npx -y ccstatusline@latest" }`.

## Çözdüğü dert

"Bu oturumda bağlamın ne kadarı doldu, ne kadar para gitti" sorusunu Claude Code'un
kendisi tam vermediği için transcript'ten yeniden hesaplama. ccusage maliyeti fiyat
tablosundan **kendi hesaplar**; ccstatusline hesaplamaz, Claude Code'un verdiği rakamı
gösterir.

## Veri akışı

### Transcript nerede aranıyor

ccusage — `rust/adapters/claude/src/paths.rs`:

```rust
if let Ok(env_paths) = env::var("CLAUDE_CONFIG_DIR") { ... }
let xdg = env::var("XDG_CONFIG_HOME")...unwrap_or_else(|_| PathBuf::from(&home).join(".config"));
for path in [xdg.join("claude"), home.join(".claude")] {
    if path.join("projects").is_dir() && seen.insert(path.clone()) { paths.push(path); }
}
```

Yani `~/.claude/projects/<proje>/<session>.jsonl` ve `~/.config/claude/projects/...`.

ccstatusline dizin **taramaz**; yolu Claude Code'un stdin JSON'ından alır —
`src/ccstatusline.ts:130`:

```ts
if (data.transcript_path) { tokenMetrics = await getTokenMetrics(data.transcript_path); }
```

### Bağlam doluluğu formülü — ccusage

Önce stdin'deki `context_window` bloğu; yoksa transcript'ten hesap. Transcript yolu
**dosyayı sondan tarar, ilk `type == "assistant"` + `message.usage` satırında durur**
(`rust/crates/ccusage/src/commands/mod.rs`):

```rust
for line in content.lines().rev() {
    if value.get("type")... != Some("assistant") { continue; }
    let Some(usage) = value.get("message").and_then(|m| m.get("usage")) else { continue };
    let Some(input_tokens) = usage.get("input_tokens")... else { continue };
    let cache_creation = usage.get("cache_creation_input_tokens")...unwrap_or_default();
    let cache_read     = usage.get("cache_read_input_tokens")...unwrap_or_default();
    return Some(HookContext {
        total_input_tokens: input_tokens + cache_creation + cache_read,
        context_window_size,
    });
}
```

Payda ve yüzde:

```rust
let context_window_size = model_id...and_then(|id| pricing...context_limit(id)).unwrap_or(200_000);
let percentage = if context_limit == 0 { 0 }
    else { ((input_tokens as f64 / context_limit as f64) * 100.0).round() as u64 };
```

**Formülün tamamı:**

```
doluluk% = round(
    (input_tokens + cache_creation_input_tokens + cache_read_input_tokens)
    / context_window_size * 100
)
```

`output_tokens` **dahil değil**. Kaynak: son assistant mesajı (en büyüğü değil, en
sonuncusu). Payda: fiyat tablosundaki model bağlam limiti, bulunamazsa 200 000.
Çıktı biçimi `🧠 123,456 (62%)`; renk eşikleri `--context-low-threshold` /
`--context-medium-threshold`.

### Bağlam doluluğu formülü — ccstatusline

Aynı üç alan toplanır, ama seçilen mesaj compact sınırına göre değişir
(`src/utils/jsonl-metrics.ts`):

```ts
const contextLengthFromEntry = (entry) => {
    const usage = entry?.message?.usage;
    if (!usage) return null;
    return (usage.input_tokens || 0)
        + (usage.cache_read_input_tokens ?? 0)
        + (usage.cache_creation_input_tokens ?? 0);
};
contextLength = lastCompactBoundaryLineIndex >= 0
    ? (contextLengthFromEntry(mostRecentPostCompactionEntry) ?? lastCompactBoundaryPostTokens ?? 0)
    : (contextLengthFromEntry(mostRecentMainChainEntry) ?? 0);
```

Payda sırayla: stdin'in `context_window_size`'ı → model adından `(200k)/(1M)` regex
çıkarımı → `DEFAULT_CONTEXT_WINDOW_SIZE = 200000`. Ayrıca **autocompact eşiği** ayrı
bir widget olarak var (`src/utils/model-context.ts`, `ContextPercentageUsable.ts`):

```ts
const USABLE_CONTEXT_RATIO = 0.8;   // usableTokens = floor(windowSize * 0.8)
```

Yani "kullanılabilir bağlam" = pencerenin %80'i, otomatik sıkıştırma öncesi eşik.

stdin zaten `used_percentage` veriyorsa transcript hiç okunmaz.

### Sidechain elemesi

ccstatusline — yalnız `contextLength` seçiminde eler; toplam sayaçlara sidechain dahil:

```ts
if (data.isSidechain !== true && data.timestamp && !data.isApiErrorMessage)
```

ccusage — **elemez, önceliklendirir** (`rust/adapters/claude/src/lib.rs`):

```rust
fn should_replace_deduped_entry(candidate: &UsageEntry, existing: &UsageEntry) -> bool {
    let candidate_is_sidechain = is_sidechain_usage_entry(candidate);
    let existing_is_sidechain  = is_sidechain_usage_entry(existing);
    if candidate_is_sidechain != existing_is_sidechain { return existing_is_sidechain; }
    ...
}
```

Ana-zincir kaydı sidechain kopyasını her zaman yener.

### Compact sonrası sıfırlama

Yalnız ccstatusline açıkça yapıyor (`src/utils/compaction.ts`):

```ts
export function isCompactBoundary(record: unknown): boolean {
    const r = record as { type?: unknown; subtype?: unknown; isSidechain?: unknown };
    return r.type === 'system' && r.subtype === 'compact_boundary' && r.isSidechain !== true;
}
```

Son boundary'nin satır indeksi tutulur; ondan sonraki en yeni kayıt bağlamı belirler,
yoksa `compactMetadata.postTokens`, o da yoksa 0. `computeCompactionStats` ayrıca
`trigger: auto|manual|unknown` sayar ve `preTokens - postTokens` toplar.

ccusage'da `compact` geçen tek satır yok; sıfırlama örtük — son assistant mesajı zaten
küçülmüş `input_tokens`'ı taşır (**tahmin**, kod yorumu yok).

Yeni oturum tespiti ikisinde de yok; oturum kimliği stdin'deki `session_id` ve dosya adı.

### Duplikasyon önleme

Yalnız ccusage:

```rust
fn usage_dedupe_hash(message_id: &str, request_id: Option<&str>, session_id: &str) -> u64 {
    let mut hasher = FxHasher::default();
    message_id.hash(&mut hasher); request_id.hash(&mut hasher); session_id.hash(&mut hasher);
    hasher.finish()
}
```

Anahtar **messageId + requestId + sessionId**. Çarpışmaya karşı alan alan doğrulama
(`loaded_entry_matches_dedupe_key`). İkinci bir `requestId=None` indeksi sidechain
replay'lerini yakalar. Çakışmada kazanan: ana-zincir > büyük token toplamı > `speed`
bilgisi olan.

ccstatusline dedupe yerine streaming filtresi kullanır: `stop_reason` dolu olan kayıtlar
sayılır, `null` olan yalnız son kayıtsa sayılır.

### Fiyat tablosu ve maliyet

`rust/crates/ccusage-core/src/pricing.rs`:

```rust
static LITELLM_PRICING_DEFLATE: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/litellm-pricing.json.deflate"));
static MODELS_DEV_DEFLATE:     &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/models-dev-pricing.json.deflate"));
const LITELLM_PRICING_URL: &str = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const MODELS_DEV_API_URL: &str = "https://models.dev/api.json";
```

**Gömülü snapshot her zaman önce yüklenir**, `--offline` değilse ağdan tazelenir, hata
olursa uyarıp gömülüye düşer. Kalıcı disk cache'i bulunamadı; yalnız process içi
`OnceLock`.

Maliyet (`cost.rs`) beş kova + 200K üstü kademe:

```rust
tiered_cost(usage.input_tokens,  pricing.input,  pricing.input_above_200k,  threshold)
+ tiered_cost(usage.output_tokens, pricing.output, pricing.output_above_200k, threshold)
+ tiered_cost(cache_create_5m_tokens, pricing.cache_create, pricing.cache_create_above_200k, threshold)
+ tiered_cost(cache_create_1h_tokens, cache_create_1h_cost, cache_create_1h_cost_above_200k, threshold)
+ tiered_cost(usage.cache_read_input_tokens, pricing.cache_read, pricing.cache_read_above_200k, threshold)
```

`CACHE_CREATE_1H_INPUT_MULTIPLIER = 2.0`. Modelde `long_context_threshold` varsa kademe
**marjinal değil** — tüm istek üst orana geçer. Modlar: `Display` (transcript'teki
`costUSD`), `Auto` (yoksa hesapla), `Calculate` (hep hesapla).

### ccstatusline'ın gördüğü stdin alanları

`src/types/StatusJSON.ts` (zod `looseObject`): `hook_event_name, session_id,
transcript_path, cwd, model{id,display_name}, workspace{current_dir,project_dir},
version, output_style, effort{level}, cost{total_cost_usd,total_duration_ms,
total_api_duration_ms,total_lines_added,total_lines_removed},
context_window{context_window_size,total_input_tokens,total_output_tokens,
current_usage,used_percentage,remaining_percentage}, vim, worktree,
rate_limits{five_hour,seven_day,seven_day_sonnet,seven_day_opus}`.

**`exceeds_200k_tokens` iki depoda da geçmiyor** — eski bir alan; yerini `context_window`
bloğu almış.

## Bağlam maliyeti

**Sıfır — ikisi de statusline komutu.** Claude Code statusline'ı ayrı process olarak
çalıştırır, stdout'u ekrana yazar, modele göndermez. Core'un `statusline.js`'i ile aynı
maliyet sınıfı (EKOSISTEM.md'deki Z sınıfı).

Tek uyarı: ccusage `--offline` değilken her çağrıda ağa çıkabiliyor (LiteLLM +
models.dev). Bu bağlam maliyeti değil ama statusline gecikmesi ve dış bağımlılık.
ccstatusline ayrıca `api.anthropic.com/api/oauth/usage` uçlarını çağırıyor.

## Core'daki karşılık

`core/scripts/statusline.js` — `build(input)` stdin JSON'ını alıyor ama şu anda yalnız
`input.workspace.current_dir` alanını kullanıyor. `model`, `cost`, `context_window`,
`rate_limits` alanlarına **hiç bakmıyor**. Yani Claude Code bedava veriyor, Core almıyor.

`banner()`/`draw()` — `MessageDisplay` bandı; `BANNER_CAP = 120`. Bağlam doluluğu buraya
sığacak boyutta bir bilgi.

`core/scripts/handoff.js` ve `docs/COST-MODEL.md` — maliyet Core'da zaten bir kavram;
ölçüm kaynağı eksik.

`core/tiers.json` — profil (`eco/normal/premium`) ve tavan seçimi bugün elle. Gerçek
maliyet ölçümü bu seçimi kanıta bağlayabilir.

## Çalınabilir fikir

1. **`context_window` alanını stdin'den okumak.** `statusline.js:build()` zaten o JSON'u
   alıyor; `input.context_window.used_percentage` (ya da yoksa yukarıdaki üç-alan
   toplamı / `context_window_size`) tek satırla statusline'a eklenir. Transcript
   okumaya bile gerek yok.
   *Altın kuralı ihlal eder mi — hayır.*

2. **Autocompact eşiğine göre yüzde (`× 0.8`).** Ham %62 değil, "kullanılabilir bağlamın
   %78'i" daha dürüst bir uyarı; sıkıştırma bu eşikte tetikleniyor. Bant ancak eşiğe
   yaklaşınca konuşsun.
   *Altın kuralı ihlal eder mi — hayır.*

3. **`output_tokens`'ı bağlam hesabından dışlamak.** İki proje de bunu bağımsız olarak
   yapıyor; bağlam penceresini dolduran şey girdi + cache, çıktı değil. Core kendi
   hesabını yazarsa bu kural doğrudan alınmalı.
   *Altın kuralı ihlal eder mi — hayır.*

4. **`isSidechain` ile ana-zincir ayrımı.** Core'un relay'i çok ajanlı; alt ajanların
   tüketimi T0'ın bağlamını doldurmaz. Ölçüm yaparken sidechain'i **ayrı** saymak — atmak
   değil — "relay ne kadara mal oldu" sorusunun doğru cevabı. `contract.js`'in denetim
   defterine sözleşme başına gerçek maliyet yazılabilir.
   *Altın kuralı ihlal eder mi — hayır* (betik transcript'i okur, modele yazmaz).

5. **`compact_boundary` sınırından sonrasını saymak.** `type=="system" &&
   subtype=="compact_boundary" && isSidechain!==true` deseni. Core'un `handoff.js`'i
   kesilen oturumu devraldığında "sıkıştırma oldu mu, kaç kez" bilgisini bedavaya alır.
   *Altın kuralı ihlal eder mi — hayır.*

6. **messageId+requestId+sessionId dedupe.** Aynı transcript birden fazla yerden
   okunduğunda çift sayımı önleyen üçlü anahtar. Core'un `live/_tally.json` sayaçları
   için hazır desen.
   *Altın kuralı ihlal eder mi — hayır.*

7. **Gömülü fiyat snapshot + isteğe bağlı tazeleme.** ccusage fiyat tablosunu binary'ye
   gömüyor, ağ yalnız tazeleme için. Core'un sıfır bağımlılık kuralı için doğru desen:
   `tiers.json` yanına küçük bir `prices.json`, ağ hiç yok, kullanıcı elle günceller.
   *Altın kuralı ihlal eder mi — hayır.*

## Ret adayı gerekçe

- **Sözleşme sınırı yok.** İkisi de ölçer, hiçbir şeyi durdurmaz. Core'un ekseni
  `contract.js` kapısı; salt gösterge o eksene teğet geçer.
- **Kurulum ekler.** `npx -y ...@latest` her statusline çağrısında paket çözümlemesi
  demek; Core bugün kendi `statusline.js`'ini doğrudan `node` ile çalıştırıyor. İkisi
  aynı anda statusline'ı işgal edemez — Claude Code'da tek `statusLine` komutu var.
  Birleştirmek isteniyorsa Core'un kendi hesabı yapması gerekir.
- **Ağ.** ccusage varsayılanda LiteLLM ve models.dev'e çıkıyor, ccstatusline
  anthropic.com'a. Core bugün hiçbir yere çıkmıyor; bu bir özellik.
- **ccusage artık Rust.** Node/sıfır-bağımlılık kuralı gereği kod olarak alınamaz;
  yalnız formül alınabilir. Formül zaten yukarıda, on satır.
- **Fiyat tablosu bayatlar.** Gömülü snapshot ağsız çalışırken yanlış rakam verir;
  yanlış maliyet, maliyet göstermemekten kötüdür.
- **Payda belirsiz.** İkisi de 200 000'e düşüyor; model 1M bağlamlıysa yüzde beş kat
  yanlış çıkar. Core bunu yapacaksa paydayı stdin'den almalı, tahmin etmemeli.

## README cümlesi

You do not need to install either of these: Claude Code already hands the statusline the
context-window and cost figures they spend most of their code reconstructing from
transcripts, and Core's statusline is the one command slot you have -- so the ten-line
formula is worth taking, and the package is not.
