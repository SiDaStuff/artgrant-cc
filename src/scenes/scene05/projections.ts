/** World-space projections: all five experiences share the original screen meshes. */
export const projectionVertex = `varying vec3 vWorld;
void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`

export const projectionFragment = `
uniform float uTime,uAtom,uOcean,uBody,uSpace,uHistory,uBrightness,uFinal,uClosing,uFocus;
varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.07)*.12;}
float line(float v,float w){return exp(-v*v/(w*w));}
float stars(vec2 p,float scale,float seed){vec2 cell=floor(p*scale);vec2 f=fract(p*scale)-.5;float h=hash(cell+seed);return step(.978,h)*exp(-dot(f,f)*(100.+h*140.))*(.5+h);}
void main(){
  float t=uTime;
  bool back=vWorld.z< -7.9;
  vec2 q=abs(vWorld.x)>5.9?vec2(vWorld.z*.82,vWorld.y):vWorld.xy;
  if(vWorld.y>4.45) q=vec2(vWorld.x,vWorld.z*.6+2.);
  vec2 p=q-vec2(0.,2.3);
  float flow=sin(q.x*.52+t*.075)*.34+sin(q.x*.9-t*.045)*.13;
  vec3 neutral=vec3(.018,.029,.028)+vec3(.11,.22,.19)*line(p.y-flow,.65);
  neutral+=vec3(.20,.13,.055)*line(p.y+flow,.13)*(.5+.5*sin(q.x*.4));
  float total=uAtom+uOcean+uBody+uSpace+uHistory;
  vec3 color=neutral*max(0.,1.-total);
  if(uAtom>.001){
    float field=sin(q.x*.72+sin(q.y*1.45+t*.12)*1.8+t*.07);
    float filaments=line(field,.018)*(.25+.75*fbm(q*2.+t*.05));
    float haze=fbm(q*.75+vec2(t*.045,-t*.025));
    vec3 atom=vec3(.008,.018,.04)+vec3(.035,.18,.30)*haze+vec3(.11,.55,.8)*filaments;
    atom+=vec3(.3,.65,.9)*stars(q+vec2(t*.012,0),12.,13.);
    atom+=vec3(.08,.18,.32)*line(sin(q.y*2.+q.x*.4+fbm(q*.7+t*.01)*2.),.08);
    if(back){
      vec2 a=p-vec2(.1,.15);float r=length(a);float angle=atan(a.y,a.x);
      float knot=.28+sin(angle*5.+t*.5)*.025+sin(angle*11.-t*.3)*.013;
      atom+=vec3(.38,.73,1.)*exp(-r*1.55)*.45;
      atom+=vec3(.65,.85,1.)*(line(r-knot,.045)+exp(-r*r*22.)*2.2);
      atom+=vec3(.15,.44,.65)*line(a.y-sin(a.x*1.4+t*.1)*.38,.035)*exp(-abs(a.x)*.5)*.65;
    }
    color+=atom*uAtom;
  }
  if(uOcean>.001){
    vec2 water=q+vec2(sin(q.y*1.8+t*.24)*.07,t*.025);
    float c=abs(sin(water.x*2.3+sin(water.y*2.8+t*.21)*1.4)+sin(water.y*3.6-water.x*.8-t*.17));
    float caustic=pow(max(0.,1.-c*.55),13.);
    float rays=pow(.5+.5*sin(q.x*1.35+q.y*.25+sin(q.x*.5+t*.07)),9.);
    vec3 sea=vec3(.006,.037,.067)+vec3(.015,.12,.17)*smoothstep(.3,4.6,q.y);
    sea+=vec3(.05,.25,.29)*caustic*.28+vec3(.025,.13,.19)*rays*smoothstep(0.,4.5,q.y);
    sea+=vec3(.07,.7,.65)*stars(q+vec2(t*.018,-t*.025),8.,41.);
    sea+=vec3(.025,.10,.16)*fbm(vec2(q.x*.5,q.y*.8-t*.06))*smoothstep(.3,4.4,q.y);
    if(back){
      vec2 w=(p-vec2(sin(t*.045)*1.3,.65+sin(t*.13)*.12));
      w.y+=sin(w.x*.8+t*.23)*.075;
      float profile=.31*sqrt(max(0.,1.-pow((w.x-.1)/2.1,2.)))*smoothstep(-2.2,-1.0,w.x);
      float whale=(1.-smoothstep(profile-.025,profile+.055,abs(w.y)))*(1.-smoothstep(1.8,2.2,abs(w.x)));
      vec2 tailP=w-vec2(-1.95,0.);
      float tail=(1.-smoothstep(.02,.09,abs(tailP.x+abs(tailP.y)*.65)-.17))*(1.-smoothstep(.25,.52,abs(tailP.y)));
      float fin=(1.-smoothstep(.01,.06,abs(w.x-.15+w.y*.45)-.11))*(1.-smoothstep(.15,.65,abs(w.y+.23)));
      sea*=1.-clamp(whale+tail*.6+fin*.55,0.,1.)*.43;
    }
    color+=sea*uOcean;
  }
  if(uBody>.001){
    vec2 cell=q*1.15+vec2(t*.12,sin(q.x*.4+t*.13)*.15);
    vec2 id=floor(cell),f=fract(cell)-.5;float h=hash(id);
    f-=(vec2(hash(id+7.),hash(id+13.))-.5)*.32;
    float r=length(f*vec2(1.,1.3));float membrane=line(r-(.19+h*.12),.025);
    float vessel=line(sin(q.y*1.3+sin(q.x*.55+t*.08)*1.6),.15);
    float vein=line(sin(q.y*1.3+sin(q.x*.55+t*.08)*1.6+.32),.045);
    vec3 bio=vec3(.047,.016,.031)+vec3(.23,.055,.075)*vessel+vec3(.42,.17,.16)*vein;
    bio+=vec3(.18,.085,.095)*membrane*(.4+.6*h);
    float phase=fract(t*.72);float beat=exp(-pow((phase-.13)*25.,2.))+.52*exp(-pow((phase-.31)*32.,2.));
    bio*=1.+beat*.22;
    color+=bio*uBody;
  }
  if(uSpace>.001){
    vec2 sky=q+vec2(t*.003,0.);
    if(back){vec2 lens=p-vec2(.15,.1);sky+=normalize(lens+vec2(.001))*.16/(dot(lens,lens)+.2);}
    float cloud=fbm(sky*.7+vec2(2.,4.));
    float band=line(p.y-sin(q.x*.45)*.55,.55)*cloud;
    vec3 cosmos=vec3(.002,.004,.012)+vec3(.065,.06,.12)*band;
    cosmos+=vec3(.7,.77,1.)*stars(sky,16.,7.)+vec3(.24,.32,.5)*stars(sky,31.,19.);
    vec2 galaxy=(q-vec2(-3.9,3.35))*vec2(1.,3.4);float gr=length(galaxy);
    cosmos+=vec3(.09,.14,.22)*exp(-gr*2.)*(.6+.4*sin(atan(galaxy.y,galaxy.x)*2.+gr*7.));
    if(back){
      vec2 b=p-vec2(.15,.1);float r=length(b);float angle=atan(b.y,b.x);
      float shadow=1.-smoothstep(.47,.52,r);
      // Thin photon ring, a tilted disk and its bent far-side image; no spinning funnel.
      float photon=line(r-.535,.015);
      float diskR=length(vec2(b.x,b.y*5.8));
      float edge=smoothstep(.54,.70,diskR)*(1.-smoothstep(2.9,3.7,diskR));
      float texture=fbm(vec2(diskR*9.,atan(b.y*5.8,b.x)*3.+t*.09));
      float lanes=.38+texture*.8+sin(diskR*41.+texture*16.)*.035;
      float disk=edge*lanes/(1.+diskR*.55)*(.85+(1.-smoothstep(-1.8,1.8,b.x))*.5);
      float arc=line(r-(.60+.12*sin(angle)),.07)*smoothstep(-.05,.25,b.y);
      float bend=line(r-.73,.035)*(.5+.5*sin(angle*9.+t*.08));
      vec3 hot=mix(vec3(1.15,.43,.16),vec3(1.5,1.16,.7),exp(-diskR*.7));
      cosmos=cosmos*(1.-shadow)+hot*(disk*(1.-shadow)+arc*.7+photon*1.1);
      cosmos+=vec3(.18,.23,.35)*bend*(1.-shadow);
      cosmos+=vec3(.19,.08,.025)*exp(-r*1.25)*(1.-shadow);
    }
    color+=cosmos*uSpace;
  }
  if(uHistory>.001){
    // A restrained, straight Doric portico. These are images on existing screens.
    float col=fract(q.x/1.58+.5)-.5;float columnX=abs(col);
    float taper=mix(.118,.091,smoothstep(.6,3.4,q.y));
    float column=1.-smoothstep(taper,taper+.009,columnX);
    float flute=.72+.28*cos(col*155.);
    float cylinder=sqrt(max(0.,1.-pow(columnX/(taper+.01),2.)));
    float shaft=column*smoothstep(.48,.63,q.y)*(1.-smoothstep(3.28,3.4,q.y));
    float capital=(1.-smoothstep(.16,.173,columnX))*(line(q.y-3.40,.065)+line(q.y-3.29,.045)*.65);
    float plinth=(1.-smoothstep(.145,.158,columnX))*(line(q.y-.56,.075)+line(q.y-.44,.045));
    float entablature=line(q.y-3.67,.16)+line(q.y-3.9,.04);
    float stone=fbm(q*13.);
    float archX=fract((q.x+.79)/1.58)-.5;float archY=q.y-2.4;
    float arch=(1.-smoothstep(.23,.26,abs(archX)))*(1.-smoothstep(.24,.29,length(vec2(archX,max(0.,archY)*.3))));
    vec3 rome=mix(vec3(.068,.043,.029),vec3(.014,.028,.046),arch*.8)+vec3(.10,.065,.035)*fbm(q*1.1);
    float joint=line(fract(q.y*2.1)-.03,.025)*.2;
    rome+=vec3(.31,.22,.135)*(shaft*flute*(.4+cylinder*.6)+capital+plinth+entablature*.65)*(.84+stone*.16-joint);
    float torch=line(columnX-.27,.045)*exp(-pow((q.y-1.7)*2.8,2.));
    rome+=vec3(.9,.33,.045)*torch*(.8+.13*sin(t*7.+q.x*4.)+.07*sin(t*11.));
    float street=1.-smoothstep(.0,.13,q.y-(.68+hash(vec2(floor(q.x*2.),19.))*.65));
    rome*=1.-street*.5;
    if(vWorld.y>4.45){vec2 coffer=abs(fract(q*vec2(.55,.7))-.5);float frame=smoothstep(.33,.41,max(coffer.x,coffer.y));rome=vec3(.095,.062,.034)+vec3(.085,.056,.025)*frame;}
    color+=rome*uHistory;
  }
  if(uClosing>.001){
    // A layered memory of the experiences, with a quiet area above the hero wall.
    float depth=fbm(q*.48+vec2(t*.012,-t*.009));
    vec3 memory=vec3(.012,.026,.044)+vec3(.025,.065,.085)*depth;
    for(int i=0;i<5;i++){
      float fi=float(i);float y=1.9+sin(q.x*.28+t*.025+fi*.21)*.48+sin(q.x*.71-t*.019+fi)*.08+fi*.09;
      float strand=line(q.y-y,.018+fi*.012);
      memory+=mix(vec3(.13,.37,.46),vec3(.5,.32,.13),fi/4.)*strand*(.22+uFocus*.15);
      memory+=vec3(.028,.10,.13)*line(q.y-y,.35)*.28;
    }
    memory+=vec3(.2,.4,.5)*stars(q+vec2(t*.007,0.),22.,83.)*.23;
    memory+=vec3(.09,.21,.22)*line(sin(q.x*.8+sin(q.y+t*.03)),.07)*.12;
    float focal=exp(-pow((q.x-1.25)*.32,2.)-pow((q.y-1.8)*.7,2.));
    memory+=vec3(.05,.14,.18)*focal*(.6+uFocus*.6);
    memory*=.8+.2*fbm(q*8.);
    if(vWorld.y>4.45)memory*=.45;
    color=mix(color,memory,uClosing);
  }
  // Keep edge falloff soft enough that the screen remains an architectural anchor.
  color*=.86+.14*smoothstep(.25,1.1,vWorld.y);
  gl_FragColor=vec4(color*uBrightness*(1.-uFinal*.25),1.);
}`
