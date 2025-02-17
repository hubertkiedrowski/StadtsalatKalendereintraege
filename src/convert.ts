import * as fs from 'fs';

function formatToICalDateTime(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00';
}

// Funktion zum Erstellen der ICS-Datei mit korrekter `VEVENT`-Struktur und Zeitzone
export function createICS(events: any[], outputFilePath: string) {
  const icsEvents = events.map(event => `
BEGIN:VEVENT
SUMMARY:${event.summary}
DTSTART;TZID=Europe/Berlin:${formatToICalDateTime(event.startDate, event.startTime)}
DTEND;TZID=Europe/Berlin:${formatToICalDateTime(event.endDate, event.endTime)}
LOCATION:${event.location}
END:VEVENT`).join('\r\n');

  const icsData = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//CSV to ICS Converter//DE\r
CALSCALE:GREGORIAN\r
${icsEvents}\r
END:VCALENDAR\r`;

  // ICS-Datei speichern
  fs.writeFileSync(outputFilePath, icsData, 'utf8');
  console.log('ICS-Datei erfolgreich gespeichert.');
}
