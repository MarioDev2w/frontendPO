import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Terminal, Cpu, FolderGit2, FileText, KeyRound, CheckCircle2, 
  Binary, Trash2, ShieldAlert, Command, ArrowRight, ShieldCheck, 
  FileCheck, Radio, Code, Box, Network, FileWarning, X, Activity, 
  Server, Bug, Copy, Lock, Send
} from 'lucide-react';

const ICON_MAP = {
  ShieldAlert, Activity, Server, Terminal, Bug, FileCheck, ShieldCheck, 
  Cpu, Radio, Code, Box, Network, FileWarning, Shield
};

export default function App() {
  const [activeSkillCategory, setActiveSkillCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFindingKey, setActiveFindingKey] = useState(null);
  const [showPgpModal, setShowPgpModal] = useState(false);
  const [showDjangoInfoModal, setShowDjangoInfoModal] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [copiedPgp, setCopiedPgp] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: 'Auditoría de Ciberseguridad / Pentesting',
    message: ''
  });
  
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState('https://mariiov5.pythonanywhere.com/api/v1');
  const [backendStatus, setBackendStatus] = useState('conectando...'); 

  const [cliHistory, setCliHistory] = useState([
    { type: 'info', text: 'Carlos M. Vélez M. [SOC Analyst & Pentesting Audit CLI v1.0]' },
    { type: 'info', text: 'Escribe "help" para ver comandos, "django" para ver la API o "matrix" para efectos.' },
    { type: 'divider', text: '--------------------------------------------------------------------------------' }
  ]);
  const [cliInputValue, setCliInputValue] = useState('');
  const cliOutputRef = useRef(null);
  const [heroTypedText, setHeroTypedText] = useState('');
  const [heroHistory, setHeroHistory] = useState([]);

  useEffect(() => {
    if (cliOutputRef.current) cliOutputRef.current.scrollTop = cliOutputRef.current.scrollHeight;
  }, [cliHistory]);

  const extractSafeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  useEffect(() => {
    const fetchDjangoData = async () => {
      try {
        const [resProjects, resSkills, resFindings] = await Promise.all([
          fetch(`${backendUrl}/projects/`),
          fetch(`${backendUrl}/skills/`),
          fetch(`${backendUrl}/findings/`)
        ]);

        if (resProjects.ok && resSkills.ok && resFindings.ok) {
          const dataProjects = await resProjects.json();
          const dataSkills = await resSkills.json();
          const dataFindings = await resFindings.json();
          
          const safeProjects = extractSafeArray(dataProjects);
          const safeSkills = extractSafeArray(dataSkills);
          const safeFindings = extractSafeArray(dataFindings);

          setProjects(safeProjects);
          setSkills(safeSkills);
          setFindings(safeFindings);
          
          if (safeFindings.length > 0) setActiveFindingKey(safeFindings[0].id);
          setBackendStatus('online');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        console.error("Error conectando con Django API:", error);
        setBackendStatus('offline');
      } finally {
        setLoading(false);
      }
    };
    fetchDjangoData();
  }, [backendUrl]);

  useEffect(() => {
   const lines = [
      { cmd: 'whoami', output: 'Carlos M. Vélez M. [Cybersecurity Analyst & Pentester]' },
      { cmd: 'sudo airmon-ng start wlan0', output: 'Interface wlan0mon is set up in monitor mode.' },
      { cmd: 'nmap -sV target.local', output: 'PORT 443/tcp OPEN ssl/http | Vulnerability Scan: Completed.' }
    ];
    let lineIndex = 0, charIndex = 0, timeoutId = null;

    function typeNextChar() {
      if (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        if (charIndex < currentLine.cmd.length) {
          setHeroTypedText(prev => prev + currentLine.cmd.charAt(charIndex));
          charIndex++;
          timeoutId = setTimeout(typeNextChar, 60);
        } else {
          timeoutId = setTimeout(() => {
            setHeroHistory(prev => [...prev, currentLine]);
            setHeroTypedText('');
            charIndex = 0;
            lineIndex++;
            typeNextChar();
          }, 500);
        }
      } else {
        setHeroTypedText('echo "Sistema listo para auditoría en producción."');
      }
    }
    typeNextChar();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const cmd = cliInputValue.trim().toLowerCase();
    if (!cmd) return;
    setCliInputValue('');
    const newHistory = [...cliHistory, { type: 'cmd', text: cmd }];

    switch (cmd) {
      case 'help': newHistory.push({ type: 'res', content: <div className="space-y-1 text-cyan-400 font-bold">Comandos: whoami, skills, projects, django, matrix, clear</div> }); break;
      case 'whoami': newHistory.push({ type: 'res', text: 'Carlos M. Vélez M. — Analista SOC, Pentester y Especialista en Hacking Ético (Red/Blue Team).' }); break;
      case 'skills': newHistory.push({ type: 'res', text: `Habilidades activas: ${skills.length}` }); break;
      case 'projects': newHistory.push({ type: 'res', text: `Proyectos cargados: ${projects.length}` }); break;
      case 'django': setShowDjangoInfoModal(true); newHistory.push({ type: 'res', text: `Estado: ${backendStatus.toUpperCase()}` }); break;
      case 'matrix': setMatrixActive(!matrixActive); newHistory.push({ type: 'res', text: `Efecto Matrix ${!matrixActive ? 'activado' : 'desactivado'}.` }); break;
      case 'clear': setCliHistory([{ type: 'info', text: 'Pantalla limpiada.' }]); return;
      default: newHistory.push({ type: 'error', text: `zsh: comando no encontrado: ${cmd}` });
    }
    setCliHistory(newHistory);
  };

  const handleCopyPgp = () => {
    navigator.clipboard.writeText(`-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: OpenPGP v2.1.0\n\nmQENBF9Z2xABCAC1J08/Gz/0Y87Fv8yRc2VjLW9wcy1jYXJsb3MtdmVsZXotY2li\nZXJzZWd1cmlkYWRAcG9ydGFmb2xpby5pbnZvY2F0aW9uLXBrZXktMjAyNg==\n-----END PGP PUBLIC KEY BLOCK-----`);
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2500);
  };

  const safeSkillsArray = Array.isArray(skills) ? skills : [];
  const filteredSkills = activeSkillCategory === 'all' ? safeSkillsArray : safeSkillsArray.filter(s => s.category === activeSkillCategory);
  
  const safeFindingsArray = Array.isArray(findings) ? findings : [];
  const activeFinding = safeFindingsArray.find(f => f.id === activeFindingKey) || safeFindingsArray[0];

  const parseToolsSafe = (tools) => {
    if (Array.isArray(tools)) return tools;
    if (typeof tools === 'string') {
      try { return JSON.parse(tools); } catch(e) { return [tools]; }
    }
    return [];
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
        setFormData({ sender_name: '', sender_email: '', subject: 'Auditoría de Ciberseguridad / Pentesting', message: '' });
      } else {
        alert("Error validando los datos en Django. Revisa que todos los campos sean correctos.");
      }
    } catch (error) {
      alert("Error de conexión. Asegúrate de que el servidor de Django esté corriendo.");
    }
  };

  return (
    <div className="bg-[#080c14] text-slate-300 font-sans min-h-screen relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {matrixActive && <MatrixCanvas />}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-slate-100 tracking-wider text-base flex items-center gap-2">
                CMV<span className="text-cyan-400">.SEC</span>
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">SOC & Pentester</span>
            </div>
          </a>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-mono">
            <a href="#hero" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Terminal className="w-4 h-4 text-cyan-400" /> // Inicio</a>
            <a href="#cli" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Command className="w-4 h-4 text-cyan-400" /> // CLI</a>
            <a href="#skills" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Cpu className="w-4 h-4 text-cyan-400" /> // Skills</a>
            <a href="#projects" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><FolderGit2 className="w-4 h-4 text-cyan-400" /> // Cases</a>
            <a href="#report" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4 text-cyan-400" /> // Audit</a>
            <a href="#contact" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-cyan-400" /> // Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowDjangoInfoModal(true)} className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${backendStatus === 'online' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400' : 'bg-red-950/80 border-red-500/40 text-red-400'}`}>
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Django API: {backendStatus.toUpperCase()}</span>
            </button>
            <button onClick={() => setMatrixActive(!matrixActive)} className={`p-2 rounded-lg border transition-all ${matrixActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              <Binary className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 space-y-20 pb-20 pt-12 max-w-7xl mx-auto px-4">
        
        <section id="hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 font-mono text-xs shadow-sm">
                <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>CIBERSEGURIDAD</span>
              </div>
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Carlos M. Vélez M.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-3xl sm:text-4xl lg:text-5xl mt-2 font-mono">
                  SOC Analyst & Pentester
                </span>
              </h1>
              
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                Especialista con enfoque en <strong className="text-slate-200">Defensa Activa</strong>, <strong className="text-slate-200">Hacking Ético </strong> y análisis de vulnerabilidades. Transformo los hallazgos de auditorías de infraestructura, redes y sistemas en controles de seguridad accionables y verificables.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a href="#projects" className="px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-mono font-bold text-sm flex items-center gap-2 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 transition-all">
                  <FolderGit2 className="w-4 h-4" /> Ver Case Studies
                </a>
                <a href="#cli" className="px-6 py-3 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono font-medium text-sm flex items-center gap-2 hover:bg-slate-800 hover:border-cyan-400 transition-all">
                  <Terminal className="w-4 h-4" /> Consola CLI
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-cyan-500/30 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="ml-2 text-slate-400 text-xs">carlos@root:~</span>
                  </div>
                </div>
                <div className="p-5 space-y-3 min-h-[300px] bg-slate-950 text-slate-300">
                  <div className="text-slate-500">// Verificación de entorno de ciberseguridad...</div>
                  {heroHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center text-cyan-400">
                        <span className="text-emerald-400 mr-2">carlos@root:~$</span> {item.cmd}
                      </div>
                      <div className="text-slate-300 pl-4 py-1 text-xs border-l-2 border-cyan-500/50 bg-slate-900/50 rounded-r">
                        {item.output}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center text-cyan-400">
                    <span className="text-emerald-400 mr-2">carlos@root:~$</span>
                    <span>{heroTypedText}</span>
                    <span className="w-2 h-4 bg-cyan-400 inline-block animate-pulse ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cli">
          <div className="max-w-4xl mx-auto rounded-xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-400" /><span className="text-slate-200 font-bold">zsh - react-django-cli</span></div>
              <button onClick={() => setCliHistory([{ type: 'info', text: 'Pantalla limpiada.' }])} className="text-slate-400 hover:text-cyan-400 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
            </div>
            <div ref={cliOutputRef} className="p-5 h-64 overflow-y-auto space-y-2 text-slate-300 bg-slate-950">
              {cliHistory.map((item, index) => {
                if (item.type === 'cmd') return <div key={index} className="flex items-center text-cyan-400 mt-2"><span className="text-emerald-400 mr-2">carlos@root:~$</span> {item.text}</div>;
                if (item.type === 'error') return <div key={index} className="text-red-400 pl-2">{item.text}</div>;
                if (item.type === 'res') return <div key={index} className="pl-2 text-slate-300 my-1">{item.text || item.content}</div>;
                return <div key={index} className="text-slate-500">{item.text}</div>;
              })}
            </div>
            <form onSubmit={handleCliSubmit} className="bg-slate-900/90 border-t border-slate-800 p-3 flex items-center gap-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><span>carlos@root</span><span className="text-cyan-400">:~$</span></span>
              <input type="text" value={cliInputValue} onChange={(e) => setCliInputValue(e.target.value)} placeholder="Escribe 'help'..." className="w-full bg-transparent text-slate-100 focus:outline-none" />
            </form>
          </div>
        </section>

        <section id="skills">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl font-bold text-white"><Cpu className="w-5 h-5 inline-block text-emerald-400 mr-2" /> Stack Técnico </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8 font-mono text-xs">
            {[{ id: 'all', label: '[Todas]' }, { id: 'blue', label: 'Blue Team' }, { id: 'red', label: 'Pentesting' }, { id: 'grc', label: 'GRC' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveSkillCategory(tab.id)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeSkillCategory === tab.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="text-cyan-400 font-mono col-span-3 text-center">Cargando...</p> : 
             filteredSkills.length === 0 ? <p className="text-slate-500 font-mono col-span-3 text-center border p-4 border-slate-800 rounded">Sin datos en Django para esta categoría.</p> :
             filteredSkills.map(skill => {
              const DynamicIcon = ICON_MAP[skill?.icon_name] || Shield;
              return (
                <div key={skill.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0"><DynamicIcon className="w-5 h-5" /></div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm">{skill.name || 'Desconocido'}</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{skill.description || 'Sin descripción.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="projects">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl font-bold text-white"><FolderGit2 className="w-5 h-5 inline-block text-cyan-400 mr-2" /> Casos de Estudio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? <p className="text-cyan-400 font-mono col-span-2 text-center">Cargando...</p> : 
             !Array.isArray(projects) || projects.length === 0 ? <p className="text-slate-500 font-mono col-span-2 text-center border border-dashed border-slate-700 p-8 rounded-lg">Base de datos vacía o inalcanzable.</p> :
             projects.map(project => (
              <div key={project.id} className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 flex flex-col justify-between space-y-6 transition-all">
                <div className="space-y-4">
                  <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs">{project.category_display || 'N/A'}</span>
                  <h3 className="text-xl font-bold text-white">{project.title || 'Proyecto sin título'}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{project.summary || '...'}</p>
                  <div className="flex flex-wrap gap-2 font-mono text-xs pt-2">
                    {parseToolsSafe(project.tools_used).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> API Sync</span>
                  <button onClick={() => setSelectedProject(project)} className="px-4 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-mono text-xs transition-all">
                    Ver Estudio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="report">
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs mb-2">
                  <FileWarning className="w-3.5 h-3.5" /> HALLAZGOS SANEADOS
                </div>
                <h2 className="text-2xl font-bold text-white">Visor de Vulnerabilidades </h2>
              </div>
            </div>

            {findings.length > 0 && activeFinding ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                <div className="lg:col-span-4 space-y-3 font-mono text-xs">
                  {findings.map(finding => (
                    <button
                      key={finding.id}
                      onClick={() => setActiveFindingKey(finding.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                        activeFindingKey === finding.id ? 'bg-slate-900 border-cyan-500 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-cyan-400">{finding.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{finding.target_component}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]">CVSS {finding.cvss_score}</span>
                    </button>
                  ))}
                </div>
                <div className="lg:col-span-8 bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-red-400 font-bold text-sm">[{activeFinding.severity_display}] {activeFinding.title}</span>
                      <div className="text-slate-400 text-xs mt-0.5">{activeFinding.target_component}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-bold">CVSS {activeFinding.cvss_score}</span>
                  </div>
                  <p className="text-slate-300"><strong>Descripción:</strong> {activeFinding.vulnerability_description}</p>
                  <p className="text-slate-300"><strong>Remediación Recomendada:</strong> {activeFinding.remediation_steps}</p>
                </div>
              </div>
            ) : (
               <p className="text-slate-500 font-mono pt-6">No hay hallazgos registrados en la base de datos.</p>
            )}
          </div>
        </section>
        {/* CONTACT SECTION (POST to Django) */}
        <section id="contact">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
                <KeyRound className="w-3.5 h-3.5" /><span>CANAL SEGURO</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Establecer Comunicación</h2>
              
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-bold text-xs flex items-center gap-1.5"><Lock className="w-4 h-4" /> LLAVE PÚBLICA PGP</span>
                  <span className="text-[10px] text-slate-500 font-mono">FINGERPRINT: 4A89 FC12</span>
                </div>
                <button onClick={() => setShowPgpModal(true)} className="w-full py-2 px-3 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2">
                  <Copy className="w-3.5 h-3.5" /> Ver &amp; Copiar PGP Public Key
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800">
              {formSubmitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto"><CheckCircle2 className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold text-white font-mono">¡Mensaje Transmitido a Django!</h3>
                  <p className="text-slate-400 text-sm">Tu requerimiento ha sido insertado en la base de datos PostgreSQL/SQLite vía DRF.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 block font-bold">Nombre / Entidad *</label>
                      <input type="text" required value={formData.sender_name} onChange={e => setFormData({...formData, sender_name: e.target.value})} placeholder="Ej: Empresa S.A." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 block font-bold">Correo Electrónico *</label>
                      <input type="email" required value={formData.sender_email} onChange={e => setFormData({...formData, sender_email: e.target.value})} placeholder="correo@empresa.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 block font-bold">Tipo de Servicio</label>
                    <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-400">
                      <option>Auditoría de Ciberseguridad / Pentesting</option>
                      <option>Despliegue SOC / Wazuh SIEM</option>
                      <option>Desarrollo API REST en Django / SecOps</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 block font-bold">Mensaje / Detalle *</label>
                    <textarea rows="4" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Describe el alcance técnico..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold font-mono text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Ejecutar POST hacia Django
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        
        

        

      </main>
{selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
          <div className="max-w-3xl w-full bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 font-sans">
            
            <div className="bg-slate-900 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs">{selectedProject.category_display}</span>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
              
              {/* SECCIÓN DE IMAGEN CORREGIDA */}
              {selectedProject.architecture_image && (
                <div className="w-full h-48 sm:h-72 rounded-xl overflow-hidden border border-slate-800 mb-4">
                  <img 
                    src={selectedProject.architecture_image} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
                  />
                </div>
              )}

              <h3 className="text-xl font-bold text-white font-mono">{selectedProject.title}</h3>
              
              <div><h4 className="text-cyan-400 font-mono font-bold text-xs uppercase mb-1">1. Diagnóstico</h4><p>{selectedProject.problem_diagnosis}</p></div>
              <div><h4 className="text-emerald-400 font-mono font-bold text-xs uppercase mb-1">2. Solución</h4><p>{selectedProject.architecture_description}</p></div>

              {/* BOTÓN DEL PDF CORREGIDO */}
              {selectedProject.pdf_report && (
                <div className="pt-6 mt-4 border-t border-slate-800">
                  <a 
                    href={selectedProject.pdf_report} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-slate-950 font-mono text-xs font-bold transition-all shadow-lg shadow-red-500/10"
                  >
                    <FileText className="w-4 h-4" /> VER REPORTE TÉCNICO (PDF)
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {showPgpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="max-w-xl w-full bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl p-5 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-amber-400 font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> PGP PUBLIC KEY</span>
              <button onClick={() => setShowPgpModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <textarea readOnly value={`-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: OpenPGP v2.1.0\n\nmQENBF9Z2xABCAC1J08/Gz/0Y87Fv8yRc2VjLW9wcy1jYXJsb3MtdmVsZXotY2li\nZXJzZWd1cmlkYWRAcG9ydGFmb2xpby5pbnZvY2F0aW9uLXBrZXktMjAyNg==\n-----END PGP PUBLIC KEY BLOCK-----`} className="w-full h-36 bg-slate-900 border border-slate-800 rounded p-3 text-slate-300 font-mono text-[11px] focus:outline-none resize-none" />
            <div className="flex items-center justify-between">
              {copiedPgp ? <span className="text-emerald-400">✓ Copiada</span> : <span />}
              <button onClick={handleCopyPgp} className="px-4 py-2 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Copiar Key</button>
            </div>
          </div>
        </div>
      )}

      {showDjangoInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm"><Server className="w-4 h-4" /><span>INTEGRACIÓN DJANGO REST FRAMEWORK (DRF)</span></div>
              <button onClick={() => setShowDjangoInfoModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-white block">URL del Endpoint Django API:</label>
                <input type="text" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-cyan-300 font-mono focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
    
  );


}

function MatrixCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '0123456789ABCDEFDJANGO-REST-SECOPS';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(8, 12, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#06b6d4';
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 opacity-15 pointer-events-none" />;
}