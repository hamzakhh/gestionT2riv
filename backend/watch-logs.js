import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, 'logs');
const combinedLogPath = path.join(logDir, 'combined.log');
const errorLogPath = path.join(logDir, 'error.log');

// Fonction pour lire les dernières lignes d'un fichier
function tailFile(filePath, lines = 20) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Le fichier ${filePath} n'existe pas encore.`);
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const allLines = content.split('\n').filter(line => line.trim());
    return allLines.slice(-lines);
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour parser et afficher les logs JSON
function displayLogs(lines, filter = null) {
  lines.forEach(line => {
    if (!line.trim()) return;
    
    try {
      const log = JSON.parse(line);
      const level = log.level || 'info';
      const message = log.message || '';
      const timestamp = log.timestamp || '';
      
      // Filtrer si nécessaire
      if (filter && !message.toLowerCase().includes(filter.toLowerCase())) {
        return;
      }
      
      // Couleurs pour la console
      const colors = {
        error: '\x1b[31m', // Rouge
        warn: '\x1b[33m',  // Jaune
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[90m'  // Gris
      };
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      
      console.log(`${color}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}`);
    } catch (e) {
      // Si ce n'est pas du JSON, afficher tel quel
      if (line.trim()) {
        console.log(line);
      }
    }
  });
}

// Fonction principale
function watchLogs(filter = null, watchMode = false) {
  console.log('📋 Surveillance des logs backend\n');
  console.log('Appuyez sur Ctrl+C pour quitter\n');
  
  if (watchMode) {
    console.log('👀 Mode surveillance active - Les nouveaux logs s\'afficheront automatiquement\n');
    
    // Afficher les logs existants
    const combinedLines = tailFile(combinedLogPath, 20);
    if (combinedLines.length > 0) {
      console.log('📄 Derniers logs (combined.log):');
      displayLogs(combinedLines, filter);
      console.log('\n' + '─'.repeat(60) + '\n');
    }
    
    // Surveiller les changements
    let lastSize = {
      combined: fs.existsSync(combinedLogPath) ? fs.statSync(combinedLogPath).size : 0,
      error: fs.existsSync(errorLogPath) ? fs.statSync(errorLogPath).size : 0
    };
    
    setInterval(() => {
      if (fs.existsSync(combinedLogPath)) {
        const currentSize = fs.statSync(combinedLogPath).size;
        if (currentSize > lastSize.combined) {
          const newLines = tailFile(combinedLogPath, 1);
          if (newLines.length > 0) {
            displayLogs(newLines, filter);
          }
          lastSize.combined = currentSize;
        }
      }
      
      if (fs.existsSync(errorLogPath)) {
        const currentSize = fs.statSync(errorLogPath).size;
        if (currentSize > lastSize.error) {
          const newLines = tailFile(errorLogPath, 1);
          if (newLines.length > 0) {
            console.log('\x1b[31m[ERREUR]\x1b[0m');
            displayLogs(newLines);
          }
          lastSize.error = currentSize;
        }
      }
    }, 1000); // Vérifier toutes les secondes
  } else {
    // Mode affichage unique
    console.log('📄 Derniers logs (combined.log):');
    const combinedLines = tailFile(combinedLogPath, 30);
    displayLogs(combinedLines, filter);
    
    if (fs.existsSync(errorLogPath)) {
      const errorLines = tailFile(errorLogPath, 10);
      if (errorLines.length > 0) {
        console.log('\n📄 Dernières erreurs (error.log):');
        displayLogs(errorLines);
      }
    }
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const filter = args.find(arg => arg.startsWith('--filter='))?.split('=')[1] || null;
const watch = args.includes('--watch') || args.includes('-w');

watchLogs(filter, watch);
