import urllib.request,urllib.parse,concurrent.futures,shutil
from html.parser import HTMLParser
from pathlib import Path
videos=[('1UEUkqWP5VCmyZTn3w_l06bFgzLHKeEwG','mohamed-shahir'),('1Aisc_-iEJ8iSqEt-quKjJ9X-hJOsPcVq','muhammad-sulaiman'),('147CgKyGiBrvdaqgsm-nz_LkIB9RJUOKF','sudha-devaraj'),('1dtr5bStdtbx2jOQINGT-xHMxEg35Mf0W','nor'),('1Z-4kND15KRYQGlHDtrpCpn8Ck5nYCHl9','teh-lai-ling')]
class Form(HTMLParser):
 def __init__(self): super().__init__();self.values={}
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='input' and a.get('type')=='hidden':self.values[a['name']]=a['value']
def download(item):
 fid,name=item
 r=urllib.request.urlopen('https://drive.google.com/uc?export=download&id='+fid,timeout=120)
 if 'text/html' in r.headers.get('Content-Type',''):
  form=Form();form.feed(r.read().decode());r=urllib.request.urlopen('https://drive.usercontent.google.com/download?'+urllib.parse.urlencode(form.values),timeout=120)
 if 'text/html' in r.headers.get('Content-Type',''):raise RuntimeError('Video download blocked: '+name)
 p=Path('assets/videos',name+'.mp4')
 with p.open('wb') as out:shutil.copyfileobj(r,out)
 print(name,p.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:list(pool.map(download,videos))
