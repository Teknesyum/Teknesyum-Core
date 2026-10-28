#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { stateFile, read, write, lang, settings, safe } = require('./lib.js');

const EN_COK = 12 * 3600000;
const SOZ = {
  tr: { baslik: 'Bekleniyor', dk: 'dk', son: 'son' },
  en: { baslik: 'Waiting on', dk: 'min', son: 'last' },
};

function soz() {
  return SOZ[lang()] || SOZ.en;
}

function ara() {
  const env = process.env.TEKNESYUM_BEKLE_ARA;
  if (env !== undefined) return Number(env) * 60000;
  const m = Number(settings().bekleAra);
  return (m > 0 ? m : 10) * 60000;
}

function dosya(sid) {
  return stateFile('bekle-' + safe(String(sid || 'none')));
}

function cikti(transcript, id) {
  if (!transcript) return '';
  return path.join(os.tmpdir(), 'claude', path.basename(path.dirname(transcript)), path.basename(transcript, '.jsonl'), 'tasks', id + '.output');
}

function kuyruk(file, n) {
  try {
    const fd = fs.openSync(file, 'r');
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, n);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

function sonSatir(file) {
  const l = kuyruk(file, 4096).split(/\r?\n/).map((s) => s.trim()).filter(Boolean).pop() || '';
  return l.length > 80 ? l.slice(0, 77) + '...' : l;
}

function bitti(is) {
  if (Date.now() - is.at > EN_COK) return true;
  const tail = kuyruk(is.transcript, 512 * 1024);
  return tail.includes('<task-id>' + is.id + '</task-id>');
}

function kaydet(j) {
  const res = j.tool_response || {};
  const id = res.backgroundTaskId;
  if (!id) return null;
  const input = j.tool_input || {};
  const is = {
    id,
    ad: String(input.description || input.command || id).slice(0, 80),
    cikti: cikti(j.transcript_path, id),
    transcript: j.transcript_path || '',
    at: Date.now(),
  };
  const f = dosya(j.session_id);
  const list = (read(f) || []).filter((x) => x.id !== id);
  list.push(is);
  write(f, list);
  if (!process.env.TEKNESYUM_BEKLE_IZLEME) {
    try { spawn(process.execPath, [__filename, 'izle', String(j.session_id || 'none'), id], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch {}
  }
  return is;
}

function acik(sid) {
  const f = dosya(sid);
  const list = read(f) || [];
  const kalan = list.filter((x) => !bitti(x));
  if (kalan.length !== list.length) write(f, kalan);
  return kalan;
}

function satir(is) {
  const s = soz();
  const dk = Math.max(1, Math.round((Date.now() - is.at) / 60000));
  const son = sonSatir(is.cikti);
  return is.ad + ' · ' + dk + ' ' + s.dk + (son ? ' · ' + s.son + ': ' + son : '');
}

function durum(sid) {
  const list = acik(sid);
  if (!list.length) return '';
  return 'Background jobs still running (tell the owner in one line if they ask what you are waiting on): ' + list.map(satir).join(' | ');
}

function bildir(baslik, metin) {
  if (process.env.TEKNESYUM_BEKLE_SESSIZ) return false;
  const q = (s) => String(s).replace(/'/g, "''");
  if (process.platform === 'win32') {
    const ps = "[Windows.UI.Notifications.ToastNotificationManager,Windows.UI.Notifications,ContentType=WindowsRuntime]|Out-Null;" +
      "$x=[Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02);" +
      "$t=$x.GetElementsByTagName('text');$t.Item(0).InnerText='" + q(baslik) + "';$t.Item(1).InnerText='" + q(metin) + "';" +
      "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show([Windows.UI.Notifications.ToastNotification]::new($x))";
    return spawnSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'ignore', windowsHide: true, timeout: 15000 }).status === 0;
  }
  if (process.platform === 'darwin') return spawnSync('osascript', ['-e', 'display notification "' + metin.replace(/"/g, "'") + '" with title "' + baslik.replace(/"/g, "'") + '"'], { stdio: 'ignore', timeout: 15000 }).status === 0;
  return spawnSync('notify-send', [baslik, metin], { stdio: 'ignore', timeout: 15000 }).status === 0;
}

function tur(sid, id) {
  const is = acik(sid).find((x) => x.id === id);
  if (!is) return '';
  const metin = satir(is);
  bildir('Teknesyum Core · ' + soz().baslik, metin);
  return metin;
}

function izle(sid, id) {
  const bekle = Math.max(1000, ara());
  const adim = () => {
    if (!tur(sid, id)) return;
    setTimeout(adim, bekle);
  };
  setTimeout(adim, bekle);
}

if (require.main === module && process.argv[2] === 'izle') izle(process.argv[3], process.argv[4]);

module.exports = { kaydet, acik, durum, satir, tur, bitti, cikti, sonSatir, dosya };
