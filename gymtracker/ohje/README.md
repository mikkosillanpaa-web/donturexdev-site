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

## Asettelu ja löydettävyys

- Selkeät lukujen nimet ovat samat otsikoissa ja sisällysluettelossa. Kaikki aiemmat luku- ja ohjekohta-ankkurit säilyvät.
- Tiivis aloitus nostaa haun ja linkitetyn kolmen vaiheen pikaohjeen näkyviin.
- Haku järjestää otsikko-osumat ennen sivumainintoja ja näyttää enintään kahdeksan linkitettyä tulosta katkelmineen. Kaikki osuvat ohjekohdat avataan sivulla. Korostukset rakennetaan tekstisolmuina.
- Mobiilin yläpalkin Aiheet ja Haku avaavat natiivin dialogin, jonka hakukenttä käyttää samaa hakutilaa kuin pääsivu. Tab/Shift+Tab kiertävät dialogissa ja Esc palauttaa kohdistuksen avauspainikkeeseen. Aihevalinta vie kohdistuksen valittuun ohjeeseen.
- Kuvakehys on lohkoelementti. Kuvat ovat tilan salliessa 280–300 px leveitä; sarjan painonsyötön, loppuvenyttelyn ja Kehitys-välilehden tarkemmat kuvat ovat niitä käsittelevien avattavien ohjeiden sisällä. Vaakasuunnassa vieritettäviä kuvagallerioita ei tarvita.
- Teksti ja kuva ovat rinnakkain vasta, kun luvun sisältöalue on vähintään 50 rem leveä. Suurennettu teksti vaihtaa asettelun aiemmin päällekkäiseksi. Yläpalkin korkeus mitataan ankkurihyppyjä varten, eikä ankkureille lisätä päällekkäistä marginaalia.
- Tuloste sisältää kaikki ohjekohdat ja 15 varsinaista ohjekuvaa. Koristeellinen aloituskuva jätetään pois. Laajat ruudukot puretaan tulosteessa tavalliseksi tekstivirraksi, jotta sivunvaihdot toimivat. Tulostuksen jälkeen palautetaan myös haku, suodatus, kohdistus ja vierityskohta.

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
- Selain: leveydet 360, 390, 768, 1024 ja 1440 px sekä asettelun vaihtumiskohtia 1088–1200 px; ei sivun vaakavieritystä. Myös 200 % tekstikoolla kaikki viisi pääleveyttä tarkistettu.
- Kaikki 15 lukuankkuria, pikaohjeen linkit ja aktiivinen luku; otsikon väli yläpalkkiin noin 16–17 px.
- Hakusanat `varmuuskopio`, `kello` ja `sarja`, tyhjä tulos, HTML:ltä näyttävä syöte, haun tyhjennys ja siirtyminen toiseen lukuun.
- Mobiilin yhteinen haku, dialogin avaaminen kesken ohjeen, Tab/Shift+Tab, Esc ja kohdistuksen palautus; myös kuvasuurennuksen kohdistus ja kuvateksti tarkistettu.
- PDF-esikatselu tuotettu erillisellä Chrome-testiprofiililla ja tarkistettu renderöidyistä sivuista. Kaikki 62 ohjekohtaa ja 15 ohjekuvaa tulostuvat; selaimen beforeprint/afterprint-kierros palautti hakusanan ja kohteiden tilat.
- Koko sovelluksen Android-buildia tai testejä ei tarvita: sovelluskoodia ei muutettu.

## Kuvien oikeudet

Sovelluksen resurssit ja kuvankaappaukset: © 2026 Donturex Development.
