# expo/skills

- lisans: MIT (650 Industries, Inc. / Expo)
- tür: skills
- kitap sayısı ve yeri: 97 markdown; `plugins/expo/skills/*` (23 SKILL.md + references), `plugins/expo-experiments/skills/*`, `.claude/skills/expo-skill-eval/`
- scan: `plugins/expo/skills/*/SKILL.md`, `plugins/expo/skills/*/references/*.md`, `plugins/expo-experiments/skills/*/SKILL.md` · skip: `.eas/`, `.github/`, `scripts/`, `agents/openai.yaml` (Codex/Grok için, Claude'a gerekmez), `.claude/skills/expo-skill-eval` (Expo'nun kendi CI'ı, dışa dönük değil)

## Ne işe yarar
React Native / Expo geliştirme için resmi Expo şirketi kaynaklı skill koleksiyonu: router (expo-overview), navigasyon (expo-router), native modül yazımı (expo-module), UI, animasyon, EAS build/store/hosting gibi 23 ayrı kitap. Her SKILL.md frontmatter'da name/description/version/license taşıyor, description alanı ne zaman yükleneceğini net tarif ediyor. `expo-overview` merkezi router görevi görüyor, diğer kitaplara yönlendiriyor.

## ??'de ne zaman bulunmalı
- expo router ile tab/stack navigasyon nasıl kurulur
- expo native module (swift/kotlin) nasıl yazılır
- eas build ile app store'a nasıl yayın yapılır

## Kalite
Özgün, Expo'nun kendi deposu (github.com/expo), her SKILL.md üstünde `version` alanı var ve son commit bugün (2026-09-08, "Correctness pass on design-surface skills" PR #176) — aktif bakımlı. Referans dosyaları konu bazlı bölünmüş, tekrar az.

## Karar
raf — Claude Code frontmatter standardına birebir uyan, güncel ve Expo'nun resmi kaynağı olan React Native/Expo referansı.
