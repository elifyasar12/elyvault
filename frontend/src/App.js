import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, fetchUserAttributes } from 'aws-amplify/auth';
import './App.css';

const API = 'http://localhost:5001/api/files';

function getExt(filename) {
  return filename.split('.').pop().toLowerCase();
}

function getFileClass(filename) {
  const ext = getExt(filename);
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'p';
  if (['pdf'].includes(ext)) return 'r';
  if (['txt','md','doc','docx'].includes(ext)) return 't';
  if (['mp4','mov','avi'].includes(ext)) return 'g';
  return 'b';
}

function AnimatedBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId, particles = [], orbs = [], W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function init() {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2 + 0.5,
          col: Math.random() > 0.6 ? '0,255,229' : Math.random() > 0.5 ? '192,132,252' : '244,114,182',
          a: Math.random() * 0.8 + 0.3
        });
      }
      orbs = [];
      for (let i = 0; i < 5; i++) {
        orbs.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 150 + 100,
          col: i % 3 === 0 ? '0,255,229' : i % 3 === 1 ? '192,132,252' : '244,114,182'
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#00ffe512';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 55) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 55) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r || o.x > W + o.r) o.vx *= -1;
        if (o.y < -o.r || o.y > H + o.r) o.vy *= -1;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.col},.22)`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,229,${0.12 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col},${p.a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} id="bg" />;
}

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [clock, setClock] = useState('');

  useEffect(() => {
    checkUser();
    const t = setInterval(() => {
      const n = new Date();
      setClock(n.toISOString().replace('T', ' ').slice(0, 19));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const checkUser = async () => {
    try {
      const u = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      setUser({ ...u, displayName: attrs.email });
      fetchFiles();
    } catch { setUser(null); }
  };

  const handleSignUp = async () => {
    setAuthError('');
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      setAuthMode('confirm');
    } catch (err) { setAuthError(err.message); }
  };

  const handleConfirm = async () => {
    setAuthError('');
    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode });
      setAuthMode('login');
      setMessage('ACCOUNT_CONFIRMED // PROCEED TO LOGIN');
    } catch (err) { setAuthError(err.message); }
  };

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signIn({ username: email, password });
      await checkUser();
    } catch (err) { setAuthError(err.message); }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null); setFiles([]);
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/list`);
      setFiles(res.data);
    } catch { setMessage('ERR: FAILED TO FETCH VAULT CONTENTS'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${API}/upload`, formData);
      setMessage('UPLOAD_SUCCESS // FILE ENCRYPTED & STORED');
      fetchFiles();
    } catch { setMessage('ERR: UPLOAD FAILED'); }
    setUploading(false);
  };

  const handleDownload = async (key) => {
    try {
      const res = await axios.get(`${API}/download/${encodeURIComponent(key)}`);
      window.open(res.data.url, '_blank');
    } catch { setMessage('ERR: DOWNLOAD FAILED'); }
  };

  const handleShare = async (key) => {
    try {
      const res = await axios.get(`${API}/download/${encodeURIComponent(key)}`);
      navigator.clipboard.writeText(res.data.url);
      setMessage('LINK_COPIED // EXPIRES IN 3600s');
    } catch { setMessage('ERR: SHARE FAILED'); }
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete(`${API}/delete/${encodeURIComponent(key)}`);
      setMessage('FILE_PURGED // VAULT UPDATED');
      fetchFiles();
    } catch { setMessage('ERR: DELETE FAILED'); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1048576).toFixed(1) + 'MB';
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  if (!user) {
    return (
      <div className="vx">
        <AnimatedBg />
        <div className="ui auth-wrap">
          <div className="auth-logo">
            <div className="auth-logo-mark">⬡</div>
            <div>
              <div className="auth-logo-text">ELYVAULT</div>
              <div className="auth-logo-sub">encrypted cloud storage</div>
            </div>
          </div>
          {authError && <div className="auth-error" style={{width:'100%',maxWidth:400,marginBottom:12}}>{authError}</div>}
          {message && <div className="auth-msg">{message}</div>}
          {authMode === 'login' && (
            <div className="auth-box">
              <h2>// AUTHENTICATION REQUIRED</h2>
              <input type="email" placeholder="USER_EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} />
              <button className="auth-btn" onClick={handleSignIn}>AUTHENTICATE →</button>
              <p className="switch-link" onClick={() => setAuthMode('signup')}>// NO ACCOUNT? REGISTER_NEW_USER</p>
            </div>
          )}
          {authMode === 'signup' && (
            <div className="auth-box">
              <h2>// CREATE_NEW_ACCOUNT</h2>
              <input type="email" placeholder="USER_EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="PASSWORD (MIN 8 CHARS)" value={password} onChange={e => setPassword(e.target.value)} />
              <button className="auth-btn" onClick={handleSignUp}>CREATE_ACCOUNT →</button>
              <p className="switch-link" onClick={() => setAuthMode('login')}>// ALREADY REGISTERED? LOGIN</p>
            </div>
          )}
          {authMode === 'confirm' && (
            <div className="auth-box">
              <h2>// VERIFY_EMAIL_TOKEN</h2>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:'#3a4a60',letterSpacing:'.08em'}}>CHECK INBOX: {email}</p>
              <input type="text" placeholder="CONFIRM_CODE" value={confirmCode} onChange={e => setConfirmCode(e.target.value)} />
              <button className="auth-btn" onClick={handleConfirm}>VERIFY →</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vx">
      <AnimatedBg />
      <div className="ui">
        <div className="topbar">
          <div className="logo">
            <div className="logo-mark">⬡</div>
            <div>
              <div className="logo-text">ELYVAULT</div>
              <div className="logo-sub">encrypted cloud storage</div>
            </div>
          </div>
          <div className="rbar">
            <div className="dot"></div>
            <div className="stxt">SYS_ONLINE</div>
            <div className="uchip">{user.displayName || user.username}</div>
            <button className="sout" onClick={handleSignOut}>SIGN_OUT</button>
          </div>
        </div>
        <div className="main">
          <div className="hdr">
            <div>
              <div className="htitle">File Vault</div>
              <div className="hsub">// AES-256 · AWS S3 · PRESIGNED URLS</div>
            </div>
            <div className="htime">{clock}</div>
          </div>
          <div className="metrics">
            <div className="mc c1">
              <div className="mv">{String(files.length).padStart(2,'0')}</div>
              <div className="ml">Total files</div>
              <div className="ma">ENCRYPTED</div>
            </div>
            <div className="mc c2">
              <div className="mv">{formatSize(totalSize)}</div>
              <div className="ml">Storage used</div>
              <div className="ma">S3_ACTIVE</div>
            </div>
            <div className="mc c3">
              <div className="mv">AWS</div>
              <div className="ml">Cloud provider</div>
              <div className="ma">COGNITO_AUTH</div>
            </div>
          </div>
          {message && <div className="msg" onClick={() => setMessage('')}>&gt; {message}</div>}
          <div className="uz">
            <div className="uzi">⬆</div>
            <div className="uzt">Drop files to encrypt & upload</div>
            <div className="uzs">// ALL FILE TYPES · INSTANT ENCRYPTION · AWS S3</div>
            <label className="uzb">
              {uploading ? '⏳ UPLOADING...' : '+ INIT_UPLOAD'}
              <input type="file" onChange={handleUpload} hidden />
            </label>
          </div>
          <div className="shr">
            <div className="sl"></div>
            <div className="st">VAULT CONTENTS · {files.length} OBJECTS</div>
            <div className="sl"></div>
          </div>
          <div className="file-list">
            {files.length === 0 ? (
              <div className="empty">// VAULT IS EMPTY · UPLOAD_FIRST_FILE</div>
            ) : (
              files.map(file => {
                const name = file.key.split('-').slice(5).join('-') || file.key;
                const ext = getExt(name).toUpperCase();
                return (
                  <div className={`fc ${getFileClass(name)}`} key={file.key}>
                    <div className="fi">{ext.slice(0,4)}</div>
                    <div className="fm">
                      <div className="fn">{name}</div>
                      <div className="fd">{formatSize(file.size)} · {new Date(file.lastModified).toISOString().slice(0,10)} · {ext.toLowerCase()}</div>
                      <div className="fh">KEY: {file.key.slice(0,32)}...</div>
                    </div>
                    <div className="fa2">
                      <button className="fb dl" onClick={() => handleDownload(file.key)}>↓ GET</button>
                      <button className="fb sh" onClick={() => handleShare(file.key)}>⬡ SHARE</button>
                      <button className="fb rm" onClick={() => handleDelete(file.key)}>✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;