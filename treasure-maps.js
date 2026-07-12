// ==UserScript==
// @name         treasure-maps.com - Auf IMDb/TMDB/TVDB/AniDB ein Treasure Maps-Such-Icon beim Titel ergänzen
// @version      2026.04.11.1625
// @author       treasure-maps.com
// @description  Fügt auf IMDb, TMDB, TVDB und AniDB ein anklickbares treasure-maps-Icon ein, um direkt auf der Treasure Maps Seite mit der Film-ID oder mit dem Serien-/Anime-Titel zu suchen.
// @match        https://www.imdb.com/title/*
// @match        https://www.imdb.com/*/title/*
// @match        https://www.themoviedb.org/movie/*
// @match        https://www.themoviedb.org/tv/*
// @match        https://*.thetvdb.com/movies/*
// @match        https://*.thetvdb.com/series/*
// @match        https://anidb.net/anime/*
// @icon         data:image/x-icon;base64,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lKZQaHQoMjcABgYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGCQkgKC03SlNMYW5YcoBee4tjgJBhgJJdfY1ZdYROZ3NBVF4oMzoMEhIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==
// @grant        GM_info
// ==/UserScript==

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Hinweis:
// Um direkt auf Treasure Maps mit der Film-ID oder mit dem Serien-/Anmie-Titel zu suchen, wird
// bei IMDb, TMDB und TVDB das Treasure Maps-Icon links unterhalb des Haupttitels als anklickbares Icon eingefügt,
// bei AniDB wird das Treasure Maps-Icon links in der Info- und der Titles-Box vor dem "Main Title" und jedem "Official Title" (in jeder Sprache) als anklickbares Icon eingefügt.
// Das soll bei AniDB die Erkennung erleichtern, wonach man genau sucht.
// Der Suchbegriff "Frieren: Nach dem Ende der Reise" bringt auf Treasure Maps nicht die gleichen Resultate wie der Suchbegriff "Frieren: Beyond Journey's End" oder "Sousou no Frieren"
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Quelle https://github.com/Antidote2151/tampermonkey-scripte/blob/main/treasure-maps.js
// Funktionsfähig für AniDB.net abgeändert und vollständige Ersetzung von SceneNZBs durch Treasure Maps

// Definition mit true/false, auf welchen Seiten man doch kein Treasure Maps-Icon sehen will
const SHOW_ICON_ON = {
    IMDb:  true,
    TMDB:  true,
    TVDB:  true,
    AniDB: true
};

