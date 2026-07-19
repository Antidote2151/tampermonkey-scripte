// ==UserScript==
// @name         Treasure Maps → Radarr/Sonarr
// @namespace    treasure-maps-community
// @version      0.10
// @description  Zeigt überall (Detailseiten, Browse-Karten, Listen, Watchlist), ob ein Film/eine Serie schon in Radarr/Sonarr ist, und fügt sie per Klick hinzu. URL/API-Key bleiben lokal im Browser.
// @match        https://treasure-maps.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// ==/UserScript==

// Einrichtung: Tampermonkey-Menü → "Radarr konfigurieren" / "Sonarr konfigurieren"
// (URL + API-Key, danach Standard-Quality-Profil und Standard-Ordner wählen).
// Beim ersten Zugriff auf die eigene Instanz fragt Tampermonkey einmal nach Erlaubnis.
// Benötigt Radarr v3+ bzw. Sonarr v4.
//
// Das Script erkennt Filme/Serien auf drei Wegen und hängt ein Status-Badge an:
//   1. data-imdb-id / data-tmdb-id / data-tvdb-id (Karten, Release-Tabelle, Schnellsuche)
//   2. Cover-URLs movies_<imdbid>-cover.webp (Slider u.ä. ohne Attribute)
//   3. IMDb-/TVDB-Links (Detailseiten, Watchlist, Serien-Listen)
// Badge: ✓ vorhanden · x/y bzw. ~ unvollständig (Details im Tooltip) · + zum Hinzufügen.
// Die Bibliothek wird pro App mit einem Request geladen und 5 Minuten gecacht;
// Hinzufügen über das Script oder der Menüpunkt "Status neu laden" leert den Cache.

