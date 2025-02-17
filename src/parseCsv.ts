import * as fs from 'fs';
import { parse } from 'csv-parse';

interface Event {
  summary: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
}

function formatToICalDateTime(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00';
}

export function parseCSV(filePath: string): Promise<Event[]> {
  return new Promise((resolve, reject) => {
    const events: Event[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ';', columns: true, trim: true })) // Semikolon als Trennzeichen
      .on('data', (row) => {
        events.push({
          summary: `Arbeit Rider ${row["Standort"]}`,
          startDate: row["Soll-Start (Tag)"],
          startTime: row["Soll-Start (Uhrzeit)"],
          endDate: row["Soll-Ende (Tag)"],
          endTime: row["Soll-Ende (Uhrzeit)"],
          location: row["Standort"],
        });
      })
      .on('end', () => resolve(events))
      .on('error', (err) => reject(err));
  });
}

async function convertCSVtoICS(csvPath: string, icsPath: string) {
  try {
    const events = await parseCSV(csvPath);
    const icsData = generateICS(events);
    fs.writeFileSync(icsPath, icsData, 'utf8');
    console.log(`ICS-Datei erfolgreich gespeichert: ${icsPath}`);
  } catch (error) {
    console.error('Fehler beim Verarbeiten der CSV-Datei:', error);
  }
}

function generateICS(events: Event[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CSV to ICS Converter//EN',
    'CALSCALE:GREGORIAN'
  ];

  events.forEach(event => {
    lines.push(
      'BEGIN:VEVENT',
      `SUMMARY:${event.summary}`,
      `DTSTART:${formatToICalDateTime(event.startDate, event.startTime)}Z`,
      `DTEND:${formatToICalDateTime(event.endDate, event.endTime)}Z`,
      `LOCATION:${event.location}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n'); // CRLF-Zeilenumbrüche
}

const csvFilePath = 'shifts.csv'; // Datei mit Semikolon-Trennung
const icsFilePath = 'shifts.ics';

convertCSVtoICS(csvFilePath, icsFilePath);