(function () {
    'use strict';

    // Basis-URL von Treasure Maps
    const TM_BASE = 'https://treasure-maps.com';

    // Icon-Grössen: grosses Icon unter Haupttitel, kleines Icon beim Originaltitel
    const ICON_MAIN = 24;
    const ICON_ORIGINAL = 16;

    // --------------------------------------------------------------------------
    // 1) Titel-Bereinigung
    //    Treasure Maps akzeptiert manche Unicode-Zeichen nicht (z.B. EN DASH „–“)
    //    Diese Mapping-Tabelle ersetzt problematische Zeichen durch ASCII.
    //    Sie ist nicht vollständig und dient als Ausgangslage, die bei Bedarf
    //    erweitert werden kann.
    // --------------------------------------------------------------------------
    const TITLE_MAP = {
        // "Der Astronaut – Project Hail Mary"
        "–": "-",
        "—": "-",
        // "Schindler’s List"
        "’": "'",
        // "WALL·E"
        "·": "-",
        // WALL·E - Der Letzte räumt die Erde auf
        "ä": "ae",
        // "Fack ju Göhte"
        "ö": "oe",
        // "Wüstenblume"
        "ü": "ue",
        // "Ännchen von Tharau"
        "Ä": "Ae",
        // "Ödipussi"
        "Ö": "Oe",
        // "Übernachtungsgast"
        "Ü": "Ue",
        // "Das weiße Band"
        "ß": "ss"
    };

    // Wendet die Mapping-Tabelle auf einen Titel an
    function cleanTitle(str) {
        if (!str) return "";
        let out = str;
        for (const [bad, good] of Object.entries(TITLE_MAP)) {
            out = out.split(bad).join(good);
        }
        return out.trim();
    }

    // --------------------------------------------------------------------------
    // Erstellt das anklickbare Treasure Maps-Icon
    // url   = Ziel-URL
    // title = Tooltip-Titel
    // size  = Icon-Grösse (24px oder 16px)
    // --------------------------------------------------------------------------
    function createSceneLink(url, title, size = ICON_MAIN) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        // Tooltip-Text
        a.title = `Suche auf treasure-maps: ${title}`;

        a.style.display = 'inline-block';
        a.style.marginLeft = '6px';

        const img = document.createElement('img');
        // Icon aus dem Userscript-Header
        img.src = GM_info.script.icon;
        img.width = size;
        img.height = size;
        img.alt = 'treasure-maps';

        // Sichtbarkeit des Favicon.ico verbessern mit weissem Hintergrundkreis
        img.style.background = "white";
        // leicht abgerundetes Quadrat wäre
        // img.style.borderRadius = "10%";

        // runder Kreis ab 50%
        img.style.borderRadius = "50%";
        // weisser Rand um Icon im Kreis
        img.style.padding = "2px";

        // Abstände des gesamten Bildes - margin: TOP RIGHT BOTTOM LEFT;
        a.style.margin = "0px 8px 2px 0px";

        a.appendChild(img);
        return a;
    }

    // Fügt ein Icon in einer neuen Zeile direkt unterhalb eines Elements ein
    function insertBelow(element, node) {
        const wrap = document.createElement('div');
        wrap.style.marginTop = '4px';
        wrap.appendChild(node);
        element.insertAdjacentElement('afterend', wrap);
    }

    // Baut eine Treasure Maps-Textsuche MIT Kategorie
    function buildSceneTextUrlWithCat(title, cat) {
        return `${TM_BASE}/search?cat=${encodeURIComponent(cat)}&q=${encodeURIComponent(cleanTitle(title))}`;
    }

    // Baut eine Treasure Maps-Textsuche OHNE Kategorie
    function buildSceneTextUrl(title) {
        return `${TM_BASE}/search?cat=-1&q=${encodeURIComponent(cleanTitle(title))}`;
    }

    // --------------------------------------------------------------------------
    // IMDb-Handler
    // Filme →  Direkte ID-Suche auf SceneNBs
    // Serien → Textsuche mit Serien-Kategorie
    // --------------------------------------------------------------------------
    function handleIMDb() {
        if (!SHOW_ICON_ON.IMDb) return;
        if (!location.pathname.includes('/title/')) return;

        // Haupttitel extrahieren
        // IMDb hat unterschiedliche DOM-Varianten:
        // 1) Firefox: data-testid="hero__pageTitle" + span[data-testid="hero__primary-text"]
        // 2) Chrome: <h1 class="sc-b41e510f-0 ..."> ohne data-testid
        const h1 =
            document.querySelector('h1[data-testid="hero__pageTitle"]') ||
            document.querySelector('h1.sc-b41e510f-0') ||
            document.querySelector('h1');

        if (!h1) return;

        // Titel extrahieren:
        // Firefox: Titel steckt im <span data-testid="hero__primary-text">
        // Chrome:  Titel steht direkt im <h1>
        const span = h1.querySelector('span[data-testid="hero__primary-text"]');
        const rawTitle = span?.textContent || h1.textContent;
        const title = cleanTitle(rawTitle);

        if (!title) return;

        // IMDb-ID extrahieren (tt1234567)
        const m = location.pathname.match(/\/title\/(tt\d+)/);
        const imdbId = m ? m[1] : null;
        const numericId = imdbId?.replace(/^tt/, '');

        // Erkennen, ob Film oder Serie
        let kind = null;
        const og = document.querySelector('meta[property="og:type"]');
        if (og?.content === 'video.movie') kind = 'movie';
        if (og?.content === 'video.tv_show') kind = 'series';

        let url = null;

        // Filme → Direkte ID-Suche
        if (kind === 'movie' && numericId) {
            url = `${TM_BASE}/movies/${numericId}`;

            // Serien → Textsuche + Serien-Kategorie
        } else if (kind === 'series') {
            url = `${TM_BASE}/search?cat=5000,5100&q=${encodeURIComponent(title)}`;

            // Wenn Kategorie unklar, Fallback nur mit Textsuche
        } else {
            url = buildSceneTextUrl(title);
        }

        if (url) insertBelow(h1, createSceneLink(url, title));
    }


    // --------------------------------------------------------------------------
    // TMDB-Handler
    // Filme/Serien → Textsuche mit Kategorien
    // Zusätzlich: kleines Icon beim Originaltitel
    // --------------------------------------------------------------------------
    function handleTMDB() {
        if (!SHOW_ICON_ON.TMDB) return;
        if (!location.hostname.includes('themoviedb.org')) return;

        const path = location.pathname;

        // Staffel- oder Episodenseiten ignorieren:
        // /tv/<id>-<slug>/season/<nr>
        // /tv/<id>-<slug>/season/<nr>/episode/<nr>
        if (path.includes('/season/') || path.includes('/episode/')) return;

        // Erkennen, ob Film oder Serie
        const isMovie = path.startsWith('/movie/');
        const isSeries = path.startsWith('/tv/');

        // Treasure Maps-Kategorien für Filme/Serien
        const cat = isMovie ? '2000,2100' : (isSeries ? '5000,5100' : null);
        if (!cat) return;

        // A) Großes Icon unter dem Haupttitel
        //    Funktioniert für Filme UND Serien, da TMDB beide Varianten unter <div class="title"> führt.
        const h2 = document.querySelector('div.title h2');
        const a = h2?.querySelector('a');
        const title = cleanTitle(a?.textContent);

        if (h2 && title) {
            const url = buildSceneTextUrlWithCat(title, cat);
            insertBelow(h2, createSceneLink(url, title, ICON_MAIN));
        }

        // B) Kleines Icon beim Originaltitel (rechts neben "Originaltitel")
        const wrap = document.querySelector("section.facts.left_column p.wrap");
        if (wrap) {
            const strong = wrap.querySelector("strong");

            // Originaltitel steht als Textnode direkt hinter <strong>
            const originalTitle = cleanTitle(strong?.nextSibling?.textContent);

            if (originalTitle) {
                const url = buildSceneTextUrlWithCat(originalTitle, cat);
                const icon = createSceneLink(url, originalTitle, ICON_ORIGINAL);

                // Icon direkt INS <strong> einfügen → rechts vom Label
                strong.appendChild(icon);
            }
        }
    }


    // --------------------------------------------------------------------------
    // TVDB-Handler
    // Filme/Serien → Textsuche mit Kategorien
    // --------------------------------------------------------------------------
    function handleTVDB() {
        if (!SHOW_ICON_ON.TVDB) return;
        if (!location.hostname.includes('thetvdb.com')) return;

        const path = location.pathname;

        // Erkennen, ob Film oder Serie
        const isMovie = path.startsWith('/movies/');
        const isSeries = path.startsWith('/series/');

        // Treasure Maps-Kategorien für Filme/Serien
        const cat = isMovie ? '2000,2100' : (isSeries ? '5000,5100' : null);
        if (!cat) return;

        // Haupttitel extrahieren
        const h1 = document.querySelector('h1#series_title');
        const title = cleanTitle(h1?.textContent);

        if (h1 && title) {
            const url = buildSceneTextUrlWithCat(title, cat);
            insertBelow(h1, createSceneLink(url, title, ICON_MAIN));
        }
    }


    // --------------------------------------------------------------------------------
    // AniDB-Handler
    // Anime-Serien → Textsuche mit Kategorien "TV-Anime" 5070 und "TV-DE-Anime" 5170
    // Anime-Filme  → Textsuche mit Kategorien "Movies"   2000 und "Movies-DE"   2100
    // Treasure Maps-Icon erscheint im Tab "Info" und im Tab "Title":
    // 1) Links vom Main Title
    // 2) Links vor dem Official Title (englisch)
    // 3) Links vor allen weiteren Official Titles in anderen Sprachen (z.B. japanisch)
    // Hinweis #1: Bei AniDB wird bewusst kein cleanTitle verwendet
    // --------------------------------------------------------------------------------
    function aniDB_prependIcon(td, title) {
        if (!td || !title) return;

        // Erkennen, ob Film oder Serie
        // Type aus AniDB-Seite lesen
        const typeNode = document.querySelector('tr.type td.value');
        const typeText = typeNode?.textContent?.trim().toLowerCase() || "";

        // Kategorien abhängig vom Type bestimmen
        let categories;
        if (typeText.startsWith("movie")) {
            // Anime-Film → Movies + Movies-DE
            categories = "2000,2100";
        } else {
            // Standard: Anime-Serie → TV-Anime + TV-DE-Anime
            categories = "5070,5170";
        }

        const url = `${TM_BASE}/search?cat=${categories}&q=${encodeURIComponent(title)}`;
        const icon = createSceneLink(url, title, ICON_ORIGINAL);

        // ----------------------------------------------------------------------
        // Alle Abstände des Treasure Maps-Icons (oben, rechts, unten, links)
        // margin-top/margin-right/margin-bottom/margin-left in einer Zeile:
        // margin:    TOP RIGHT BOTTOM LEFT
        // Beispiel:  5px 6px   0px    -2px
        // ----------------------------------------------------------------------
        icon.style.margin = "5px 6px 0px -2px";
        // Damit der Titel-Inhaltstext mitten neben dem Icon angezeigt wird
        icon.style.verticalAlign = "middle";

        // Icon IMMER als erstes Element einfügen
        td.insertBefore(icon, td.firstChild);
    }


    // --------------------------------------------------------------------------
    // AniDB-Handler
    // --------------------------------------------------------------------------
    function handleAniDB() {
        if (!SHOW_ICON_ON.AniDB) return;
        if (!location.hostname.includes("anidb.net")) return;
        if (!location.pathname.startsWith("/anime/")) return;

        // ----------------------------------------------------------------------
        // Main Title
        // Icon soll LINKS vom Text stehen
        // ----------------------------------------------------------------------
        const mainRow = document.querySelector('tr.romaji th.field');
        if (mainRow && mainRow.textContent.trim() === "Main Title") {
            const td = mainRow.parentElement.querySelector("td.value");
            const span = td?.querySelector('span[itemprop="name"]');
            const title = span?.textContent?.trim();

            aniDB_prependIcon(td, title);
        }

        // ----------------------------------------------------------------------
        // Official Titles (alle Sprachen)
        // Icon soll LINKS vom Text stehen
        // ----------------------------------------------------------------------
        const officialRows = document.querySelectorAll('tr.official th.field');
        officialRows.forEach(th => {
            if (th.textContent.trim() === "Official Title") {
                const td = th.parentElement.querySelector("td.value");
                const label = td?.querySelector("label[itemprop='alternateName']");
                const title = label?.textContent?.trim();

                aniDB_prependIcon(td, title);
            }
        });
    }

    // ------------------------------------------------------------------------------------
    // MutationObserver für den 2. Tab "Titles" (#tab_2_pane)
    // Fügt das Treasure Maps-Icon NUR für den Main Title ein, sobald AniDB den Tab rendert
    // ------------------------------------------------------------------------------------
    const titlesPane = document.querySelector('#tab_2_pane');

    if (titlesPane) {
        const observer = new MutationObserver(() => {
            // Main Title im Titles-Tab suchen
            const mainRow = titlesPane.querySelector('tr.romaji th.field');
            if (!mainRow) return;

            const td = mainRow.parentElement.querySelector('td.value');
            if (!td) return;

            // Prüfen, ob bereits ein Icon existiert → doppelte Icons vermeiden
            const existingIcon = td.querySelector('a[title^="Suche auf treasure-maps"]');
            if (existingIcon) return;

            // Titel extrahieren
            const span = td.querySelector('span[itemprop="name"]');
            const title = span?.textContent?.trim();
            if (!title) return;

            // Icon einfügen
            aniDB_prependIcon(td, title);
        });

        // Observer aktivieren
        observer.observe(titlesPane, { childList: true, subtree: true });
    }


    // --------------------------------------------------------------------------
    // Dispatcher: entscheidet anhand der Domain, welche Funktion ausgeführt wird
    // --------------------------------------------------------------------------
    function init() {
        const host = location.hostname;

        if (host.includes('imdb.com')) handleIMDb();
        else if (host.includes('themoviedb.org')) handleTMDB();
        else if (host.includes('thetvdb.com')) handleTVDB();
        else if (host.includes('anidb.net')) handleAniDB();
    }

    // Script starten, sobald DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();