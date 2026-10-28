# GymTrackerin kuvallinen käyttöohje

Julkinen osoite: https://donturexdev.fi/gymtracker/ohje/

Staattinen suomenkielinen sivusto: 15 aihealuetta ja 62 avattavaa ohjekohtaa.
Sisältö käsittää ohjelmat ja manuaalisen hallinnan, liikekirjaston, voimatreenin,
lämmittelyn ja levon, treenikohtaiset muutokset, ulko- ja sisäkardion, GPS:n,
Valmentajan ja viikkopalautteen, kehonhuollon ja loppuvenyttelyn, historian ja
kehityksen, Wear OS:n, Health Connectin, asetukset, käyttöoikeudet ja varmuuskopiot.

## Käyttö ja ylläpito

- `index.html`: valmis sivu. Toimii ilman buildia ja sisältö on luettavissa myös ilman JavaScriptiä.
- `styles.css`: sovelluksen tummaan, turkoosiin ja lilaan tyyliin sovitettu responsiivinen ulkoasu sekä tulostustyyli.
- `guide.js`: haku, kuvien suurennus, sisällysluettelon korostus ja tulostus.
- `assets/`: 16 oikeaa kuvankaappausta WebP-muodossa sekä sovelluksen kuvake.
- `generate.py`: sisällön ylläpitolähde. Muokkaa sisältöä täällä ja suorita `python generate.py` päivittääksesi HTML:n.

Julkaisu ei tarvitse Pythonia, palvelinta, ulkoisia fontteja, analytiikkaa,
evästeitä tai kolmannen osapuolen JavaScript-kirjastoja. Hakusanat käsitellään selaimessa.
Kuvat avautuvat natiivissa dialogissa; Escape sulkee suurennuksen.
Tulostus avaa ohjekohdat automaattisesti ja palauttaa niiden tilan tulostuksen jälkeen.

## Sisällön ja kuvien lähteet

Päivitetty 28.10.2026. Kuvankaappaukset on otettu Android 16 / Pixel 9a
-testiemulaattorista GymTracker-versiolla 2.3.1.5 (375). Kuvissa on testiasennuksen
esimerkkitietoja. Kuvia ei ole piirretty uudelleen tai generoitu tekoälyllä:
ainoastaan koko ja tiedostomuoto on optimoitu verkkoon (720 × 1616).
Kuvake on sovelluksen olemassa oleva launcher-resurssi.

Ominaisuudet on tarkistettu sovelluksen näkymistä sekä niitä vastaavan
GymTrackerin `codex/subscription-model`-haaran toteutuksesta. Tarkistus kattoi
navigaation, asetukset, ohjelmanluonnin, sarjojen käyttöopastuksen, muun liikunnan,
Valmentajan, viikkopalautteen, historian, Wear OS -toiminnot ja Health Connectin.
Vanhojen in-app-ohjetekstien tekoälyä ja unitietoja koskevia väitteitä ei kopioitu.

Kellon osuutta havainnollistaa puhelimesta otettu Wear OS -asetusnäkymä.
Fyysisen kellon anturitoimintaa tai oikeaa GPS-reittiä ei validoitu tällä dokumentointikierroksella.
Tilaushintoja ei kovakoodata ohjeeseen: käyttäjä tarkistaa ne Google Play -näkymästä.

## Tarkistukset

- Kaikki sivun sisäiset ankkurit ja paikalliset resurssiviitteet tarkistetaan `validate.py`-komennolla.
- JavaScriptin syntaksi: `node --check guide.js`.
- Selain: työpöytä ja mobiili; haku, tyhjä hakutulos, haun tyhjennys, ohjekohdan avaus sekä kuvasuurennus ja Escape.
- Koko sovelluksen Android-buildia tai testejä ei tarvita: sovelluskoodia ei muutettu.

## Kuvien oikeudet

Sovelluksen resurssit ja kuvankaappaukset: © 2026 Donturex Development.
