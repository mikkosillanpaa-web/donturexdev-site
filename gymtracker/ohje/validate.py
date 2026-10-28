"""Check generated HTML anchors and local assets without third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from collections import Counter

ROOT=Path(__file__).resolve().parent
class GuideParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.images=[]; self.chapters=0; self.topics=0
        self.feature_ids=[]; self.quick_links=[]; self.context=[]; self.headings={}; self.heading_id=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='a' and a.get('href'):self.links.append(a['href'])
        if tag in ('script','img') and a.get('src'):self.links.append(a['src'])
        if tag=='link' and a.get('href'):self.links.append(a['href'])
        if tag=='img' and a.get('src'):self.images.append(a)
        if tag=='section' and a.get('class')=='chapter':self.chapters+=1
        if tag=='details' and a.get('class')=='feature':
            self.topics+=1; self.feature_ids.append(a.get('id'))
        if tag=='h2' and a.get('id','').startswith('heading-'):self.heading_id=a['id']
        if tag=='a' and 'data-guide-link' in a:self.quick_links.append(a.get('href'))
    def handle_data(self,data):
        if self.heading_id:self.headings[self.heading_id]=self.headings.get(self.heading_id,'')+data
    def handle_endtag(self,tag):
        if tag=='h2':self.heading_id=None
p=GuideParser();p.feed(ROOT.joinpath('index.html').read_text(encoding='utf-8'))
issues=[]
for key,count in Counter(p.ids).items():
    if count>1:issues.append(f'Duplicate id: {key}')
for href in p.links:
    parts=urlsplit(href)
    if parts.scheme or href.startswith('../'):continue
    if parts.path and not ROOT.joinpath(unquote(parts.path)).is_file():issues.append(f'Missing file: {href}')
    if not parts.path and parts.fragment and parts.fragment not in p.ids:issues.append(f'Missing anchor: {href}')
for img in p.images:
    if 'alt' not in img:issues.append(f'Missing alt: {img.get("src")}')
assert p.chapters==15,(p.chapters,'chapters')
assert p.topics==62,(p.topics,'topics')
expected_titles={
    'aloittaminen':'Käyttöönotto','ohjelmat':'Treeniohjelmat','liikkeet':'Liikekirjasto',
    'treeni':'Treenin kirjaaminen','lammittely':'Lämmittely ja lepoajastin',
    'muokkaus':'Treenin muokkaaminen','muut-treenit':'Muu liikunta ja GPS',
    'valmentaja':'Valmentaja','kehonhuolto':'Kehonhuolto ja loppuvenyttely',
    'historia':'Historia ja kehitys','wear-os':'Wear OS -kello',
    'health-connect':'Health Connect','asetukset':'Asetukset',
    'varmuuskopiointi':'Varmuuskopiointi','pulmat':'Ongelmatilanteet',
}
for slug,title in expected_titles.items():
    if p.headings.get('heading-'+slug)!=title:issues.append(f'Unexpected chapter heading: {slug}')
for href in ('#treeni','#treeni-1','#muokkaus-5'):
    if href not in p.quick_links:issues.append(f'Missing quick-start link: {href}')
for required in ('guide-search','mobile-search','mobile-tools','open-topics','open-search','search-results','image-dialog'):
    if required not in p.ids:issues.append(f'Missing guide control: {required}')
assert len(p.images)==17,'Preserve all original screenshot and icon references'
assert not issues,'\n'.join(issues)
print(f'PASS: {p.chapters} chapters, {p.topics} topics, {len(p.images)} image references; all local assets and anchors resolve.')
