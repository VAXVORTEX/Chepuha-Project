const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Replacements
content = content.replace(/documentId/g, 'id');
content = content.replace(/currentRoundDocId/g, 'currentRoundId');

// Fix interface AppState
content = content.replace(/sessionId: string \| null;/g, 'sessionId: number | null;');
content = content.replace(/playerId: string \| null;/g, 'playerId: number | null;');
content = content.replace(/currentRoundId: string \| null;/g, 'currentRoundId: number | null;');
content = content.replace(/myStorySheetId: string \| null;/g, 'myStorySheetId: number | null;');
content = content.replace(/allStorySheets: \{ playerId: string, sheetId: string \}\[\];/g, 'allStorySheets: { playerId: number, sheetId: number }[];');

// Fix creation payloads (remove fake string UUID generation)
content = content.replace(/const uniqueSesId = `ses_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`;/g, '');
content = content.replace(/session_id: uniqueSesId,/g, '');

content = content.replace(/const uniqueHostId = `host_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`;/g, '');
content = content.replace(/player_id: uniqueHostId,/g, '');

content = content.replace(/const uniqueGuestId = `guest_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`;/g, '');
content = content.replace(/player_id: uniqueGuestId,/g, '');

// update sheet creation payload
content = content.replace(/sheet_id: `sheet_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,/g, '');
content = content.replace(/game_session: sessionId,/g, 'game_session_id: sessionId,');
content = content.replace(/player: p\.id,/g, 'player_id: p.id,');

// update round creation payload
content = content.replace(/round_id: `round_` \+ crypto\.randomUUID\(\),/g, '');
content = content.replace(/round_id: `round_\$\{crypto\.randomUUID\(\)\}`,/g, '');


// update submitAnswer payload
content = content.replace(/answer_id: `ans_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,/g, '');
content = content.replace(/player: playerId,/g, 'player_id: playerId,');
content = content.replace(/round: currentRoundId,/g, 'round_id: currentRoundId,');
content = content.replace(/story_sheet: targetSheet,/g, 'story_sheet_id: targetSheet,');

// Fix localeCompare on string IDs -> subtraction on numbers
content = content.replace(/a\.id\.localeCompare\(b\.id\)/g, 'a.id - b.id');

fs.writeFileSync(appTsxPath, content, 'utf8');
console.log('App.tsx updated!');
