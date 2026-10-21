**Claude Code Araçları: Yıldız Mı, Kazanç Mı?**

Claude Code ekosisteminde 515 projeyi taradık. 55 aracı kurup kendi depolarımızda tabana karşı ölçtük: aynı iş, araçlı ve araçsız, kol başına 3 tekrar. Toplam harcama yaklaşık 32,6 $ oldu.

**Kural:** İddianın en az yarısı tutarsa Gerçek, bir kısmı tutarsa Kısmi, tutmaz ya da tersine dönerse Balon.

**Kim Ne Kadar Balon** (tutan = ölçülen kazanç ÷ iddia edilen kazanç; her █ yüzde 10)

```
Araç                 Yıldız   İddia → Ölçülen                 Tutan  Balon
bonsai                    9   "güvenli olanı siler" → kirliyi   %0    ██████████ %100
                                aday gösterdi
claude-handoff           65   %20-40 kurtarma → ölçüm yok        %0    ██████████ %100
cc-cache-monitor          5   45 ms → 298-675 ms                 %9    █████████  %91
code-review-graph    32.295   63x → 1,2x (-%18)                 %18    ████████   %82
graphify            130.796   -%80 token → -%22                 %28    ███████    %72
knip (ayarsız)       12.486   ölü kod → 20 bulgunun 15'i yanlış %25    ███████    %75
skill-scanner         2.616   kötü skill → 5'te 2               %40    ██████     %60
toon                 25.535   -%42,6 → -%18                     %42    ██████     %58
caveman             113.970   -%33,2 → -%16,4                   %49    █████      %51
headroom             76.941   -%41 → -%26                       %63    ████       %37
pxpipe                7.542   -%59-70 → -%79, ama doğruluk %70  %70    ███        %30
claude-multisession       3   366 ms → ~510 ms                  %71    ███        %29
claudeignore              6   tüm erişimi keser → 7'de 5        %71    ███        %29
cc-safety-net         1.714   yıkıcı komut → 18'de 13           %72    ███        %28
tokencost / ttok      2.411   doğru sayım → %17-36 eksik        %73    ███        %27
dcg                   6.197   yıkıcı komut → 18'de 15           %83    ██         %17
v4-pro                    3   35/35 → 35/35, 1 yanlış alarm     %97    ░          %3
fauxnix                 995   270'te 270 → 270'te 269          %100    ░          %0
betterleaks           2.287   sır tarama → 5'te 5              %100    ░          %0
promptfoo            26.227   istem testi → 11'de 11           %100    ░          %0
scc                   8.835   doğru sayım → birebir            %100    ░          %0
ccusage              19.100   token ve maliyet → birebir       %100    ░          %0
```

**Kazancı Claude Code'un kendisi yiyenler:** mcp-cli, mcporter, playwright-cli. Üçü de MCP şema yükünü kaldırmayı vaat ediyor, ama Claude Code şemayı zaten erteliyor. Bizde kazanç sıfır çıktı.

**Ölçülemeyen 8 araç:** anahtar istediler ya da Windows'ta çalışmadılar. Bunlar claude-context, codebase-memory-mcp, ripsecrets, unclog, communique, fleetmates, godot-mcp-go ve coding_agent_session_search.

**Yıldız Hesabı**

Toplam 900.889 yıldız. Bunun:

- %37'si iddiası tutan araçlarda (Gerçek, 14 araç);
- %47'si iddiasının yarısına ulaşmayan araçlarda (Balon + Kısmi, 23 araç);
- %16'sı ölçülemeyen ya da sayısal iddiası olmayan araçlarda.

En büyük balonlar graphify (131 bin yıldız, "71.5x" iddiası, ölçülen 1,3x) ve caveman (114 bin yıldız, iddianın yarısı). Yıldız ilgiyi ölçüyor, kazancı değil.

**Ne Aldık**

Yalnız çağrılınca çalışan altı araç aldık; her tur yükleri sıfır:

- **markitdown:** PDF'te -%54, DOCX'te -%92 token, doğruluk aynı.
- **headroom:** büyük JSON çıktısında -%56.
- **graphify:** dar sorularda -%22.
- **betterleaks:** sır taraması; geçmişte gerçek bir anahtar adayı buldu.
- **scc:** satır sayımı, birebir doğru.
- **knip:** ayarla, bizim kaçırdığımız 3 yetim testi buldu.

**Bonus:** Kendi maliyet sayacımızda bir hata çıktı. 1 saatlik önbellek yazmasını ucuz fiyattan sayıyordu; bu yüzden faturayı %8-20 eksik gösteriyordu. Düzelttik; artık ccusage ile kuruşu kuruşuna aynı.
