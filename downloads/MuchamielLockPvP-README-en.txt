Muchamiel Lock PvP — 0.2.0 alpha
Author: Van. Warlock addon for the WoW Forever beta.
Syntax checked only. Not validated inside the game.

INSTALL
Extract the ZIP and copy MuchamielLockPvP to your Forever client's Interface/AddOns.
Correct path: Interface/AddOns/MuchamielLockPvP/MuchamielLockPvP.toc
Restart the client, enable in AddOns. /mlp opens settings; /mlp diag shows diagnostics.
Separate Duels/BGs profiles. Modules can be toggled; panels can be moved and resized.

CURRENT ALPHA
New enemy panel: /mlp rival, target or focus, catalog for nine classes and racials.
Automatic observations only from readable UNIT_SPELLCAST_SUCCEEDED events.
Timers use exposed GetSpellBaseCooldown metadata or manually configured seconds;
they are estimates, never actual enemy cooldown queries. Unseen = unknown, expired
estimate = possibly ready. Detected Preparation/Cold Snap invalidate prior estimates.
Click a spell only to mark a use you witnessed; edit seconds and press Enter.
/mlp reset clears observations. Restricted events are skipped. English spell names.
Active priority buffs and readable magic-buff candidates for Devour Magic.
No guarantee every magic effect is dispellable or every protective effect is readable.
New installations enable enemy panel, magic buffs and visible totems; upgrades
preserve toggles. DR requires a separate Forever Simple DR install (/fdr).
Readable own target DoTs, target/focus cast text and countdowns, identifiable Soul Link,
armor and Nightfall buffs, Healthstone quantity (not item cooldown), Soul Shards with
low-stock warning, learned racial cooldown when readable, demon state and current
action-bar abilities (not pet cooldowns). Experimental English-name visible totem
detection. Up to three magic-buff candidates, not a comprehensive cooldown tracker.
Optional pet health/Mana. No duplicate player health/Mana display.

PENDING
Real DR integration (the DR panel is only a placeholder; use Forever Simple DR),
Healthstone/pet ability cooldowns, graphical cast bars, native restricted-data display,
unexposed enemy casts, talent/shared cooldown/charge modifiers. Restricted fields are indicated, not
calculated by bypassing restrictions. No automatic casts, targeting or messages.

TEST
Confirm loading and version with /mlp diag. Toggle, move, change profile, /reload and
check settings persistence. Test Kick, Psychic Scream, racial and casts in a friendly duel, then
a BG. Report diagnostic output, full Lua errors and reproduction steps to Van.
Do not rely on tournament alerts before testing them in the actual client.

PATCH REFERENCE
Blizzard's Sep 22 client announcement confirms branch 1.60.1. The Oct 8 notes do not
state a build number. TOC 16001 follows the Forever addons checked; confirm locally.
https://us.forums.blizzard.com/en/wow/t/beta-client-update-september-22/2358655
https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696/5
