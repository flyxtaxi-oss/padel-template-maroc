from io import BytesIO
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, NameObject, TextStringObject, RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
pdfmetrics.registerFont(TTFont('Arial','/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
pdfmetrics.registerFont(TTFont('Georgia','/System/Library/Fonts/Supplemental/Georgia.ttf'))
pdfmetrics.registerFont(TTFont('GeorgiaItalic','/System/Library/Fonts/Supplemental/Georgia Italic.ttf'))
r=PdfReader('/Users/jibril/Downloads/Golden-Padel-Club_Proposition-Quantyx-Flow.pdf')
w=PdfWriter()
cream=(.9569,.9373,.8941); ink=(.1176,.1059,.0784); gold=(.851,.698,.3529); navy=(.051,.1725,.3098)
# Remove the original text objects, including their extractable strings.
def excluded(i,x,y):
 if i==1: return 466<y<518
 if i==10: return 85<y<145 or 170<y<410
 if i==12: return (x>340 and 275<y<302) or (70<x<170 and 490<y<507)
 return False
for i,p in enumerate(r.pages):
 if i in [1,10,12]:
  cs=ContentStream(p['/Contents'],r); ops=[]; block=None
  for a,o in cs.operations:
   if o==b'BT': block=[]
   if block is not None:
    block.append((a,o))
    if o==b'ET':
     positions=[(float(b[4])*.75,(float(b[5])-1123*i)*.75) for b,c in block if c==b'Tm']
     if not any(excluded(i,x,y) for x,y in positions): ops.extend(block)
     block=None
   else: ops.append((a,o))
  cs.operations=ops;p[NameObject('/Contents')]=cs
 if i in [1,4,10,12]:
  b=BytesIO();h=float(p.mediabox.height);c=canvas.Canvas(b,pagesize=(float(p.mediabox.width),h))
  def line(x,y,t,size=10.5,font='Arial',color=ink):
   c.setFillColorRGB(*color);c.setFont(font,size);c.drawString(x,h-y,t)
  if i==1:
   for y,t in [(480,"Un club de padel vend du temps. Un créneau de 1 h 30 non réservé ne se revend"),(496.5,"jamais. Pour 4 personnes, une partie représente 400 DH, soit 100 DH par joueur."),(513,"Location de raquette : 20 DH par raquette, en supplément.")]:line(56.8,y,t)
  if i==4:
   # Replace the illustrated social preview as one vector card, including the old raster tariff.
   c.setFillColorRGB(*navy);c.roundRect(305,h-614,233,122,6,fill=1,stroke=0)
   line(329,509,'PADEL PREMIUM · TANGER',5,'Arial',gold)
   line(319,548,'Golden Padel',21,'Arial',cream);line(319,570,'Club',21,'Arial',cream)
   line(319,597,'4 terrains indoor   |   7j/7   |   400 DH / 1 h 30',5.6,'Arial',cream)
   line(319,607,'Pour 4 personnes · Raquette : 20 DH',5.6,'Arial',cream)
  if i==10:
   line(56.8,111.75,"L’équivalent de 1,5 partie",25,'Georgia',cream)
   line(56.8,139.5,'par semaine.',25,'GeorgiaItalic',gold)
   for y,t in [(189.75,'Une partie de 1 h 30 coûte 400 DH pour 4 personnes, soit 100 DH par joueur.'),(208.5,'Location de raquette : 20 DH par raquette, en supplément.'),(227.25,'Voici les équivalents en chiffre d’affaires, hors location de raquettes :')]:line(56.8,y,t,11,'Arial',cream)
   for x,num,ls in [(56.8,'2',['créneaux par mois représentent',"le montant de l’abonnement Essentiel"]),(221.2,'4',['créneaux par mois représentent',"le montant de l’abonnement Croissance"]),(385.6,'75',['créneaux sur la première année,','création et abonnement Croissance','compris'])]:
    line(x,276,num,22,'ArialBold',gold)
    for k,t in enumerate(ls):line(x,294+13.5*k,t,8,'Arial',cream)
   for y,t in [(357,'Première année avec Croissance : 12 000 + 12 × 1 490 = 29 880 MAD HT.'),(373,'29 880 ÷ 400 = 74,7, soit 75 créneaux sur l’année et environ 1,44 par semaine.'),(389,'Essentiel : 690 ÷ 400 = 1,73 ; Croissance : 1 490 ÷ 400 = 3,73 créneaux par mois.'),(409,'Repères en chiffre d’affaires, avant charges et fiscalité ; ce n’est pas un bénéfice net.')]:line(56.8,y,t,10,'Arial',cream)
  if i==12:
   line(345.3,285,'Tarif : 400 DH / 1 h 30 pour 4 personnes',8.5)
   line(345.3,298.5,'Location de raquette : 20 DH par raquette',8.5)
   line(72.4,502.5,'contact@quantyx-flow.com',9,'Arial',cream)
  c.save();p.merge_page(PdfReader(b).pages[0])
 for a in p.get('/Annots',[]):
  a=a.get_object();action=a.get('/A')
  if action and 'gmail.com' in str(action.get('/URI','')):
   action[NameObject('/URI')]=TextStringObject('mailto:contact@quantyx-flow.com')
 w.add_page(p)
w.add_metadata({'/Title':'Golden Padel Club - Proposition Quantyx Flow','/Author':'Quantyx Flow','/Subject':'Proposition - tarifs padel et contact corrigés'})
w.add_uri(12,'mailto:contact@quantyx-flow.com',RectangleObject([72.4,337,195,352]))
out=Path('output/pdf/Golden-Padel-Club_Proposition-Quantyx-Flow_Corrigee.pdf')
with out.open('wb') as f:w.write(f)
check=PdfReader(out);text='\n'.join(p.extract_text() for p in check.pages)
assert len(check.pages)==13
for old in ['240 MAD','30 MAD','125 créneaux','zji063591@gmail.com','moins de trois','1 200 par mois']:
 assert old not in text,old
for good in ['contact@quantyx-flow.com','400 DH','20 DH','74,7','75']:
 assert good in text,good
print(out.resolve());print('13 pages; corrected text and calculations verified;',out.stat().st_size,'bytes')
