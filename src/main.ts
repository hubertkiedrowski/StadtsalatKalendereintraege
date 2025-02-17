import { createICS } from './convert';
import { parseCSV } from './parseCsv';

const csvFilePath = 'events.csv'; // Deine CSV-Datei
const icsFilePath = 'events.ics'; // Die generierte ICS-Datei

async function main() {
  try {
    // CSV-Datei parsen und Ereignisse extrahieren
    const events = await parseCSV(csvFilePath);

    // ICS-Datei erstellen (ohne JSON.stringify!)
    createICS(events, icsFilePath);
  } catch (error) {
    console.error('Fehler beim Verarbeiten der CSV-Datei:', error);
  }
}

// Hauptfunktion ausführen
main();