(function () {
    'use strict';

    const label = { radarr: 'Radarr', sonarr: 'Sonarr' };
    const COLOR = { have: '#6dd58c', partial: '#e6c86e', err: '#e88' };

    function api(app, path, method = 'GET', body = null) {
        const base = GM_getValue(app + 'Url', '').replace(/\/+$/, '');
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method,
                url: base + path,
                headers: { 'X-Api-Key': GM_getValue(app + 'Key', ''), 'Content-Type': 'application/json' },
                data: body ? JSON.stringify(body) : undefined,
                timeout: 15000,
                onload: (r) => {
                    if (r.status >= 200 && r.status < 300) {
                        try { resolve(JSON.parse(r.responseText || 'null')); }
                        catch (e) { reject(new Error('Ungültige Antwort')); }
                    } else {
                        reject(new Error('HTTP ' + r.status + (r.status === 401 ? ' (API-Key prüfen)' : '')));
                    }
                },
                onerror: () => reject(new Error('nicht erreichbar')),
                ontimeout: () => reject(new Error('Timeout')),
            });
        });
    }

    function isConfigured(app) {
        return GM_getValue(app + 'Url', '') && GM_getValue(app + 'Key', '');
    }

    function configure(app) {
        const url = prompt(label[app] + '-URL (z.B. http://192.168.1.10:' + (app === 'radarr' ? 7878 : 8989) + '):', GM_getValue(app + 'Url', ''));
        if (url === null) return;
        const key = prompt(label[app] + '-API-Key (Settings → General → Security):', GM_getValue(app + 'Key', ''));
        if (key === null) return;
        GM_setValue(app + 'Url', url.trim());
        GM_setValue(app + 'Key', key.trim());
        invalidateLibrary(app);
        api(app, '/api/v3/system/status')
            .then(async (s) => {
                GM_setValue(app + 'Profile', '');
                GM_setValue(app + 'Root', '');
                let summary = label[app] + ' verbunden (v' + s.version + ')';
                try {
                    const profile = await choose(app, '/api/v3/qualityprofile', app + 'Profile', 'Standard-Quality-Profil wählen', (o) => o.name);
                    const root = await choose(app, '/api/v3/rootfolder', app + 'Root', 'Standard-Ordner wählen', (o) => o.path);
                    summary += '\nProfil: ' + profile.name + '\nOrdner: ' + root.path;
                } catch (e) {
                    summary += '\nStandard-Auswahl übersprungen — wird beim ersten Hinzufügen gefragt';
                }
                alert(summary);
                location.reload();
            })
            .catch((e) => alert(label[app] + ': Verbindung fehlgeschlagen — ' + e.message));
    }

    GM_registerMenuCommand('Radarr konfigurieren', () => configure('radarr'));
    GM_registerMenuCommand('Sonarr konfigurieren', () => configure('sonarr'));
    GM_registerMenuCommand('Status neu laden (Cache leeren)', () => {
        invalidateLibrary('radarr');
        invalidateLibrary('sonarr');
        location.reload();
    });

    // ---- Bibliothek: ein Request pro App, 5 Minuten im Tampermonkey-Storage gecacht ----
    const LIB_TTL = 5 * 60 * 1000;
    const libCache = {};

    // Nur die Felder speichern, die für die Badges gebraucht werden
    function slim(app, list) {
        return list.map((x) => app === 'radarr'
            ? { imdbId: x.imdbId, tmdbId: x.tmdbId, hasFile: x.hasFile, monitored: x.monitored, isAvailable: x.isAvailable, sizeOnDisk: x.sizeOnDisk,
                movieFile: x.movieFile && x.movieFile.quality ? { quality: x.movieFile.quality } : undefined }
            : { imdbId: x.imdbId, tvdbId: x.tvdbId, monitored: x.monitored, ended: x.ended, statistics: x.statistics,
                seasons: (x.seasons || []).map((se) => ({ seasonNumber: se.seasonNumber, monitored: se.monitored, statistics: se.statistics })) });
    }

    function invalidateLibrary(app) {
        GM_setValue(app + 'LibCache', '');
        delete libCache[app];
    }

    function library(app) {
        if (!libCache[app]) {
            libCache[app] = (async () => {
                let list = null;
                const cached = GM_getValue(app + 'LibCache', '');
                if (cached) {
                    try {
                        const c = JSON.parse(cached);
                        if (Date.now() - c.ts < LIB_TTL) list = c.list;
                    } catch (e) {}
                }
                if (!list) {
                    list = slim(app, await api(app, app === 'radarr' ? '/api/v3/movie' : '/api/v3/series'));
                    GM_setValue(app + 'LibCache', JSON.stringify({ ts: Date.now(), list }));
                }
                const byImdb = new Map(), byNum = new Map();
                for (const x of list) {
                    if (x.imdbId) byImdb.set(x.imdbId, x);
                    byNum.set(app === 'radarr' ? x.tmdbId : x.tvdbId, x);
                }
                return { byImdb, byNum };
            })();
            libCache[app].catch(() => { delete libCache[app]; });
        }
        return libCache[app];
    }

    // Badge-Inhalt aus dem Bibliotheks-Eintrag: 'have' = vorhanden, 'partial' = unvollständig
    // (Sonarr: Episoden-Zähler + Staffel-Aufschlüsselung im Tooltip), 'missing' = nicht in der Bibliothek
    function describe(app, item) {
        if (!item) return { st: 'missing', text: '+', title: 'Zu ' + label[app] + ' hinzufügen', color: '#9ab' };
        const mon = item.monitored === false ? ' · nicht überwacht' : '';
        if (app === 'radarr') {
            if (item.hasFile) {
                const q = item.movieFile && item.movieFile.quality && item.movieFile.quality.quality ? ' · ' + item.movieFile.quality.quality.name : '';
                return { st: 'have', text: '✓', title: 'In Radarr · vorhanden' + q + mon, color: COLOR.have };
            }
            const why = item.isAvailable === false ? ' · noch nicht erschienen' : ' · Download fehlt noch';
            return { st: 'partial', text: '~', title: 'In Radarr' + why + mon, color: COLOR.partial };
        }
        const s = item.statistics || {};
        const have = s.episodeFileCount || 0;
        const total = s.episodeCount || 0;
        const seasons = (item.seasons || [])
            .filter((se) => se.statistics && se.statistics.totalEpisodeCount > 0)
            .map((se) => {
                const st2 = se.statistics || {};
                const name = se.seasonNumber === 0 ? 'Specials' : 'S' + String(se.seasonNumber).padStart(2, '0');
                return name + ': ' + (st2.episodeFileCount || 0) + '/' + (st2.episodeCount || 0)
                    + (se.monitored === false ? ' (nicht überwacht)' : '');
            });
        const head = 'In Sonarr · ' + have + '/' + total + ' Episoden · ' + (item.ended ? 'beendet' : 'läuft') + mon;
        const title = [head].concat(seasons).join('\n');
        if (total > 0 && have >= total) return { st: 'have', text: '✓', title, color: COLOR.have };
        return { st: 'partial', text: total > 0 ? have + '/' + total : '~', title, color: COLOR.partial };
    }

    async function choose(app, path, storeKey, title, display) {
        const list = await api(app, path);
        const stored = GM_getValue(storeKey, '');
        const found = list.find((o) => String(o.id) === stored);
        if (found) return found;
        if (list.length === 1) { GM_setValue(storeKey, String(list[0].id)); return list[0]; }
        const n = parseInt(prompt(title + ':\n' + list.map((o, i) => (i + 1) + ': ' + display(o)).join('\n') + '\n\nNummer eingeben:', '1'), 10);
        const sel = list[n - 1];
        if (!sel) throw new Error('abgebrochen');
        GM_setValue(storeKey, String(sel.id));
        return sel;
    }

    // Film/Serie per Lookup holen und mit gemerktem Profil/Ordner hinzufügen (startet direkt die Suche)
    async function add(app, ids) {
        const term = app === 'radarr' ? (ids.tmdb ? 'tmdb:' + ids.tmdb : 'imdb:' + ids.imdb) : 'tvdb:' + ids.tvdb;
        const lookupPath = app === 'radarr' ? '/api/v3/movie/lookup?term=' : '/api/v3/series/lookup?term=';
        const [item] = await api(app, lookupPath + encodeURIComponent(term));
        if (!item) throw new Error('nicht gefunden');
        const profile = await choose(app, '/api/v3/qualityprofile', app + 'Profile', 'Quality-Profil wählen', (o) => o.name);
        const root = await choose(app, '/api/v3/rootfolder', app + 'Root', 'Root-Ordner wählen', (o) => o.path);
        const payload = Object.assign({}, item, {
            qualityProfileId: profile.id,
            rootFolderPath: root.path,
            monitored: true,
            addOptions: app === 'radarr' ? { searchForMovie: true } : { searchForMissingEpisodes: true },
        });
        const res = await api(app, app === 'radarr' ? '/api/v3/movie' : '/api/v3/series', 'POST', payload);
        invalidateLibrary(app);
        return res;
    }

    // Overlay-Badges brauchen einen positionierten Container, sonst landen sie im Viewport
    function ensurePositioned(el) {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    }

    function makeBadge(app, item, ids, css) {
        const d = describe(app, item);
        const clickable = d.st === 'missing';
        const el = document.createElement(clickable ? 'button' : 'span');
        el.type = 'button';
        el.className = 'rs-badge';
        el.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:1.4em;height:1.4em;padding:0 .3em;'
            + 'border-radius:.35rem;font-size:.78rem;font-weight:700;line-height:1;font-family:inherit;'
            + 'background:rgba(0,0,0,.7);border:1px solid;cursor:' + (clickable ? 'pointer' : 'default') + ';' + (css || '');
        const set = (text, title, color) => {
            el.textContent = text;
            el.title = title;
            el.style.color = color;
            el.style.borderColor = color;
        };
        set(d.text, d.title, d.color);
        if (clickable) {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                el.disabled = true;
                el.textContent = '…';
                try {
                    await add(app, ids);
                    set('✓', 'Zu ' + label[app] + ' hinzugefügt — Suche läuft', COLOR.have);
                } catch (err) {
                    set('!', label[app] + ': ' + err.message, COLOR.err);
                    el.disabled = false;
                }
            });
        }
        return el;
    }

    function placeBadge(el, app, item, ids) {
        const cover = el.querySelector('.browse-card__front, .release-list-card__media');
        if (cover) {
            ensurePositioned(cover);
            const top = cover.querySelector('.browse-card__flag, .release-list-card__badge') ? '2.4rem' : '.5rem';
            cover.appendChild(makeBadge(app, item, ids, 'position:absolute;top:' + top + ';left:.5rem;z-index:2;'));
        } else {
            const title = el.querySelector('.rt-cell-name a[href*="details/"]')
                || el.querySelector('a.release-card__title')
                || el.querySelector('a[href*="details/"]');
            const badge = makeBadge(app, item, ids, 'margin-left:.35rem;vertical-align:middle;');
            if (title) title.insertAdjacentElement('afterend', badge);
            else el.appendChild(badge);
        }
    }

    // ---- Quelle 1: serverseitig gerenderte data-Attribute (Karten, Tabelle, Schnellsuche) ----
    function scanAttrs() {
        const els = [...document.querySelectorAll('[data-tvdb-id], [data-imdb-id], [data-tmdb-id]')].filter((el) => !el.dataset.rsDone);
        for (const el of els) {
            el.dataset.rsDone = '1';
            for (const inner of el.querySelectorAll('img, a[href]')) inner.dataset.rsDone = '1';
            const ids = {};
            if (el.dataset.tvdbId) ids.tvdb = +el.dataset.tvdbId;
            if (el.dataset.tmdbId) ids.tmdb = +el.dataset.tmdbId;
            if (el.dataset.imdbId) ids.imdb = el.dataset.imdbId;
            const app = ids.tvdb ? 'sonarr' : 'radarr';
            if (!isConfigured(app)) continue;
            library(app).then(({ byImdb, byNum }) => {
                const item = ids.tvdb ? byNum.get(ids.tvdb)
                    : (ids.tmdb && byNum.get(ids.tmdb)) || (ids.imdb && byImdb.get(ids.imdb));
                placeBadge(el, app, item, ids);
            }).catch(() => {});
        }
    }

    // ---- Quelle 2: IMDb-ID aus Cover-URLs (Flächen ohne data-Attribute, z.B. Slider) ----
    const IMG_RE = /movies_(\d{7,})-cover\.webp/;
    function scanCards() {
        if (!isConfigured('radarr')) return;
        const imgs = [...document.querySelectorAll('img[src*="movies_"]')]
            .filter((i) => !i.dataset.rsDone && IMG_RE.test(i.getAttribute('src') || ''));
        if (!imgs.length) return;
        library('radarr').then(({ byImdb, byNum }) => {
            for (const img of imgs) {
                if (img.dataset.rsDone) continue;
                img.dataset.rsDone = '1';
                const imdb = 'tt' + (img.getAttribute('src').match(IMG_RE))[1];
                const parent = img.parentElement;
                if (!parent) continue;
                ensurePositioned(parent);
                const top = parent.querySelector('.browse-card__flag, .release-list-card__badge') ? '2.4rem' : '.5rem';
                const b = makeBadge('radarr', byImdb.get(imdb), { imdb },
                    'position:absolute;top:' + top + ';left:.5rem;z-index:2;');
                parent.appendChild(b);
            }
        }).catch(() => {});
    }

    // ---- Quelle 3: externe IMDb-/TMDB-/TVDB-Links (Detailseiten, Watchlist, Serien-Listen) ----
    function matchLink(href) {
        let m;
        if ((m = href.match(/thetvdb\.com\/(?:\?tab=series&(?:amp;)?id=|dereferrer\/series\/)(\d+)/i))) return { app: 'sonarr', ids: { tvdb: +m[1] } };
        if ((m = href.match(/themoviedb\.org\/movie\/(\d+)/i))) return { app: 'radarr', ids: { tmdb: +m[1] } };
        if ((m = href.match(/imdb\.com\/title\/(tt\d+)/i))) return { app: 'radarr', ids: { imdb: m[1] } };
        return null;
    }

    const onDetailPage = location.pathname.includes('details') || /^\/(series|movies|anime)\/\d+$/.test(location.pathname);
    const connectShown = {};

    function scanLinks() {
        const links = [...document.querySelectorAll('a[href]')].filter((a) => !a.dataset.rsDone);
        for (const a of links) {
            a.dataset.rsDone = '1';
            const hit = matchLink(a.getAttribute('href') || '');
            if (!hit || !a.parentElement) continue;
            if (!isConfigured(hit.app)) {
                if (onDetailPage && !connectShown[hit.app]) {
                    connectShown[hit.app] = true;
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn btn-sm btn-outline-primary';
                    btn.textContent = label[hit.app] + ' verbinden';
                    btn.addEventListener('click', (e) => { e.preventDefault(); configure(hit.app); });
                    a.insertAdjacentElement('afterend', btn);
                }
                continue;
            }
            if (a.parentElement.dataset.rsBadged) continue;
            a.parentElement.dataset.rsBadged = '1';
            library(hit.app).then(({ byImdb, byNum }) => {
                const item = hit.ids.imdb ? byImdb.get(hit.ids.imdb) : byNum.get(hit.ids.tmdb || hit.ids.tvdb);
                a.insertAdjacentElement('afterend', makeBadge(hit.app, item, hit.ids, 'margin-left:.35rem;vertical-align:middle;'));
            }).catch(() => {});
        }
    }

    // TV-Detailseiten haben IMDb- UND TVDB-Links nebeneinander — dort gewinnt Sonarr,
    // die IMDb/TMDB-Nachbarn im selben Container werden übersprungen
    function pinTvContainers() {
        for (const a of document.querySelectorAll('a[href*="thetvdb.com"]')) {
            const p = a.parentElement;
            if (p && !p.dataset.rsPinned) {
                p.dataset.rsPinned = '1';
                for (const sib of p.querySelectorAll('a[href*="imdb.com"], a[href*="themoviedb.org"]')) sib.dataset.rsDone = '1';
            }
        }
    }

    function fmtSize(b) {
        if (!b) return null;
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return b.toFixed(b >= 100 ? 0 : 1) + ' ' + units[i];
    }

    // Sichtbare Info-Zeilen für das Toolbox-Panel (Film-/Serien-/Anime-Seiten)
    function panelLines(app, item) {
        const lines = [];
        if (app === 'radarr') {
            if (item.hasFile) {
                const q = item.movieFile && item.movieFile.quality && item.movieFile.quality.quality ? ' (' + item.movieFile.quality.quality.name + ')' : '';
                lines.push({ text: '✓ Vorhanden' + q, color: COLOR.have });
            } else {
                lines.push({ text: item.isAvailable === false ? 'Noch nicht erschienen' : 'Download fehlt noch', color: COLOR.partial });
            }
            const size = fmtSize(item.sizeOnDisk);
            if (size) lines.push({ text: 'Größe: ' + size });
        } else {
            const s = item.statistics || {};
            const have = s.episodeFileCount || 0, total = s.episodeCount || 0;
            if (total > 0 && have >= total) lines.push({ text: '✓ Komplett (' + have + '/' + total + ' Episoden)', color: COLOR.have });
            else lines.push({ text: have + '/' + total + ' Episoden', color: COLOR.partial });
            for (const se of item.seasons || []) {
                const st2 = se.statistics || {};
                if (!st2.totalEpisodeCount) continue;
                const name = se.seasonNumber === 0 ? 'Specials' : 'S' + String(se.seasonNumber).padStart(2, '0');
                const ok = (st2.episodeCount || 0) > 0 && (st2.episodeFileCount || 0) >= st2.episodeCount;
                lines.push({ text: name + ': ' + (st2.episodeFileCount || 0) + '/' + (st2.episodeCount || 0)
                        + (se.monitored === false ? ' · nicht überwacht' : ''), color: ok ? COLOR.have : undefined });
            }
            lines.push({ text: item.ended ? 'Beendet' : 'Läuft' });
            const size = fmtSize(s.sizeOnDisk);
            if (size) lines.push({ text: 'Größe: ' + size });
        }
        if (item.monitored === false) lines.push({ text: 'Nicht überwacht', color: COLOR.partial });
        return lines;
    }

    // Info-Panel in der Aktions-Spalte rechts (unter "Add to My Movies" / "My Shows")
    function renderPanel() {
        const box = document.querySelector('.series-actions-toolbox');
        if (!box || box.dataset.rsPanel) return;
        let app = null;
        const ids = {};
        for (const a of document.querySelectorAll('a[href]')) {
            const hit = matchLink(a.getAttribute('href') || '');
            if (!hit) continue;
            if (hit.app === 'sonarr') { app = 'sonarr'; ids.tvdb = hit.ids.tvdb; break; }
            app = 'radarr';
            Object.assign(ids, hit.ids);
        }
        if (!app || !isConfigured(app)) return;
        box.dataset.rsPanel = '1';

        // Das Panel ersetzt Inline-Badges an den IMDb/TMDB/TVDB-Buttons und das Cover-Overlay dieser Seite
        for (const a of document.querySelectorAll('a[href]')) {
            if (matchLink(a.getAttribute('href') || '')) a.dataset.rsDone = '1';
        }
        for (const img of document.querySelectorAll('img[src*="movies_"]')) img.dataset.rsDone = '1';

        const hr = document.createElement('hr');
        hr.className = 'series-actions-toolbox-divider';
        const lbl = document.createElement('span');
        lbl.className = 'series-actions-toolbox-label';
        lbl.textContent = label[app];
        const body = document.createElement('div');
        body.style.cssText = 'font-size:.85em;display:flex;flex-direction:column;gap:.25rem;';
        body.textContent = 'Lade …';
        box.appendChild(hr);
        box.appendChild(lbl);
        box.appendChild(body);

        const line = (text, color) => {
            const div = document.createElement('div');
            div.textContent = text;
            if (color) div.style.color = color;
            body.appendChild(div);
        };

        library(app).then(({ byImdb, byNum }) => {
            const item = ids.tvdb ? byNum.get(ids.tvdb)
                : (ids.tmdb && byNum.get(ids.tmdb)) || (ids.imdb && byImdb.get(ids.imdb));
            body.textContent = '';
            if (!item) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-sm btn-primary w-100';
                btn.textContent = 'Zu ' + label[app] + ' hinzufügen';
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.textContent = 'Wird hinzugefügt …';
                    try {
                        await add(app, ids);
                        btn.remove();
                        line('✓ Hinzugefügt — Suche läuft', COLOR.have);
                    } catch (e) {
                        btn.textContent = 'Fehler: ' + e.message;
                        btn.disabled = false;
                    }
                });
                body.appendChild(btn);
                return;
            }
            for (const l of panelLines(app, item)) line(l.text, l.color);
        }).catch((e) => { body.textContent = label[app] + ': ' + e.message; });
    }

    function scanAll() {
        scanAttrs();
        pinTvContainers();
        renderPanel();
        scanCards();
        scanLinks();
    }

    // Erst-Scan + Nachscannen bei dynamisch nachgeladenem Inhalt (Infinite Scroll, Schnellsuche)
    scanAll();
    let pending = null;
    new MutationObserver(() => {
        clearTimeout(pending);
        pending = setTimeout(scanAll, 300);
    }).observe(document.body, { childList: true, subtree: true });
})();
