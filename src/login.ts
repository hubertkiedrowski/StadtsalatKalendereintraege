// 1. Hole die Login-Seite (GET-Request)
async function fetchLoginPage() {
  const response = await fetch('https://shyftplan.com/login', {
    method: 'GET',
    credentials: 'include',  // Wichtig, um Session-Cookies zu erhalten
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    console.error(`Login-Seite konnte nicht abgerufen werden: ${response.statusText}`);
    return null;
  }

  return await response.text();
}

// 2. Extrahiere den `authenticity_token` aus der HTML-Antwort
function extractAuthToken(html: string): string | null {
  const regex = /name="authenticity_token" value="([^"]+)"/;
  const match = html.match(regex);

  if (match) {
    return match[1];  // Gibt den Token zurück
  } else {
    console.error("Kein Authentifizierungs-Token gefunden.");
    return null;
  }
}

// 3. Sende den Login-POST-Request
async function login() {
  const html = await fetchLoginPage();
  if (!html) return;

  const authenticityToken = extractAuthToken(html);
  if (!authenticityToken) {
    console.error("Authentifizierungs-Token konnte nicht extrahiert werden.");
    return;
  }

  // 4. Sende die Login-Daten
  const loginUrl = 'https://shyftplan.com/login';
  const loginData = {
    authenticity_token: authenticityToken,
    'user[email]': 'hubert.kiedr%40gmail.com',  // URL-kodierte E-Mail
    'user[password]': 'sicherespasswort',  // Passwort
    'user[remember_me]': 'true',
    commit: 'Anmelden',
  };

  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(loginData)) {
    formData.append(key, value);
  }

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    body: formData,
    credentials: 'include',
  });

  if (response.ok) {
    console.log('Login erfolgreich');
    await fetchCsvData();
  } else {
    console.error('Login fehlgeschlagen');
    const errorPage = await response.text();
    console.log('Fehlermeldung:', errorPage);
  }
}

// 4. Request für die CSV-Daten (sicherstellen, dass Cookies und Authentifizierung richtig gesetzt sind)
async function fetchCsvData() {
  const csvUrl = 'https://shyftplan.com/companies/14233-stadtsalat-gmbh-hamburg/evaluations.csv?search%5Bemp_status%5D%5B%5D=inactive&search%5Bemp_status%5D%5B%5D=active&search%5Bemp_status%5D%5B%5D=noemail&search%5Bend_date%5D=2025-12-31&search%5Blive_status%5D%5B%5D=working&search%5Blive_status%5D%5B%5D=break&search%5Blive_status%5D%5B%5D=overtime&search%5Blive_status%5D%5B%5D=done&search%5Blive_status%5D%5B%5D=late&search%5Blive_status%5D%5B%5D=starting_soon&search%5Blive_status%5D%5B%5D=no_show&search%5Border%5D=descending&search%5Bpage%5D=1&search%5Bposition_status%5D%5B%5D=deleted&search%5Bposition_status%5D%5B%5D=undeleted&search%5Bsort%5D=evaluation_starts_at&search%5Bstart_date%5D=2025-01-01';

  const response = await fetch(csvUrl, {
    method: 'GET',
    credentials: 'include',  // Session-Cookies beibehalten
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
      'Accept': 'text/csv',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (response.ok) {
    const csvData = await response.text();
    console.log('CSV-Daten:', csvData);
  } else {
    console.error('CSV-Daten konnten nicht abgerufen werden:', response.statusText);
  }
}

// Login-Prozess starten
login();
